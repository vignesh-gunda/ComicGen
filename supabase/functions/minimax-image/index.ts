import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ImageRequest {
  prompt: string;
  subjectReferenceUrl?: string;
  apiKey?: string;
}

const ERROR_MESSAGES: Record<number, string> = {
  1004: 'Authentication failed. Please check your MiniMax API key.',
  1008: 'Insufficient balance. Please add funds to your Minimax account.',
  1002: 'Rate limited. Please wait a moment and try again.',
  1039: 'Prompt too long. Please shorten your description.',
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { prompt, subjectReferenceUrl, apiKey }: ImageRequest = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API key not provided',
          message: 'Please set your NEXT_PUBLIC_MINIMAX_API_KEY environment variable.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Prompt required',
          message: 'Please provide a prompt for image generation.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody: any = {
      model: 'image-01',
      prompt: prompt,
      aspect_ratio: '1:1',
    };

    if (subjectReferenceUrl) {
      requestBody.subject_reference = [{
        type: 'character',
        image_file: subjectReferenceUrl
      }];
    }

    const minimaxResponse = await fetch('https://api.minimax.io/v1/image_generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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

    const imageUrl = minimaxData.data?.image_urls?.[0];

    if (!imageUrl) {
      return new Response(
        JSON.stringify({
          error: 'No image generated',
          message: 'The API did not generate an image. Please try again.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        imageUrl: imageUrl,
        taskId: minimaxData.task_id
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