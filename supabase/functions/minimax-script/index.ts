import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ScriptRequest {
  storyIdea: string;
  apiKey?: string;
}

interface PanelScript {
  panel_number: number;
  visual_prompt: string;
  dialogue: string;
  character_emotion: string;
  camera_movement: string;
  character_name?: string;
  character_gender?: string;
  character_age?: string;
  character_trait?: string;
}

const ERROR_MESSAGES: Record<number, string> = {
  1004: 'Authentication failed. Please check your MiniMax API key.',
  1008: 'Insufficient balance. Please add funds to your Minimax account at https://platform.minimax.io/user-center/payment/balance',
  1002: 'Rate limited. Please wait a moment and try again.',
  1039: 'Token limit exceeded. Please try a shorter story idea.',
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { storyIdea, apiKey }: ScriptRequest = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API key not provided',
          message: 'Please set your NEXT_PUBLIC_MINIMAX_API_KEY environment variable.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!storyIdea || storyIdea.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Story idea required',
          message: 'Please provide a story idea to generate a comic script.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a professional comic book writer. Generate a 4-panel comic script based on the user's story idea.

IMPORTANT: You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanations - just pure JSON.

The JSON must follow this exact structure:
{
  "panels": [
    {
      "panel_number": 1,
      "visual_prompt": "Detailed description of the scene, characters, setting, art style, composition",
      "dialogue": "Character dialogue or narration",
      "character_emotion": "happy|sad|angry|fearful|surprised|disgusted|neutral",
      "camera_movement": "Zoom In|Zoom Out|Pan Left|Pan Right|Tilt Up|Tilt Down|Static",
      "character_name": "Name of speaking character",
      "character_gender": "male|female|neutral",
      "character_age": "young|adult|elderly",
      "character_trait": "Brief voice trait like 'confident', 'timid', 'authoritative', 'gentle', etc"
    }
  ]
}

Rules:
- Generate exactly 4 panels
- Panel 1 establishes the main character and setting
- Each visual_prompt should be detailed and consistent in character description
- Use descriptive art direction (e.g., "manga style", "dramatic lighting", "close-up shot")
- character_emotion must be one of: happy, sad, angry, fearful, surprised, disgusted, neutral
- camera_movement adds cinematic flair
- Keep dialogue concise and impactful
- Include character metadata (name, gender, age, trait) for EVERY panel to enable appropriate voice selection
- character_gender should be: male, female, or neutral (for narrator)
- character_age should be: young (child/teen), adult, or elderly
- character_trait describes voice quality: confident, timid, authoritative, gentle, energetic, wise, etc`;

    const minimaxResponse = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Story idea: ${storyIdea}` }
        ],
        temperature: 0.8,
        max_tokens: 2048,
      }),
    });

    const responseText = await minimaxResponse.text();

    if (!minimaxResponse.ok) {
      return new Response(
        JSON.stringify({
          error: `API error: ${minimaxResponse.status}`,
          message: `MiniMax API returned error ${minimaxResponse.status}.`,
          details: responseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let minimaxData;
    try {
      minimaxData = JSON.parse(responseText);
    } catch {
      return new Response(
        JSON.stringify({
          error: 'Invalid response',
          message: 'The API returned an invalid response.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (minimaxData.base_resp?.status_code && minimaxData.base_resp.status_code !== 0) {
      const errorCode = minimaxData.base_resp.status_code;
      const errorMessage = ERROR_MESSAGES[errorCode] || minimaxData.base_resp.status_msg || 'Unknown error';

      return new Response(
        JSON.stringify({
          error: `Error ${errorCode}`,
          message: errorMessage
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const assistantMessage = minimaxData.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      return new Response(
        JSON.stringify({
          error: 'No response',
          message: 'The AI did not generate a script. Please try again.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let scriptData;
    try {
      const cleanedResponse = assistantMessage.replace(/```json\n?|```\n?/g, '').trim();
      scriptData = JSON.parse(cleanedResponse);
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: 'Invalid script format',
          message: 'The AI generated an invalid script format. Please try again.',
          raw: assistantMessage
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!scriptData.panels || !Array.isArray(scriptData.panels) || scriptData.panels.length !== 4) {
      return new Response(
        JSON.stringify({
          error: 'Invalid panel count',
          message: 'The script must contain exactly 4 panels.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        script: scriptData,
        usage: minimaxData.usage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        message: 'An unexpected error occurred. Please try again.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
