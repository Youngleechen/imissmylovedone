// supabase/functions/ai-edit/index.js
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://imissmylovedone.vercel.app',
        'X-Title': 'Book Editor'
      },
      body: JSON.stringify({
        model: 'xai/grok-4.1-fast',
        messages: [
          { role: 'system', content: 'You are a compassionate book editor. Improve clarity, flow, and emotional depth while preserving the author’s voice. Return ONLY the edited text.' },
          { role: 'user', content: text }
        ],
        temperature: 0.4
      })
    });

    const data = await response.json();
    const edited = data.choices?.[0]?.message?.content?.trim() || 'No result';

    return new Response(JSON.stringify({ edited }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Editing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});
