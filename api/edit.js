// api/edit.js
export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, instruction } = req.body || {};

  if (!input || !instruction) {
    return res.status(400).json({ error: 'Both "input" and "instruction" are required' });
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    console.error('❌ Missing OPENROUTER_API_KEY in environment variables!');
    return res.status(500).json({
      error: 'Server misconfiguration',
      details: 'OpenRouter API key is missing. Please contact the site administrator.'
    });
  }

  try {
    const prompt = `You are a precise text editor. Edit the following text exactly as instructed. Return ONLY the final edited text — no explanations, no prefixes, no markdown.

Text: "${input}"
Instruction: "${instruction}"`;

    const openRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': req.headers.origin || 'https://your-app.vercel.app',
        'X-Title': 'EditGPT'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free', // ✅ Reliable free model
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.3
      })
    });

    const data = await openRes.json();

    if (!openRes.ok) {
      console.error('OpenRouter error:', data);
      return res.status(openRes.status).json({
        error: 'AI editing failed',
        details: data.error?.message || 'Unknown error from OpenRouter'
      });
    }

    const editedText = data.choices?.[0]?.message?.content?.trim() || input;
    return res.status(200).json({ editedText });

  } catch (err) {
    console.error('Unexpected server error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred during editing'
    });
  }
}
