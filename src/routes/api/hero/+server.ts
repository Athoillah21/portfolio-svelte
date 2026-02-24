import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';

// GET /api/hero — Get hero content
export const GET: RequestHandler = async () => {
    const db = getDb();
    if (!db) return json({ fullName: 'Muhammad Athoillah', role: 'Database Administrator', company: 'Telkomsigma' });

    try {
        const rows = await db`SELECT * FROM hero_content WHERE id = 'main'` as Record<string, unknown>[];
        if (rows.length > 0) {
            const row = rows[0];
            return json({
                fullName: row.full_name as string,
                role: row.role as string,
                company: row.company as string,
            });
        }
        return json({ fullName: 'Muhammad Athoillah', role: 'Database Administrator', company: 'Telkomsigma' });
    } catch {
        return json({ fullName: 'Muhammad Athoillah', role: 'Database Administrator', company: 'Telkomsigma' });
    }
};

// POST /api/hero — Update hero content (admin only)
export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    const { fullName, role, company } = await request.json();

    try {
        await db`
            INSERT INTO hero_content (id, full_name, role, company, updated_at)
            VALUES ('main', ${fullName}, ${role}, ${company}, NOW())
            ON CONFLICT (id)
            DO UPDATE SET full_name = ${fullName}, role = ${role}, company = ${company}, updated_at = NOW()
        `;
        return json({ success: true });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};
