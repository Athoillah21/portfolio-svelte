import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';

const fallbackNotes = [
    {
        id: 'note-1767518534723-tl4rv5odi',
        title: 'Link SOP Majapahit',
        content: 'Link SOP Majapahit\n\nhttps://docs.google.com/spreadsheets/d/1kbN9sIW8-tIX_TppaoyBlqdA9ZApHCifq1xDBwZ5llY/edit?gid=147418856#gid=147418856',
        createdAt: 1767518534723,
        updatedAt: 1767518534723
    },
    {
        id: 'note-postgresql-runbook-001',
        title: 'PostgreSQL Troubleshooting Runbook',
        content: '# PostgreSQL Troubleshooting Runbook\n\nComprehensive guide for PostgreSQL database administration and troubleshooting.\n\n---\n\n## 1. Server Down\n\n### Check Database Status\n```bash\nps -ef | grep -i postgres | grep data\n```\n\n### Verify Database Uptime\n```sql\nSELECT date_trunc(\'second\', current_timestamp - pg_postmaster_start_time()) AS db_uptime;\nSHOW port;\n```\n\n> **Note:** If nothing shows, the database is down.\n\n---\n\n## 2. Total Connections\n\n```sql\nSELECT count(*) FROM pg_stat_activity;\nSHOW max_connections;\n```\n\n---\n\n## 3. Dead Tuple Percentage\n\n```sql\nSELECT relname, n_live_tup, n_dead_tup, last_vacuum, last_autovacuum\nFROM pg_stat_user_tables\nORDER BY n_dead_tup DESC\nLIMIT 10;\n```\n\n---\n\n## 4. Replication Lag\n\n```sql\nSELECT pg_is_in_recovery();\nSELECT client_addr, write_lag, flush_lag, replay_lag, state\nFROM pg_stat_replication;\n```',
        createdAt: 1735908894000,
        updatedAt: 1735974758000
    }
];

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/');
    }
    const db = getDb();

    if (db) {
        try {
            const rows = await db`SELECT * FROM notes ORDER BY updated_at DESC`;
            if (rows.length > 0) {
                return {
                    notes: rows.map((r: Record<string, unknown>) => ({
                        id: r.id,
                        title: r.title,
                        content: r.content,
                        createdAt: Number(r.created_at),
                        updatedAt: Number(r.updated_at)
                    }))
                };
            }
        } catch (e) {
            console.warn('DB query failed, using fallback notes:', e);
        }
    }

    return { notes: fallbackNotes };
};
