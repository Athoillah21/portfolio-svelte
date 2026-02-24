import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DEEPSEEK_API_KEY } from '$env/static/private';

// Parse GitHub URL into owner/repo
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

// Fetch from GitHub API with error handling
async function githubFetch(path: string) {
    const res = await fetch(`https://api.github.com/${path}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Portfolio-AI-Agent' }
    });
    if (!res.ok) return null;
    return res.json();
}

// POST /api/generate-description
export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
    if (!DEEPSEEK_API_KEY) return json({ error: 'DeepSeek API key not configured' }, { status: 503 });

    const { githubUrl } = await request.json();
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) return json({ error: 'Invalid GitHub URL' }, { status: 400 });

    const { owner, repo } = parsed;

    try {
        // === Layer 1: Repo metadata ===
        const repoData = await githubFetch(`repos/${owner}/${repo}`);
        if (!repoData) return json({ error: 'Repository not found or not accessible' }, { status: 404 });

        const metadata = {
            name: repoData.name,
            fullName: repoData.full_name,
            description: repoData.description || '',
            language: repoData.language || 'Unknown',
            topics: repoData.topics || [],
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
        };

        // === Layer 1: README ===
        let readme = '';
        const readmeData = await githubFetch(`repos/${owner}/${repo}/readme`);
        if (readmeData?.content) {
            readme = Buffer.from(readmeData.content, 'base64').toString('utf-8');
            // Truncate very long READMEs
            if (readme.length > 8000) readme = readme.substring(0, 8000) + '\n...(truncated)';
        }

        // === Layer 2: File tree ===
        let fileTree = '';
        const treeData = await githubFetch(`repos/${owner}/${repo}/git/trees/HEAD?recursive=1`);
        if (treeData?.tree) {
            const files = treeData.tree
                .filter((f: any) => f.type === 'blob')
                .map((f: any) => f.path)
                .filter((p: string) => !p.includes('node_modules/') && !p.includes('vendor/') && !p.includes('.git/'))
                .slice(0, 100);
            fileTree = files.join('\n');
        }

        // === Layer 3: Key source files ===
        const keyPatterns = [
            /^(main|index|app|server|mod)\.(py|js|ts|c|go|rs|java|sh)$/i,
            /^(Makefile|Dockerfile|docker-compose\.ya?ml|setup\.py|pyproject\.toml|package\.json|Cargo\.toml)$/i,
            /^src\/(main|index|app|lib)\.(py|js|ts|c|go|rs)$/i,
        ];

        let keyFilesContent = '';
        if (treeData?.tree) {
            const keyFiles = treeData.tree
                .filter((f: any) => f.type === 'blob' && keyPatterns.some(p => p.test(f.path)))
                .slice(0, 5);

            for (const file of keyFiles) {
                const fileData = await githubFetch(`repos/${owner}/${repo}/contents/${file.path}`);
                if (fileData?.content) {
                    let content = Buffer.from(fileData.content, 'base64').toString('utf-8');
                    if (content.length > 3000) content = content.substring(0, 3000) + '\n...(truncated)';
                    keyFilesContent += `\n--- ${file.path} ---\n${content}\n`;
                }
            }
        }

        // === Build prompt and call DeepSeek ===
        const prompt = `You are an expert technical writer. Based on the following GitHub repository information, write a concise, professional portfolio project description (2-3 sentences max). Also suggest relevant tags as a comma-separated list.

Repository: ${metadata.fullName}
Primary Language: ${metadata.language}
Topics: ${metadata.topics.join(', ') || 'none'}
GitHub Description: ${metadata.description || 'none'}

README:
${readme || 'No README found.'}

File Structure:
${fileTree || 'Unable to fetch file tree.'}

Key Source Files:
${keyFilesContent || 'No key files fetched.'}

Respond in this exact JSON format:
{"description": "your generated description here", "tags": ["tag1", "tag2", "tag3"]}

Rules:
- Description should be engaging and professional, suitable for a portfolio
- Keep it 2-3 sentences, no more
- Tags should be specific technologies, tools, or concepts used (5-8 tags)
- Respond ONLY with the JSON, no other text`;

        const aiRes = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!aiRes.ok) {
            const errBody = await aiRes.text();
            return json({ error: `DeepSeek API error: ${aiRes.status} - ${errBody}` }, { status: 502 });
        }

        const aiData = await aiRes.json();
        const content = aiData.choices?.[0]?.message?.content?.trim();

        if (!content) return json({ error: 'Empty response from AI' }, { status: 502 });

        // Parse the JSON response
        try {
            const parsed = JSON.parse(content);
            return json({
                description: parsed.description || '',
                tags: parsed.tags || [],
                repoName: metadata.name,
                language: metadata.language,
            });
        } catch {
            // If JSON parsing fails, try to extract from the text
            return json({
                description: content.replace(/```json|```/g, '').trim(),
                tags: metadata.topics.length > 0 ? metadata.topics : [metadata.language],
                repoName: metadata.name,
                language: metadata.language,
            });
        }
    } catch (e) {
        return json({ error: `Failed to generate: ${String(e)}` }, { status: 500 });
    }
};
