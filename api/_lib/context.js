import { createRequire } from 'module';
import OpenAI from 'openai';

const require = createRequire(import.meta.url);
const portfolioData = require('../../data/portfolioData.json');

const provider = process.env.XAI_API_KEY  ? 'xai'
               : process.env.GROQ_API_KEY ? 'groq'
               : 'openai';

const BASE_URLS = {
  xai:  'https://api.x.ai/v1',
  groq: 'https://api.groq.com/openai/v1',
};
const DEFAULT_MODELS = {
  xai:    'grok-3-mini',
  groq:   'llama-3.3-70b-versatile',
  openai: 'gpt-4o-mini',
};

const apiKey = process.env.XAI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('No AI API key set. Add GROQ_API_KEY, XAI_API_KEY, or OPENAI_API_KEY to environment variables.');
}

export const ai = new OpenAI({
  apiKey: apiKey || 'missing',
  ...(BASE_URLS[provider] && { baseURL: BASE_URLS[provider] }),
});

export const model = process.env.MODEL || DEFAULT_MODELS[provider];

const buildContext = () => {
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

  const projectBlock = d.projects
    .map(p => `  ${p.name} (${p.tech.join(', ')})\n    ${p.summary}${p.highlights ? '\n' + p.highlights.map(h => `    • ${h}`).join('\n') : ''}`)
    .join('\n\n');

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

export const baseSystem = `
You are the AI assistant on Divyanshu Charak's portfolio website. You represent Divyanshu to recruiters, hiring managers, and visitors.

Your job is to answer questions about Divyanshu confidently, accurately, and professionally — as if you personally know him well.

STRICT RULES:
- Never mention "README", "portfolio data", "JSON", "context", "the data shows", or any reference to how you obtained information. You simply know these facts about Divyanshu.
- Never say "based on the provided information" or "according to the text". Speak directly: "Divyanshu has..." or "He built..." or "His skills include..."
- Never speculate or add skills/experience not in the context. If genuinely unsure, say "I don't have that detail — reach out to Divyanshu directly at ${portfolioData.contact.email}"
- Keep answers concise and recruiter-friendly. Use bullet points for lists. Avoid walls of text.
- Tone: confident, professional, warm. You are an advocate for Divyanshu, not a search engine.
- For visa questions: he has applied for the UK Graduate Route visa — 2 years of unrestricted work rights once granted, no sponsorship needed.
- For availability: he is actively looking for roles in AI/ML engineering, data engineering, full-stack, or backend development.
`.trim();

export const portfolioContext = buildContext();
export { portfolioData };
