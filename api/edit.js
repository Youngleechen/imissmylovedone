// api/edit.js
export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, instruction, model } = req.body || {};

  const allowedModels = [
    'mistralai/mistral-7b-instruct:free',
    'x-ai/grok-4.1-fast:free',
    'meta-llama/llama-3-8b-instruct:free',
    'google/gemma-2-9b-it:free'
  ];

  if (!input || !instruction || !model || !allowedModels.includes(model)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const prompt = `Fix spelling and grammar. Return only the edited text.

Text: "${input}"
Instruction: "${instruction}"`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': req.headers.origin || 'https://imissmylovedone.vercel.app',
        'X-Title': 'EditGPT'
      },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'AI failed', details: data.error?.message });
    }

    const editedText = data.choices?.[0]?.message?.content?.trim() || input;
    return res.status(200).json({ editedText });

  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
