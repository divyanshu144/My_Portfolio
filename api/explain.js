import { ai, model, baseSystem, portfolioContext } from './_lib/context.js';

const safeRepoFromUrl = (repoUrl) => {
  if (!repoUrl) return null;
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?]+)/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
};

const fetchGitHubReadme = async (repoUrl) => {
  const repoInfo = safeRepoFromUrl(repoUrl);
  if (!repoInfo) return { readme: null, meta: null };
  const { owner, repo } = repoInfo;
  const [metaRes, readmeRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}`),
    fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { Accept: 'application/vnd.github.raw' },
    }),
  ]);
  return {
    meta: metaRes.ok ? await metaRes.json() : null,
    readme: readmeRes.ok ? await readmeRes.text() : null,
  };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { repoUrl, question = '' } = req.body || {};
    if (!repoUrl) return res.status(400).json({ error: 'repoUrl is required.' });

    const { readme, meta } = await fetchGitHubReadme(repoUrl);
    const prompt = `
Explain the project from this GitHub repo. Use the README and repo metadata if available.
Repo URL: ${repoUrl}
Repo Meta: ${meta ? JSON.stringify(meta, null, 2) : 'Not available'}
README:
${readme ? readme.slice(0, 4000) : 'No README available.'}
User question: ${question || 'Provide a concise project explanation, key features, and tech stack.'}
    `.trim();

    const response = await ai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: `${baseSystem}\n\n${portfolioContext}` },
        { role: 'user', content: prompt },
      ],
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error('Explain error:', error?.message || error);
    res.status(500).json({ error: 'Failed to explain project.' });
  }
}
