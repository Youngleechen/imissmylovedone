// pages/api/edit.js
export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', details: 'Only POST is supported' });
  }

  const { input, instruction } = req.body;

  // Validate input
  if (!input || typeof input !== 'string' || !instruction || typeof instruction !== 'string') {
    return res.status(400).json({
      error: 'Invalid input',
      details: 'Both "input" and "instruction" must be non-empty strings'
    });
  }

  // 🔍 Debug log: incoming request
  console.log('[API/edit] Received request:', { inputLength: input.length, instruction });

  try {
    // ✅ CRITICAL: Ensure API key is set in Vercel
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      console.error('[API/edit] ❌ Missing OPENROUTER_API_KEY in environment variables!');
      return res.status(500).json({
        error: 'Server misconfiguration',
        details: 'OpenRouter API key is not configured. Please contact the site administrator.'
      });
    }

    // Use a reliable free model (grok may be unstable)
    const model = 'mistralai/mistral-7b-instruct:free'; // ✅ Known free & stable

    const messages = [
      {
        role: 'user',
        content: `You are an expert text editor. Edit the following text exactly as instructed. Return ONLY the edited text—no explanations, no markdown, no extra text.

Original: "${input}"
Instruction: "${instruction}"`
      }
    ];

    console.log('[API/edit] Calling OpenRouter with model:', model);

    const openrouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'https://your-app.vercel.app',
        'X-Title': 'EditGPT'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 600,
        temperature: 0.3 // lower = more deterministic
      })
    });

    // 🔍 Log OpenRouter response status
    console.log('[API/edit] OpenRouter status:', openrouterRes.status);

    let openrouterData;
    try {
      openrouterData = await openrouterRes.json();
    } catch (parseErr) {
      console.error('[API/edit] ❌ Failed to parse OpenRouter response as JSON');
      const text = await openrouterRes.text().catch(() => 'No body');
      console.error('[API/edit] Raw OpenRouter response:', text.slice(0, 500));
      return res.status(502).json({
        error: 'Invalid response from AI provider',
        details: 'The AI service returned malformed data'
      });
    }

    // Handle OpenRouter errors
    if (!openrouterRes.ok) {
      console.error('[API/edit] ❌ OpenRouter error:', openrouterData.error);
      return res.status(openrouterRes.status).json({
        error: 'AI editing failed',
        details: openrouterData.error?.message || 'Unknown error from OpenRouter'
      });
    }

    // Extract result
    const editedText = openrouterData?.choices?.[0]?.message?.content?.trim() || '';

    if (!editedText) {
      console.warn('[API/edit] ⚠️ Empty response from OpenRouter');
      return res.status(200).json({ editedText: input }); // fallback to original
    }

    console.log('[API/edit] ✅ Success! Returning edited text (length:', editedText.length, ')');
    return res.status(200).json({ editedText });

  } catch (error) {
    console.error('[API/edit] 🚨 UNEXPECTED ERROR:', error);

    // Avoid leaking stack traces
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred during editing'
    });
  }
}
