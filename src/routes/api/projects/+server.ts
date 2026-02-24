import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';

// GET /api/projects — Get all projects
export const GET: RequestHandler = async ({ url }) => {
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    const status = url.searchParams.get('status') || 'published';
    try {
        const rows = await db`SELECT * FROM projects WHERE status = ${status} ORDER BY sort_order ASC`;
        return json(rows.map((r: Record<string, unknown>) => ({
            id: r.id, title: r.title, description: r.description,
            image: r.image || '', icon: r.icon || '', imageText: r.image_text || '',
            tags: r.tags || [], githubUrl: r.github_url || '', mediumUrl: r.medium_url || '',
            status: r.status, sortOrder: r.sort_order
        })));
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};

// POST /api/projects — Create or update a project
export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    const p = await request.json();
    const id = p.id || 'project-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    try {
        await db`
			INSERT INTO projects (id, title, description, image, icon, image_text, tags, github_url, medium_url, status, sort_order)
			VALUES (${id}, ${p.title}, ${p.description}, ${p.image || ''}, ${p.icon || ''}, ${p.imageText || ''}, ${p.tags || []}, ${p.githubUrl || ''}, ${p.mediumUrl || ''}, ${p.status || 'published'}, ${p.sortOrder || 0})
			ON CONFLICT (id)
			DO UPDATE SET title = ${p.title}, description = ${p.description}, image = ${p.image || ''}, icon = ${p.icon || ''}, image_text = ${p.imageText || ''}, tags = ${p.tags || []}, github_url = ${p.githubUrl || ''}, medium_url = ${p.mediumUrl || ''}, status = ${p.status || 'published'}, sort_order = ${p.sortOrder || 0}, updated_at = NOW()
		`;
        return json({ success: true, id });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};

// PUT /api/projects — Batch update sort order
export const PUT: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    const { order } = await request.json();
    if (!Array.isArray(order)) return json({ error: 'Invalid order data' }, { status: 400 });

    try {
        for (const item of order) {
            await db`UPDATE projects SET sort_order = ${item.sortOrder} WHERE id = ${item.id}`;
        }
        return json({ success: true });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};

// DELETE /api/projects — Delete a project
export const DELETE: RequestHandler = async ({ url, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'Project ID required' }, { status: 400 });

    try {
        await db`DELETE FROM projects WHERE id = ${id}`;
        return json({ success: true });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};
