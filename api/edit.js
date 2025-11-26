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
    console.error('❌ Missing OPENROUTER_API_KEY in Vercel environment variables!');
    return res.status(500).json({
      error: 'Server misconfiguration',
      details: 'OpenRouter API key is missing.'
    });
  }

  try {
    // 🔥 Using Grok 4.1 Fast (free) — as requested
    const model = 'x-ai/grok-4.1-fast:free';

    // 🧠 Smarter prompt: guides Grok to be precise & empathetic
    const prompt = `You are editing deeply personal writing—possibly grief, memory, or emotional pain. Follow these rules strictly:

1. Fix ONLY clear spelling errors:
   - "exempel" → "example"
   - "skul" → "school"
   - "youn" → "young"
   - "bay" → "boy"
   - "rone" → "ran"
   - "cut" in "kitchen cut" → "cat"

2. Fix subject-verb agreement: "fox jump" → "fox jumps"

3. NEVER rewrite emotional phrasing. If someone writes "i miss him so bad", do NOT change it to "very much".

4. Add minimal punctuation: commas, question marks, sentence caps.

5. Return ONLY the final edited text—no explanations, no notes, no markdown.

User instruction: "${instruction}"

Text to edit: "${input}"`;

    const openRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': req.headers.origin || 'https://imissmylovedone.vercel.app',
        'X-Title': 'EditGPT'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.2 // Grok is bold — lower temp keeps it focused
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
    console.error('Unexpected error in /api/edit:', err);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred.'
    });
  }
}
