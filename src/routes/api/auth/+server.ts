import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import bcrypt from 'bcryptjs';

// --- Rate limiting (in-memory, per IP) ---
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = loginAttempts.get(ip);
    if (!entry || now > entry.resetAt) {
        loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return false;
    }
    entry.count++;
    return entry.count > MAX_ATTEMPTS;
}

// POST /api/auth/login
export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
    const clientIp = getClientAddress();
    if (isRateLimited(clientIp)) {
        return json({ error: 'Too many attempts. Please wait a minute.' }, { status: 429 });
    }

    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    const { username, password } = await request.json();

    try {
        const rows = await db`SELECT * FROM admin_users WHERE username = ${username}` as Record<string, unknown>[];
        const user = rows[0];
        if (!user) {
            return json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, user.password_hash as string);
        if (!valid) {
            return json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create session using Web Crypto API (edge-compatible)
        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        const sessionId = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await db`
			INSERT INTO sessions (id, user_id, expires_at)
			VALUES (${sessionId}, ${user.id as number}, ${expiresAt.toISOString()})
		`;

        const isProduction = process.env.NODE_ENV === 'production';

        cookies.set('session', sessionId, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: isProduction,
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        // Clear rate limit on successful login
        loginAttempts.delete(clientIp);

        return json({ success: true, username: user.username });
    } catch (e) {
        console.error('Login error:', e);
        return json({ error: 'Login failed' }, { status: 500 });
    }
};

// DELETE /api/auth/login — Logout
export const DELETE: RequestHandler = async ({ cookies }) => {
    const db = getDb();
    const sessionId = cookies.get('session');

    if (sessionId && db) {
        try {
            await db`DELETE FROM sessions WHERE id = ${sessionId}`;
        } catch (e) {
            // ignore
        }
    }

    cookies.delete('session', { path: '/' });
    return json({ success: true });
};
