// editing/api/edit.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, instruction } = req.body;

  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      throw new Error('Missing OpenRouter API key in environment variables');
    }

    const prompt = `
You are an expert text editor.
Original text: "${input}"
Instruction: "${instruction}"
Please return only the edited text, no explanations.
`;

    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://your-app.vercel.app',
        'X-Title': 'EditGPT'
      },
      body: JSON.stringify({
        model: "x-ai/grok-4.1-fast:free",
        messages: [
          { role: "system", content: "You are a helpful text editor." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!openrouterResponse.ok) {
      const errorData = await openrouterResponse.json();
      throw new Error(`OpenRouter Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await openrouterResponse.json();
    const editedText = data.choices[0].message.content.trim();

    res.status(200).json({ editedText });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Edit failed',
      details: error.message
    });
  }
}
