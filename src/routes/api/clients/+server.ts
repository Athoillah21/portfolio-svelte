import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';

// GET /api/clients — Get all clients
export const GET: RequestHandler = async () => {
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    try {
        const rows = await db`SELECT * FROM clients ORDER BY sort_order ASC`;
        return json(rows.map((r: Record<string, unknown>) => ({
            id: r.id, name: r.name, logoUrl: r.logo_url, sortOrder: r.sort_order
        })));
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};

// POST /api/clients — Add a new client
export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    const data = await request.json();
    try {
        const [result] = await db`
			INSERT INTO clients (name, logo_url, sort_order)
			VALUES (${data.name}, ${data.logoUrl}, ${data.sortOrder || 0})
			RETURNING id
		`;
        return json({ success: true, id: result.id });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};

// PUT /api/clients — Update a client
export const PUT: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    const data = await request.json();
    try {
        await db`UPDATE clients SET name = ${data.name}, logo_url = ${data.logoUrl}, sort_order = ${data.sortOrder || 0} WHERE id = ${data.id}`;
        return json({ success: true });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};

// DELETE /api/clients — Delete a client
export const DELETE: RequestHandler = async ({ url, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'Client ID required' }, { status: 400 });

    try {
        await db`DELETE FROM clients WHERE id = ${parseInt(id)}`;
        return json({ success: true });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};
