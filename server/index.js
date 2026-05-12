import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const provider = process.env.XAI_API_KEY    ? 'xai'
               : process.env.GROQ_API_KEY   ? 'groq'
               : process.env.OLLAMA_HOST !== undefined || process.env.PROVIDER === 'ollama' ? 'ollama'
               : process.env.OPENAI_API_KEY ? 'openai'
               : 'ollama'; // default to local Ollama if nothing is set

const BASE_URLS = {
  xai:    'https://api.x.ai/v1',
  groq:   'https://api.groq.com/openai/v1',
  ollama: process.env.OLLAMA_HOST || 'http://localhost:11434/v1',
};
const DEFAULT_MODELS = {
  xai:    'grok-3-mini',
  groq:   'llama-3.3-70b-versatile',
  ollama: 'llama3.1',
  openai: 'gpt-4.1-mini',
};

const apiKey = process.env.XAI_API_KEY
  || process.env.GROQ_API_KEY
  || process.env.OPENAI_API_KEY
  || 'ollama'; // Ollama accepts any non-empty string

const openai = new OpenAI({
  apiKey,
  ...(BASE_URLS[provider] && { baseURL: BASE_URLS[provider] }),
});

const model = process.env.MODEL || DEFAULT_MODELS[provider];

console.log(`Provider: ${provider} | Model: ${model}`);

const dataPath = path.resolve(process.cwd(), 'data', 'portfolioData.json');
let portfolioData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const toText = (value) => (typeof value === 'string' ? value : JSON.stringify(value, null, 2));

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

// Fetch READMEs for all projects and cache them in memory.
// Called on startup and via POST /api/refresh.
let projectReadmes = {};

const refreshProjectReadmes = async () => {
  const results = await Promise.allSettled(
    portfolioData.projects.map(async (project) => {
      if (!project.repo) return;
      const { readme } = await fetchGitHubReadme(project.repo);
      if (readme) {
        projectReadmes[project.name] = readme.slice(0, 3000); // cap to avoid token bloat
        console.log(`  ✓ README fetched: ${project.name}`);
      }
    })
  );
  const failures = results.filter((r) => r.status === 'rejected').length;
  if (failures) console.warn(`  ${failures} README fetch(es) failed.`);
};

const buildPortfolioContext = () => {
  const d = portfolioData;

  const skillsBlock = Object.entries(d.skills)
    .map(([cat, items]) => `  ${cat}: ${items.join(', ')}`)
    .join('\n');

  const expBlock = d.experience
    .map(e => `  ${e.title} @ ${e.company} (${e.dates})\n${e.highlights.map(h => `    • ${h}`).join('\n')}`)
    .join('\n\n');

  const eduBlock = d.education
    .map(e => `  ${e.degree} — ${e.institution} (${e.dates})${e.grade ? ', ' + e.grade : ''}${e.dissertation ? '\n    Dissertation: ' + e.dissertation : ''}`)
    .join('\n');

  const projectBlock = d.projects.map(p => {
    const readme = projectReadmes[p.name];
    const detail = readme
      ? `\n    Technical detail: ${readme.slice(0, 800).replace(/\n+/g, ' ')}`
      : '';
    return `  ${p.name} (${p.tech.join(', ')})\n    ${p.summary}${detail}`;
  }).join('\n\n');

  return `
## About Divyanshu
${d.summary}
Location: ${d.location}
Contact: ${d.contact.email} | ${d.contact.phone}
LinkedIn: ${d.contact.linkedin}
GitHub: ${d.contact.github}

## Visa & Right to Work
${d.visa.status}. ${d.visa.details}
Right to work: ${d.visa.right_to_work}

## Target Roles
${d.targetRoles.join(', ')}

## Skills
${skillsBlock}

## Work Experience
${expBlock}

## Education
${eduBlock}

## Projects
${projectBlock}

## Interests
${d.interests.join(', ')}
`.trim();
};

const baseSystem = `
You are the AI assistant on Divyanshu Charak's portfolio website. You represent Divyanshu to recruiters, hiring managers, and visitors.

Your job is to answer questions about Divyanshu confidently, accurately, and professionally — as if you personally know him well.

STRICT RULES:
- Never mention "README", "portfolio data", "JSON", "context", "the data shows", or any reference to how you obtained information. You simply know these facts about Divyanshu.
- Never say "based on the provided information" or "according to the text". Speak directly: "Divyanshu has..." or "He built..." or "His skills include..."
- Never speculate or add skills/experience not in the context below. If genuinely unsure, say "I don't have that detail — reach out to Divyanshu directly at ${portfolioData.contact.email}"
- Keep answers concise and recruiter-friendly. Use bullet points for lists. Avoid walls of text.
- Tone: confident, professional, warm. You're an advocate for Divyanshu, not a search engine.
- For visa questions: he has applied for the UK Graduate Route visa — 2 years of unrestricted work rights once granted, no sponsorship needed.
- For availability: he is actively looking for roles in AI/ML engineering, data engineering, full-stack, or backend development.
`.trim();

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, readmesCached: Object.keys(projectReadmes) });
});

// Re-fetches all GitHub READMEs and reloads portfolioData.json from disk.
// Call this after pushing new code to GitHub.
app.post('/api/refresh', async (_req, res) => {
  try {
    portfolioData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    projectReadmes = {};
    await refreshProjectReadmes();
    res.json({ ok: true, refreshed: Object.keys(projectReadmes) });
  } catch (error) {
    console.error('Refresh error:', error?.message || error);
    res.status(500).json({ error: 'Refresh failed.' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: `${baseSystem}\n\n${buildPortfolioContext()}` },
        ...history,
        { role: 'user', content: message },
      ],
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error('Chat error:', error?.message || error);
    res.status(500).json({ error: 'Failed to generate response.' });
  }
});

app.post('/api/resume', async (req, res) => {
  try {
    const { jobDescription = '', focus = '', tone = 'professional' } = req.body || {};
    const prompt = `
Create a tailored resume summary and a short cover letter for Divyanshu Charak.
Tone: ${tone}.
Focus: ${focus || 'Best alignment with the job description'}.
Job Description:
${jobDescription || 'Not provided.'}
Return:
1) 5-7 bullet points for resume highlights.
2) A cover letter of ~150-200 words.
    `.trim();

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: `${baseSystem}\n\n${buildPortfolioContext()}` },
        { role: 'user', content: prompt },
      ],
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error('Resume error:', error?.message || error);
    res.status(500).json({ error: 'Failed to generate resume content.' });
  }
});

app.post('/api/explain', async (req, res) => {
  try {
    const { repoUrl, question = '' } = req.body || {};
    if (!repoUrl) return res.status(400).json({ error: 'repoUrl is required.' });

    const { readme, meta } = await fetchGitHubReadme(repoUrl);
    const prompt = `
Explain the project from this GitHub repo. Use the README and repo metadata if available.
Repo URL: ${repoUrl}
Repo Meta:
${toText(meta)}
README:
${readme || 'No README available.'}
User question: ${question || 'Provide a concise project explanation, key features, and tech stack.'}
    `.trim();

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: `${baseSystem}\n\n${buildPortfolioContext()}` },
        { role: 'user', content: prompt },
      ],
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error('Explain error:', error?.message || error);
    res.status(500).json({ error: 'Failed to explain project.' });
  }
});

app.post('/api/coach', async (req, res) => {
  try {
    const { role = '', company = '', focus = '' } = req.body || {};
    const prompt = `
You are an interview coach for ${portfolioData.name}.
Role: ${role || 'Not provided'}.
Company: ${company || 'Not provided'}.
Focus: ${focus || 'Core competencies and relevant projects'}.
Generate:
1) 6-8 interview questions tailored to the role.
2) Strong answer outlines grounded in the portfolio data.
    `.trim();

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: `${baseSystem}\n\n${buildPortfolioContext()}` },
        { role: 'user', content: prompt },
      ],
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error('Coach error:', error?.message || error);
    res.status(500).json({ error: 'Failed to generate interview coaching.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Fetch READMEs on startup, then start listening.
console.log('Fetching project READMEs from GitHub...');
refreshProjectReadmes().then(() => {
  app.listen(port, () => {
    console.log(`AI server running on http://localhost:${port}`);
  });
});
