import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';

// POST /api/contact — Save a contact message
export const POST: RequestHandler = async ({ request }) => {
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    const data = await request.json();
    try {
        const [result] = await db`
			INSERT INTO contact_messages (name, email, subject, message)
			VALUES (${data.name}, ${data.email}, ${data.subject}, ${data.message})
			RETURNING id
		`;
        return json({ success: true, id: result.id });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};

// GET /api/contact — Get all messages (admin)
export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    try {
        const rows = await db`SELECT * FROM contact_messages ORDER BY created_at DESC`;
        return json(rows.map((r: Record<string, unknown>) => ({
            id: r.id, name: r.name, email: r.email, subject: r.subject,
            message: r.message, read: r.read, createdAt: r.created_at
        })));
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};

// DELETE /api/contact — Delete a message
export const DELETE: RequestHandler = async ({ url, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'Message ID required' }, { status: 400 });

    try {
        await db`DELETE FROM contact_messages WHERE id = ${parseInt(id)}`;
        return json({ success: true });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};
