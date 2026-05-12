import { ai, model, baseSystem, portfolioContext } from './_lib/context.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
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

    const response = await ai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: `${baseSystem}\n\n${portfolioContext}` },
        { role: 'user', content: prompt },
      ],
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error('Resume error:', error?.message || error);
    res.status(500).json({ error: 'Failed to generate resume content.' });
  }
}
