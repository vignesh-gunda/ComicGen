import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnimateRequest {
  imageUrl: string;
  prompt: string;
  cameraMovement?: string;
  apiKey?: string;
}

const ERROR_MESSAGES: Record<number, string> = {
  1004: 'Authentication failed. Please check your MiniMax API key.
  1008: 'Insufficient balance. Please add funds to your Minimax account.',
  1002: 'Rate limited. Please wait a moment and try again.',
  1039: 'Prompt too long. Please shorten your description.',
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { imageUrl, prompt, cameraMovement = 'Static', apiKey }: AnimateRequest = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API key not provided',
          message: 'Please set your NEXT_PUBLIC_MINIMAX_API_KEY environment variable.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!imageUrl || imageUrl.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Image URL required',
          message: 'Please provide an image URL for animation.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Prompt required',
          message: 'Please provide a prompt for animation.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const enhancedPrompt = `${prompt} [${cameraMovement}]`;

    const minimaxResponse = await fetch('https://api.minimax.io/v1/video_generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'video-01',
        prompt: enhancedPrompt,
        first_frame_image: imageUrl
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

    const taskId = minimaxData.task_id;

    if (!taskId) {
      return new Response(
        JSON.stringify({
          error: 'No task ID',
          message: 'The API did not return a task ID. Please try again.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let attempts = 0;
    const maxAttempts = 60;
    let videoUrl = null;

    while (attempts < maxAttempts && !videoUrl) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const statusResponse = await fetch(`https://api.minimax.io/v1/query/video_generation?task_id=${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const statusText = await statusResponse.text();
      let statusData;
      
      try {
        statusData = JSON.parse(statusText);
      } catch {
        attempts++;
        continue;
      }

      if (statusData.data?.status === 'Success' && statusData.data?.file_id) {
        videoUrl = `https://api.minimax.io/v1/files/retrieve?file_id=${statusData.data.file_id}`;
        break;
      } else if (statusData.data?.status === 'Failed') {
        return new Response(
          JSON.stringify({
            error: 'Generation failed',
            message: 'Video generation failed. Please try again.'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      attempts++;
    }

    if (!videoUrl) {
      return new Response(
        JSON.stringify({
          error: 'Timeout',
          message: 'Video generation timed out. Please try again.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        videoUrl: videoUrl,
        taskId: taskId
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