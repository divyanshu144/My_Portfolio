export default function handler(req, res) {
  res.json({
    ok: true,
    provider: process.env.GROQ_API_KEY ? 'groq' : process.env.XAI_API_KEY ? 'xai' : 'openai',
    env: {
      GROQ_API_KEY: process.env.GROQ_API_KEY ? `set (${process.env.GROQ_API_KEY.slice(0, 6)}...)` : 'missing',
      XAI_API_KEY:  process.env.XAI_API_KEY  ? `set (${process.env.XAI_API_KEY.slice(0, 6)}...)` : 'missing',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'set' : 'missing',
      MODEL: process.env.MODEL || 'not set',
    },
  });
}
