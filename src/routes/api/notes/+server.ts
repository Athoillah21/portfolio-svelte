import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';

// GET /api/notes — Get all notes
export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    try {
        const rows = await db`SELECT * FROM notes ORDER BY updated_at DESC`;
        return json(rows.map((r: Record<string, unknown>) => ({
            id: r.id, title: r.title, content: r.content,
            createdAt: Number(r.created_at), updatedAt: Number(r.updated_at)
        })));
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};

// POST /api/notes — Create or update a note
export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    const note = await request.json();
    const id = note.id || 'note-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const now = Date.now();

    try {
        await db`
			INSERT INTO notes (id, title, content, created_at, updated_at)
			VALUES (${id}, ${note.title}, ${note.content || ''}, ${note.createdAt || now}, ${note.updatedAt || now})
			ON CONFLICT (id)
			DO UPDATE SET title = ${note.title}, content = ${note.content || ''}, updated_at = ${note.updatedAt || now}
		`;
        return json({ success: true, id });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};

// DELETE /api/notes — Delete a note
export const DELETE: RequestHandler = async ({ url, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'Note ID required' }, { status: 400 });

    try {
        await db`DELETE FROM notes WHERE id = ${id}`;
        return json({ success: true });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};
