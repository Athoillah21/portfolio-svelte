import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { DEEPSEEK_API_KEY } from '$env/static/private';

// Fetch all portfolio data to build context
async function getPortfolioContext(): Promise<string> {
    const db = getDb();
    if (!db) return 'Portfolio data unavailable.';

    const parts: string[] = [];

    try {
        // Hero / identity
        const hero = await db`SELECT * FROM hero_content WHERE id = 'main'` as Record<string, unknown>[];
        if (hero.length > 0) {
            const h = hero[0];
            parts.push(`## Identity\nName: ${h.full_name}\nRole: ${h.role}\nCompany: ${h.company}`);
        }

        // About
        const about = await db`SELECT * FROM about_content WHERE id = 'main'` as Record<string, unknown>[];
        if (about.length > 0) {
            const a = about[0];
            parts.push(`## About\nBio: ${a.bio}\nSkills: ${(a.skills as string[])?.join(', ') || 'N/A'}\nCV: ${a.cv_url || 'N/A'}`);
        }

        // Work Experience
        const work = await db`SELECT * FROM work_experience ORDER BY sort_order` as Record<string, unknown>[];
        if (work.length > 0) {
            parts.push(`## Work Experience\n${work.map(w => `- ${w.title} at ${w.company} (${w.period}): ${w.description || ''}`).join('\n')}`);
        }

        // Education
        const edu = await db`SELECT * FROM education ORDER BY sort_order` as Record<string, unknown>[];
        if (edu.length > 0) {
            parts.push(`## Education\n${edu.map(e => `- ${e.degree} at ${e.institution} (${e.period})`).join('\n')}`);
        }

        // Projects
        const projects = await db`SELECT * FROM projects WHERE status = 'published' ORDER BY sort_order` as Record<string, unknown>[];
        if (projects.length > 0) {
            parts.push(`## Projects\n${projects.map(p =>
                `- **${p.title}**: ${p.description} | Tags: ${(p.tags as string[])?.join(', ') || 'N/A'} | GitHub: ${p.github_url || 'N/A'}`
            ).join('\n')}`);
        }

        // Clients
        const clients = await db`SELECT * FROM clients ORDER BY sort_order` as Record<string, unknown>[];
        if (clients.length > 0) {
            parts.push(`## Clients\n${clients.map(c => `- ${c.name}`).join('\n')}`);
        }
    } catch (e) {
        parts.push('(Some data could not be loaded)');
    }

    return parts.join('\n\n');
}

// POST /api/chat
export const POST: RequestHandler = async ({ request }) => {
    if (!DEEPSEEK_API_KEY) return json({ error: 'AI not configured' }, { status: 503 });

    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
        return json({ error: 'Invalid request' }, { status: 400 });
    }

    // Build portfolio context
    const context = await getPortfolioContext();

    const systemPrompt = `You are a warm, friendly AI assistant on Athoillah's personal portfolio website. Think of yourself as a helpful guide who knows everything about Athoillah and genuinely enjoys helping visitors learn about him.

PORTFOLIO DATA:
${context}

PERSONALITY & STYLE:
- Be conversational and natural — like chatting with a knowledgeable friend, not reading a report
- Use a warm, enthusiastic tone. Light use of emoji is OK (👋 🚀 💡) but don't overdo it
- Keep answers SHORT — 1-3 sentences for simple questions, a brief paragraph for detailed ones
- NEVER dump all information at once. Answer only what was asked
- If someone asks about experience, give a natural summary like "He's been working as a DBA at Telkomsigma since 2023" instead of listing raw data
- Match the visitor's language — if they write in Bahasa Indonesia, reply in Bahasa Indonesia naturally
- NEVER use heavy markdown. No headers, no bullet-heavy lists. You're in a small chat widget, keep it clean. Bold a key word occasionally, that's it
- If you don't know something, say it casually: "Hmm, I don't have info on that — but you can always reach out on the Contact page!"
- Proactively suggest exploring the portfolio: "You can check out his projects page for more details!" 
- When describing projects, be specific about what they do — don't just list names`;


    try {
        const aiRes = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages.slice(-10), // Keep last 10 messages for context window
                ],
                temperature: 0.7,
                max_tokens: 400,
                stream: false,
            }),
        });

        if (!aiRes.ok) {
            return json({ error: 'AI service error' }, { status: 502 });
        }

        const data = await aiRes.json();
        const reply = data.choices?.[0]?.message?.content?.trim() || 'Sorry, I couldn\'t generate a response.';

        return json({ reply });
    } catch (e) {
        return json({ error: 'Failed to get response' }, { status: 500 });
    }
};
