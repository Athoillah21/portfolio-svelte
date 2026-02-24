import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';

const fallbackAbout = {
    bio: "I'm a Database Administrator with over 3 years of experience, focused on PostgreSQL and passionate about building fast, reliable, and scalable data systems. I work across cloud and bare-metal environments, handling everything from query optimization and performance tuning to disaster recovery planning and high availability setups, including multi-site replication. I also automate backups, monitoring, and maintenance to keep systems running smoothly.\n\nBeyond PostgreSQL, I explore and apply knowledge in Oracle, MySQL, MongoDB, and Redis to stay flexible across different tech stacks. I enjoy collaborating with developers on schema design and enforcing best practices to ensure data integrity and efficiency. I'm always learning, always optimizing.",
    skills: ['Database Administrator', 'PostgreSQL', 'Linux', 'Bash Programming', 'Query Optimization', 'Performance Tuning', 'Disaster Recovery', 'High Availability', 'Automation', 'Cloud Infrastructure', 'Bare-metal Servers'],
    cvUrl: 'https://drive.google.com/file/d/113q9musqrZW-9EoaBX6JN2yuKvkX0sw7/view?usp=sharing',
    workExperience: [
        { id: 1, title: 'Database Administrator', company: 'Telkomsigma', period: '2023 — Present', description: 'Manage Client: Telkomsel, Peruri, Telkom Indonesia, Pertamina and Jakarta Govt' },
        { id: 2, title: 'Database Administrator', company: 'Ameliore Solusi Analitika', period: '2022 — 2023', description: 'Manage Client: Telkomsigma' }
    ],
    education: [
        { id: 1, degree: 'B.Sc, Geophysics', institution: 'Gadjah Mada University', period: '2017 — 2022' }
    ]
};

export const load: PageServerLoad = async () => {
    const db = getDb();

    if (db) {
        try {
            const [about] = await db`SELECT * FROM about_content WHERE id = 'main'`;
            const work = await db`SELECT * FROM work_experience ORDER BY sort_order ASC`;
            const edu = await db`SELECT * FROM education ORDER BY sort_order ASC`;

            if (about) {
                return {
                    bio: about.bio || fallbackAbout.bio,
                    skills: about.skills || fallbackAbout.skills,
                    cvUrl: about.cv_url || fallbackAbout.cvUrl,
                    workExperience: work.length > 0 ? work.map((w: Record<string, unknown>) => ({
                        id: w.id, title: w.title, company: w.company, period: w.period, description: w.description
                    })) : fallbackAbout.workExperience,
                    education: edu.length > 0 ? edu.map((e: Record<string, unknown>) => ({
                        id: e.id, degree: e.degree, institution: e.institution, period: e.period
                    })) : fallbackAbout.education
                };
            }
        } catch (e) {
            console.warn('DB query failed for about:', e);
        }
    }

    return fallbackAbout;
};
