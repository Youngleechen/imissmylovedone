// Backend API Route (/api/edit.js)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, instruction, model, editLevel } = req.body || {};

  // Only allow Grok model
  if (model !== 'x-ai/grok-4.1-fast:free') {
    return res.status(400).json({ error: 'Only Grok model is allowed' });
  }

  if (!input || !instruction || !editLevel) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    console.error('❌ Missing OPENROUTER_API_KEY');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    let systemPrompt = '';
    
    // Special handling for proofreading level
    if (editLevel === 'proofread') {
      systemPrompt = `You are an expert proofreader specializing in minimal corrections. Your task has TWO parts:
      
PART 1: Edit the text by:
- Fixing ONLY clear spelling errors (e.g., "kno" → "know", "doent" → "doesn't")
- Correcting grammar (subject-verb agreement, tense consistency)
- Adding necessary punctuation (commas, periods, question marks)
- Capitalizing proper nouns and sentence starts
- NEVER altering emotional tone, voice, or meaningful phrasing
- NEVER rewording sentences unless they're grammatically incorrect
- Preserving all original metaphors, idioms, and stylistic choices

PART 2: After the edited text, add exactly:
---
**Edit Reasoning:**  
Then list each change with a brief justification in this format:
- "original" → "edited": reason (grammatical rule)
- "jump" → "jumps": subject-verb agreement for third-person singular
- "whom" → "who": correct pronoun case for subject position
      
Return ONLY the edited text followed by the reasoning section.`;
    } else {
      systemPrompt = `You are an expert editor. Follow the user's instruction precisely while maintaining the core meaning of the text.`;
    }

    const userPrompt = `Instruction: "${instruction}"
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
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: editLevel === 'proofread' ? 0.1 : 0.5 // Lower temp for accuracy in proofreading
      })
    });

    const data = await openRes.json();

    if (!openRes.ok) {
      console.error('OpenRouter error:', JSON.stringify(data));
      return res.status(openRes.status).json({
        error: 'AI editing failed',
        details: data.error?.message || 'Unknown error'
      });
    }

    const editedText = data.choices?.[0]?.message?.content?.trim() || input;
    return res.status(200).json({ editedText });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
