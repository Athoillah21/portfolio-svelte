import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';

// GET /api/about — Get about content
export const GET: RequestHandler = async () => {
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    try {
        const [about] = await db`SELECT * FROM about_content WHERE id = 'main'`;
        const work = await db`SELECT * FROM work_experience ORDER BY sort_order ASC`;
        const edu = await db`SELECT * FROM education ORDER BY sort_order ASC`;

        return json({
            bio: about?.bio || '',
            skills: about?.skills || [],
            cvUrl: about?.cv_url || '',
            workExperience: work.map((w: Record<string, unknown>) => ({
                id: w.id, title: w.title, company: w.company,
                period: w.period, description: w.description
            })),
            education: edu.map((e: Record<string, unknown>) => ({
                id: e.id, degree: e.degree, institution: e.institution, period: e.period
            }))
        });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};

// PUT /api/about — Update about content
export const PUT: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return json({ error: 'Database not configured' }, { status: 503 });

    const data = await request.json();

    try {
        if (data.bio !== undefined || data.skills !== undefined || data.cvUrl !== undefined) {
            const existing = await db`SELECT id FROM about_content WHERE id = 'main'`;
            if (existing.length === 0) {
                await db`INSERT INTO about_content (id, bio, skills, cv_url) VALUES ('main', ${data.bio || ''}, ${data.skills || []}, ${data.cvUrl || ''})`;
            } else {
                await db`UPDATE about_content SET bio = ${data.bio || ''}, skills = ${data.skills || []}, cv_url = ${data.cvUrl || ''}, updated_at = NOW() WHERE id = 'main'`;
            }
        }

        // Update work experience
        if (data.workExperience) {
            for (const w of data.workExperience) {
                if (w.id) {
                    await db`UPDATE work_experience SET title = ${w.title}, company = ${w.company}, period = ${w.period}, description = ${w.description || ''} WHERE id = ${w.id}`;
                } else {
                    await db`INSERT INTO work_experience (title, company, period, description, sort_order) VALUES (${w.title}, ${w.company}, ${w.period}, ${w.description || ''}, ${w.sortOrder || 0})`;
                }
            }
        }

        // Update education
        if (data.education) {
            for (const e of data.education) {
                if (e.id) {
                    await db`UPDATE education SET degree = ${e.degree}, institution = ${e.institution}, period = ${e.period} WHERE id = ${e.id}`;
                } else {
                    await db`INSERT INTO education (degree, institution, period, sort_order) VALUES (${e.degree}, ${e.institution}, ${e.period}, ${e.sortOrder || 0})`;
                }
            }
        }

        return json({ success: true });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
};
