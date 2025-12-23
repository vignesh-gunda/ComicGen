import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SpeechRequest {
  text: string;
  emotion?: string;
  characterGender?: string;
  characterAge?: string;
  characterTrait?: string;
  apiKey?: string;
}

const ERROR_MESSAGES: Record<number, string> = {
  1004: 'Authentication failed. Please check your MiniMax API key.',
  1008: 'Insufficient balance. Please add funds to your Minimax account.',
  1002: 'Rate limited. Please wait a moment and try again.',
  1039: 'Text too long. Please shorten your dialogue.',
};

interface VoiceConfig {
  voice_id: string;
  speed: number;
  vol: number;
  pitch: number;
  emotion: string;
}

function cleanDialogueText(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/^[A-Za-z\s]+\s*\([^)]+\)\s*:\s*/g, '');
  cleaned = cleaned.replace(/^[A-Za-z\s]+\s*:\s*/g, '');
  cleaned = cleaned.replace(/\([^)]*\)/g, '');
  cleaned = cleaned.replace(/^(narration|narrator|thinking|thought)\s*:\s*/gi, '');
  cleaned = cleaned.trim();
  return cleaned;
}

function selectVoiceId(gender?: string, age?: string, trait?: string): string {
  const genderLower = gender?.toLowerCase() || '';
  const ageLower = age?.toLowerCase() || '';
  const traitLower = trait?.toLowerCase() || '';

  if (genderLower.includes('female') || genderLower.includes('woman') || genderLower.includes('girl')) {
    if (traitLower.includes('wise') || traitLower.includes('mature') || ageLower.includes('elderly')) {
      return 'Wise_Woman';
    }
    if (ageLower.includes('young') || ageLower.includes('child') || ageLower.includes('teen')) {
      return 'female-shaonv';
    }
    return 'female-yujie';
  }

  if (genderLower.includes('male') || genderLower.includes('man') || genderLower.includes('boy')) {
    if (ageLower.includes('young') || ageLower.includes('child') || ageLower.includes('teen')) {
      return 'male-qn-qingse';
    }
    if (traitLower.includes('deep') || traitLower.includes('authoritative') || traitLower.includes('commanding')) {
      return 'male-qn-jingying';
    }
    return 'male-qn-qingse';
  }

  return 'male-qn-qingse';
}

function calculateVoiceSettings(emotion: string): { speed: number; pitch: number; vol: number } {
  const emotionLower = emotion.toLowerCase();

  let speed = 1.0;
  let pitch = 1.0;
  let vol = 1.0;

  switch (emotionLower) {
    case 'happy':
    case 'excited':
      speed = 1.1;
      pitch = 1.2;
      vol = 1.0;
      break;
    case 'sad':
    case 'melancholy':
      speed = 0.85;
      pitch = 0.9;
      vol = 0.9;
      break;
    case 'angry':
    case 'furious':
      speed = 1.15;
      pitch = 0.95;
      vol = 1.0;
      break;
    case 'fearful':
    case 'scared':
      speed = 1.2;
      pitch = 1.15;
      vol = 0.95;
      break;
    case 'surprised':
    case 'shocked':
      speed = 1.1;
      pitch = 1.25;
      vol = 1.0;
      break;
    case 'disgusted':
      speed = 0.9;
      pitch = 0.85;
      vol = 0.95;
      break;
    case 'calm':
    case 'peaceful':
      speed = 0.95;
      pitch = 1.0;
      vol = 0.9;
      break;
    case 'neutral':
    default:
      speed = 1.0;
      pitch = 1.0;
      vol = 1.0;
      break;
  }

  return { speed, pitch, vol };
}

function mapEmotionToMinimax(emotion: string): string {
  const emotionLower = emotion.toLowerCase();
  const validEmotions = ['happy', 'sad', 'angry', 'fearful', 'surprised', 'disgusted', 'neutral'];

  if (validEmotions.includes(emotionLower)) {
    return emotionLower;
  }

  if (emotionLower.includes('excit')) return 'happy';
  if (emotionLower.includes('fear') || emotionLower.includes('scare')) return 'fearful';
  if (emotionLower.includes('shock')) return 'surprised';

  return 'neutral';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const {
      text,
      emotion = 'neutral',
      characterGender,
      characterAge,
      characterTrait,
      apiKey
    }: SpeechRequest = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API key not provided',
          message: 'Please set your NEXT_PUBLIC_MINIMAX_API_KEY environment variable.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Text required',
          message: 'Please provide text for speech generation.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanedText = cleanDialogueText(text);

    if (!cleanedText || cleanedText.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No valid dialogue',
          message: 'No speakable text found after cleaning.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const voiceId = selectVoiceId(characterGender, characterAge, characterTrait);
    const { speed, pitch, vol } = calculateVoiceSettings(emotion);
    const mappedEmotion = mapEmotionToMinimax(emotion);

    const requestBody = {
      model: 'speech-02-turbo',
      text: cleanedText,
      stream: false,
      output_format: 'url',
      voice_setting: {
        voice_id: voiceId,
        speed: Number(speed.toFixed(2)),
        vol: Number(vol.toFixed(2)),
        pitch: Number(pitch.toFixed(2)),
        emotion: mappedEmotion
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
        channel: 1
      }
    };

    const minimaxResponse = await fetch('https://api.minimax.io/v1/t2a_v2', {
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
          message: errorMessage,
          details: responseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioUrl = minimaxData.data?.audio;

    if (!audioUrl) {
      return new Response(
        JSON.stringify({
          error: 'No audio generated',
          message: 'The API did not generate audio. Please try again.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        audioUrl: audioUrl,
        taskId: minimaxData.trace_id,
        emotion: mappedEmotion,
        voiceId: voiceId
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
