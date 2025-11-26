// pages/api/edit.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, style = 'fluent', model } = req.body || {};

  // Only allow Grok
  if (!input || model !== 'x-ai/grok-4.1-fast:free') {
    return res.status(400).json({ error: 'Invalid input or model. Only Grok is allowed.' });
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    console.error('❌ Missing OPENROUTER_API_KEY');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  // Style-specific instructions
  const STYLE_CONFIG = {
    faithful: {
      instruction: "Fix spelling, grammar, and punctuation errors. Do not change any wording, phrasing, or structure—even if awkward. Preserve every stylistic choice.",
      guidelines: `- Fix ONLY spelling, grammar, and punctuation.
- NEVER alter phrasing, rhythm, word choice, or sentence structure.
- Preserve all original emphasis, repetition, and voice—even if imperfect.
- Do not add words or contractions unless required for basic grammar.`
    },
    fluent: {
      instruction: "Improve clarity, fluency, and natural rhythm while preserving the author’s voice and emotional tone.",
      guidelines: `- Fix errors AND improve unnatural or clumsy phrasing to sound like natural human speech.
- You may add contractions, adjust punctuation (e.g., em dashes, commas), clarify ambiguous pronouns, or slightly reorder words for flow.
- Keep emotional tone, core meaning, and personal voice 100% intact.
- Favor conversational, authentic narration.`
    },
    polished: {
      instruction: "Polish for publication-quality prose: enhance flow, clarity, and word choice while honoring the author’s intent.",
      guidelines: `- Fix all errors and refine for professional clarity.
- Improve sentence variety, eliminate redundancy, and choose precise words.
- Ensure consistent tense, POV, and tone.
- Never distort the author’s voice or emotional truth—even if enhancing style.`
    }
  };

  const config = STYLE_CONFIG[style] || STYLE_CONFIG.fluent;

  const prompt = `You are an expert editor working with deeply personal or literary writing.

${config.guidelines}

Return ONLY the edited text—no explanations, no markdown, no extra text.

Instruction: "${config.instruction}"
Text: "${input}"`;

  try {
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
        max_tokens: 1200, // enough for most paragraphs
        temperature: style === 'polished' ? 0.4 : 0.2
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
