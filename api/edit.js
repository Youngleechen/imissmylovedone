export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, instruction, model } = req.body || {};

  // Only allow Grok
  if (!input || !instruction || model !== 'x-ai/grok-4.1-fast:free') {
    return res.status(400).json({ error: 'Invalid input, instruction, or model. Only Grok is allowed.' });
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    console.error('❌ Missing OPENROUTER_API_KEY');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    // Updated prompt: request edits + reasoning
    const prompt = `You are editing deeply personal writing—possibly grief, memory, or emotional pain.

Your task has TWO parts:

PART 1: Edit the text by:
- Fixing clear spelling errors (e.g., "exempel" → "example", "skul" → "school", "youn" → "young", "bay" → "boy", "rone" → "ran", "kitchen cut" → "kitchen cat")
- Correcting grammar (e.g., "fox jump" → "fox jumps")
- Adding quotes if it's dialogue: e.g., “What is this?”
- NEVER altering emotional tone, voice, or meaningful phrasing

Return ONLY the edited text first.

PART 2: After the edited text, add exactly:
---
**Edit Reasoning:**  
Then list each change with a brief grammatical or orthographic justification (e.g., "‘jump’ → ‘jumps’: subject-verb agreement for third-person singular").

Instruction: "${instruction}"
Text: "${input}"`;

    const openRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': req.headers.origin || 'https://imissmylovedone.vercel.app',
        'X-Title': 'EditGPT'
      },
      body: JSON.stringify({
        model: 'x-ai/grok-4.1-fast:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800, // increased to accommodate reasoning
        temperature: 0.3
      })
    });

    const data = await openRes.json();

    if (!openRes.ok) {
      console.error('OpenRouter error:', data);
      return res.status(openRes.status).json({
        error: 'AI editing failed',
        details: data.error?.message || 'Unknown error'
      });
    }

    const editedText = data.choices?.[0]?.message?.content?.trim() || input;
    return res.status(200).json({ editedText });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
