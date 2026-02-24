import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import bcrypt from 'bcryptjs';
import { env } from '$env/dynamic/private';

// POST /api/seed — Seed all tables with initial data (admin only, non-production)
export const POST: RequestHandler = async ({ locals }) => {
    // Block in production for safety
    if (env.NODE_ENV === 'production') {
        return json({ error: 'Seed endpoint is disabled in production' }, { status: 403 });
    }
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) {
        return json({ error: 'Database not configured' }, { status: 503 });
    }

    try {
        // === Seed Admin User ===
        const adminPassword = env.ADMIN_DEFAULT_PASSWORD;
        if (!adminPassword) {
            return json({ error: 'ADMIN_DEFAULT_PASSWORD env var not set' }, { status: 400 });
        }
        const existingUser = await db`SELECT id FROM admin_users WHERE username = 'athoillah'` as Record<string, unknown>[];
        if (existingUser.length === 0) {
            const hash = await bcrypt.hash(adminPassword, 10);
            await db`INSERT INTO admin_users (username, password_hash) VALUES ('athoillah', ${hash})`;
        }

        // === Seed About Content ===
        await db`
			INSERT INTO about_content (id, bio, skills, cv_url)
			VALUES (
				'main',
				${"I'm a Database Administrator with over 3 years of experience, focused on PostgreSQL and passionate about building fast, reliable, and scalable data systems. I work across cloud and bare-metal environments, handling everything from query optimization and performance tuning to disaster recovery planning and high availability setups, including multi-site replication. I also automate backups, monitoring, and maintenance to keep systems running smoothly.\n\nBeyond PostgreSQL, I explore and apply knowledge in Oracle, MySQL, MongoDB, and Redis to stay flexible across different tech stacks. I enjoy collaborating with developers on schema design and enforcing best practices to ensure data integrity and efficiency. I'm always learning, always optimizing."},
				${['Database Administrator', 'PostgreSQL', 'Linux', 'Bash Programming', 'Query Optimization', 'Performance Tuning', 'Disaster Recovery', 'High Availability', 'Automation', 'Cloud Infrastructure', 'Bare-metal Servers']},
				${'https://drive.google.com/file/d/113q9musqrZW-9EoaBX6JN2yuKvkX0sw7/view?usp=sharing'}
			)
			ON CONFLICT (id) DO NOTHING
		`;

        // === Seed Work Experience ===
        const workExperience = [
            { title: 'Database Administrator', company: 'Telkomsigma', period: '2023 — Present', description: 'Manage Client: Telkomsel, Peruri, Telkom Indonesia, Pertamina and Jakarta Govt', sort_order: 1 },
            { title: 'Database Administrator', company: 'Ameliore Solusi Analitika', period: '2022 — 2023', description: 'Manage Client: Telkomsigma', sort_order: 2 }
        ];
        for (const w of workExperience) {
            const existing = await db`SELECT id FROM work_experience WHERE title = ${w.title} AND company = ${w.company}`;
            if (existing.length === 0) {
                await db`INSERT INTO work_experience (title, company, period, description, sort_order) VALUES (${w.title}, ${w.company}, ${w.period}, ${w.description}, ${w.sort_order})`;
            }
        }

        // === Seed Education ===
        const education = [
            { degree: 'B.Sc, Geophysics', institution: 'Gadjah Mada University', period: '2017 — 2022', sort_order: 1 }
        ];
        for (const e of education) {
            const existing = await db`SELECT id FROM education WHERE degree = ${e.degree} AND institution = ${e.institution}`;
            if (existing.length === 0) {
                await db`INSERT INTO education (degree, institution, period, sort_order) VALUES (${e.degree}, ${e.institution}, ${e.period}, ${e.sort_order})`;
            }
        }

        // === Seed Projects ===
        const projects = [
            { id: 'pg-growth', title: 'pg_growth', description: 'Custom PostgreSQL extension built in C that captures and tracks database size growth metrics.', icon: 'database', tags: ['PostgreSQL', 'C Programming', 'Extension', 'Monitoring'], githubUrl: 'https://github.com/Athoillah21/pg_growth', mediumUrl: 'https://medium.com/@muhammadathoillah62/pg-growth-crafting-my-first-postgresql-extension-42520cb6bb5a', sort_order: 1 },
            { id: 'project-mk42f1kn', title: 'Tuning Buddy', description: 'Intelligent PostgreSQL query optimization assistant powered by Gemini, DeepSeek, and Groq API.', icon: 'brain', tags: ['Python', 'Django', 'Tuning Query', 'AI/ML', 'Gemini API', 'DeepSeek API', 'Groq API'], githubUrl: 'https://github.com/Athoillah21/tuning-buddy', mediumUrl: 'https://tuning-buddy.vercel.app/', sort_order: 2 },
            { id: 'project-mk42ak22', title: 'Capacity Planning Report', description: 'Comprehensive infrastructure capacity analysis tool for EDB PostgreSQL.', icon: 'bar-chart-3', tags: ['Shell Script', 'HTML', 'Capacity Planning', 'Multi-Database', 'Multi-Server'], githubUrl: 'https://github.com/Athoillah21/capacity_planning_report', mediumUrl: 'https://athoillah21.github.io/capacity_planning_report/v6-postgresql/sample_postgresql_preview.html', sort_order: 3 },
            { id: 'project-mjn4rhf2', title: 'Barman Automate Report', description: 'Automated Barman backup monitoring solution that scans multiple PostgreSQL backup servers.', icon: 'shield-check', tags: ['Shell Script', 'Barman', 'Automation', 'Reporting'], githubUrl: 'https://github.com/Athoillah21/Barman-Report', mediumUrl: 'https://athoillah21.github.io/Barman-Report/results/barman_status_2025-12-26.html', sort_order: 4 },
            { id: 'project-mjn2qlnk', title: 'Liquid Glass DB Reporter', description: 'Premium multi-database health monitoring with elegant liquid glass UI design.', icon: 'sparkles', tags: ['Shell Script', 'Glassmorphism', 'UI Design', 'PostgreSQL'], githubUrl: 'https://github.com/Athoillah21/Healthcheck-Report-Liquid-Glass-Style', mediumUrl: 'https://athoillah21.github.io/Healthcheck-Report-Liquid-Glass-Style/result/daily_handover_report_liquid_2025-12-25%20135116.html', sort_order: 5 },
            { id: 'project-mjn2ojos', title: 'Multi-DB Healthcheck Reporter', description: 'Automated multi-database health monitoring solution for consolidation servers.', icon: 'server', tags: ['Shell Script', 'PostgreSQL', 'Multi-DB', 'Reporting'], githubUrl: 'https://github.com/Athoillah21/Healthcheck-Report-Consolidation-Server', mediumUrl: 'https://athoillah21.github.io/Healthcheck-Report-Consolidation-Server/result/daily_health_check_report_sample.html', sort_order: 6 },
            { id: 'project-mjlf9fmh', title: 'PostgreSQL Healthcheck - Email Alerts', description: 'Automated database health monitoring script that delivers detailed HTML reports via SMTP email.', icon: 'mail', tags: ['Shell Script', 'PostgreSQL', 'Email', 'Automation'], githubUrl: 'https://github.com/Athoillah21/Healthcheck_PostgreSQL_to_Email', mediumUrl: 'https://athoillah21.github.io/Healthcheck_PostgreSQL_to_Email/report/db_healthcheck_report_postgres_2025-05-19.html', sort_order: 7 },
            { id: 'project-mjlfdbld', title: 'PostgreSQL Healthcheck - Telegram Bot', description: 'Python-powered database monitoring tool that sends real-time alerts via Telegram Bot API.', icon: 'send', tags: ['Python', 'Telegram', 'Bot API', 'PostgreSQL'], githubUrl: 'https://github.com/Athoillah21/Telegram_Bot_for_Healthcheck_PostgreSQL', mediumUrl: 'https://github.com/Athoillah21/Telegram_Bot_for_Healthcheck_PostgreSQL', sort_order: 8 },
            { id: 'simple-dbaas', title: 'Simple DBaaS', description: 'A Database-as-a-Service application developed using Flask, deployed on Amazon EC2.', icon: 'cloud', tags: ['Python', 'Flask', 'AWS', 'PostgreSQL'], githubUrl: 'https://github.com/Athoillah21/DBaaS-Project', mediumUrl: 'https://medium.com/@muhammadathoillah62/building-postgresql-database-as-a-service-dbaas-platform-for-automated-database-management-and-61a8abb06978', sort_order: 9 },
            { id: 'fhci-2022', title: 'FHCI BUMN Job Data Scraper', description: 'Automated web scraping solution using Python and Selenium to extract job listings.', icon: 'file-search', tags: ['Python', 'Selenium', 'Web Scraping', 'Data Analysis'], githubUrl: 'https://github.com/Athoillah21/Project-FHCI', mediumUrl: 'https://www.linkedin.com/posts/muhammadathoillah_summary-fhcibumn-analysis-activity-7005568875777921025-iw4S', sort_order: 10 },
            { id: 'project-mjjrhr34', title: 'Athoillah-Portofolio', description: 'Personal portfolio website showcasing projects and professional experience.', icon: 'user', tags: ['HTML', 'CSS', 'JavaScript', 'Tailwind'], githubUrl: 'https://github.com/Athoillah21/athoillah21.github.io', mediumUrl: 'https://athoillah21.github.io', sort_order: 11 },
            { id: 'project-mjjrjnbs', title: 'Firda-Portofolio', description: "Portfolio website created for my wife featuring her work and achievements.", icon: 'heart', tags: ['HTML', 'CSS', 'JavaScript', 'Web Design'], githubUrl: 'https://github.com/Athoillah21/firda-repo', mediumUrl: 'https://athoillah21.github.io/firda-repo/', sort_order: 12 }
        ];
        for (const p of projects) {
            await db`
				INSERT INTO projects (id, title, description, icon, tags, github_url, medium_url, status, sort_order)
				VALUES (${p.id}, ${p.title}, ${p.description}, ${p.icon}, ${p.tags}, ${p.githubUrl}, ${p.mediumUrl}, 'published', ${p.sort_order})
				ON CONFLICT (id) DO NOTHING
			`;
        }

        // === Seed Notes ===
        const notes = [
            { id: 'note-1767518534723-tl4rv5odi', title: 'Link SOP Majapahit', content: 'Link SOP Majapahit\n\nhttps://docs.google.com/spreadsheets/d/1kbN9sIW8-tIX_TppaoyBlqdA9ZApHCifq1xDBwZ5llY/edit?gid=147418856#gid=147418856', createdAt: 1767518534723, updatedAt: 1767518534723 },
            { id: 'note-postgresql-runbook-001', title: 'PostgreSQL Troubleshooting Runbook', content: '# PostgreSQL Troubleshooting Runbook\n\n## 1. Server Down\n```bash\nps -ef | grep -i postgres | grep data\n```\n\n```sql\nSELECT date_trunc(\'second\', current_timestamp - pg_postmaster_start_time()) AS db_uptime;\n```\n\n## 2. Total Connections\n```sql\nSELECT count(*) FROM pg_stat_activity;\nSHOW max_connections;\n```\n\n## 3. Dead Tuple Percentage\n```sql\nSELECT relname, n_live_tup, n_dead_tup, last_vacuum, last_autovacuum\nFROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 10;\n```\n\n## 4. Replication Lag\n```sql\nSELECT pg_is_in_recovery();\nSELECT client_addr, write_lag, flush_lag, replay_lag, state FROM pg_stat_replication;\n```', createdAt: 1735908894000, updatedAt: 1735974758000 }
        ];
        for (const n of notes) {
            await db`
				INSERT INTO notes (id, title, content, created_at, updated_at)
				VALUES (${n.id}, ${n.title}, ${n.content}, ${n.createdAt}, ${n.updatedAt})
				ON CONFLICT (id) DO NOTHING
			`;
        }

        // === Seed Clients ===
        const clients = [
            { name: 'Pertamina', logo_url: '/images/pertamina.svg', sort_order: 1 },
            { name: 'Telkomsigma', logo_url: '/images/telkomsigma.svg', sort_order: 2 },
            { name: 'Telkomsel', logo_url: '/images/telkomsel.svg', sort_order: 3 },
            { name: 'Telkom Indonesia', logo_url: '/images/telkom.svg', sort_order: 4 },
            { name: 'Peruri', logo_url: '/images/peruri.svg', sort_order: 5 },
            { name: 'Bank BTN', logo_url: '/images/btn.svg', sort_order: 6 },
            { name: 'Jakarta Government', logo_url: '/images/jakarta.svg', sort_order: 7 },
            { name: 'BYU', logo_url: '/images/byu.svg', sort_order: 8 },
            { name: 'Indihome', logo_url: '/images/indihome.svg', sort_order: 9 },
            { name: 'BPJSTK', logo_url: '/images/bpjstk.svg', sort_order: 10 }
        ];
        for (const c of clients) {
            const existing = await db`SELECT id FROM clients WHERE name = ${c.name}`;
            if (existing.length === 0) {
                await db`INSERT INTO clients (name, logo_url, sort_order) VALUES (${c.name}, ${c.logo_url}, ${c.sort_order})`;
            }
        }

        return json({ success: true, message: 'All tables seeded successfully' });
    } catch (e) {
        console.error('Seed failed:', e);
        return json({ error: 'Seed failed', details: String(e) }, { status: 500 });
    }
};
