import OpenAI from 'openai';
import { baseSystem, portfolioContext, portfolioData } from './portfolioContext.js';

const provider = process.env.XAI_API_KEY  ? 'xai'
               : process.env.GROQ_API_KEY ? 'groq'
               : 'openai';

const BASE_URLS = {
  xai:  'https://api.x.ai/v1',
  groq: 'https://api.groq.com/openai/v1',
};
const DEFAULT_MODELS = {
  xai:    'grok-3-mini',
  groq:   'openai/gpt-oss-120b',
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

export { baseSystem, portfolioContext, portfolioData };
