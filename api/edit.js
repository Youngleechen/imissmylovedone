// /api/edit.js
export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, instruction, model } = req.body || {};

  if (!input || !instruction || !model) {
    return res.status(400).json({ error: 'Missing input, instruction, or model' });
  }

  // ✅ ALLOWED MODELS — Must match IDs in index.html's FREE_MODELS
  const allowedModels = [
    'mistralai/mistral-7b-instruct:free',
    'x-ai/grok-4.1-fast:free',
    'meta-llama/llama-3-8b-instruct:free',
    'google/gemma-2-9b-it:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'meta-llama/llama-3.2-11b-vision-instruct:free',
    'deepseek/deepseek-coder-1.3b-instruct:free',
    'quasar/quasar-alpha:free'
  ];

  if (!allowedModels.includes(model)) {
    return res.status(400).json({ error: 'Model not allowed' });
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    console.error('❌ Missing OPENROUTER_API_KEY');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const prompt = `You are editing deeply personal writing—possibly grief, memory, or emotional pain. Follow these rules:

1. Fix ONLY clear spelling errors: "exempel"→"example", "skul"→"school", "youn"→"young", "bay"→"boy", "rone"→"ran", "cut" in "kitchen cut"→"cat".
2. Fix grammar: "fox jump" → "fox jumps".
3. NEVER change emotional phrasing.
4. Add quotes if text sounds like speech: e.g., “What is this?”
5. Return ONLY the edited text.

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
        model,
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
