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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. API requests will fail.');
}
const dataPath = path.resolve(process.cwd(), 'data', 'portfolioData.json');
const portfolioData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const toText = (value) => (typeof value === 'string' ? value : JSON.stringify(value, null, 2));

const baseSystem = `
You are an assistant for Divyanshu Charak's portfolio website.
Answer using only the provided portfolio data and any GitHub README content supplied.
If the answer is not in the data, say you don't have that information.
Keep responses concise, structured, and professional.
`.trim();

const portfolioContext = `
PORTFOLIO_DATA:
${toText(portfolioData)}
`.trim();

const safeRepoFromUrl = (repoUrl) => {
  if (!repoUrl) return null;
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
};

const fetchGitHubReadme = async (repoUrl) => {
  const repoInfo = safeRepoFromUrl(repoUrl);
  if (!repoInfo) return { readme: null, meta: null };

  const { owner, repo } = repoInfo;
  const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  const meta = metaRes.ok ? await metaRes.json() : null;

  const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: { Accept: 'application/vnd.github.raw' },
  });
  const readme = readmeRes.ok ? await readmeRes.text() : null;

  return { readme, meta };
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    const response = await openai.responses.create({
      model,
      input: [
        { role: 'system', content: baseSystem },
        { role: 'system', content: portfolioContext },
        ...history,
        { role: 'user', content: message },
      ],
    });

    const text = response.output_text;
    res.json({ text });
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

    const response = await openai.responses.create({
      model,
      input: [
        { role: 'system', content: baseSystem },
        { role: 'system', content: portfolioContext },
        { role: 'user', content: prompt },
      ],
    });

    res.json({ text: response.output_text });
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

    const response = await openai.responses.create({
      model,
      input: [
        { role: 'system', content: baseSystem },
        { role: 'system', content: portfolioContext },
        { role: 'user', content: prompt },
      ],
    });

    res.json({ text: response.output_text });
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

    const response = await openai.responses.create({
      model,
      input: [
        { role: 'system', content: baseSystem },
        { role: 'system', content: portfolioContext },
        { role: 'user', content: prompt },
      ],
    });

    res.json({ text: response.output_text });
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

app.listen(port, () => {
  console.log(`AI server running on http://localhost:${port}`);
});
