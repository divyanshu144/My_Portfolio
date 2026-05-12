import { ai, model, baseSystem, portfolioContext, portfolioData } from './_lib/context.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
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

    const response = await ai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: `${baseSystem}\n\n${portfolioContext}` },
        { role: 'user', content: prompt },
      ],
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error('Coach error:', error?.message || error);
    res.status(500).json({ error: 'Failed to generate interview coaching.' });
  }
}
