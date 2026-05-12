export default function handler(req, res) {
  res.json({ ok: true, provider: process.env.GROQ_API_KEY ? 'groq' : process.env.XAI_API_KEY ? 'xai' : 'openai' });
}
