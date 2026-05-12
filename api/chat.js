import { ai, model, baseSystem, portfolioContext } from './_lib/context.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { message, history = [] } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    const response = await ai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: `${baseSystem}\n\n${portfolioContext}` },
        ...history,
        { role: 'user', content: message },
      ],
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error('Chat error:', error?.message || error);
    res.status(500).json({ error: 'Failed to generate response.' });
  }
}
