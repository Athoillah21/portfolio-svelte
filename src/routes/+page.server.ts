import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const db = getDb();
    if (!db) {
        return {
            hero: { fullName: 'Muhammad Athoillah', role: 'Database Administrator', company: 'Telkomsigma' }
        };
    }

    try {
        const rows = await db`SELECT * FROM hero_content WHERE id = 'main'` as Record<string, unknown>[];
        if (rows.length > 0) {
            const row = rows[0];
            return {
                hero: {
                    fullName: row.full_name as string,
                    role: row.role as string,
                    company: row.company as string,
                }
            };
        }
    } catch {
        // fall through to defaults
    }

    return {
        hero: { fullName: 'Muhammad Athoillah', role: 'Database Administrator', company: 'Telkomsigma' }
    };
};
