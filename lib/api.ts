import { PanelScript } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const MINIMAX_API_KEY = process.env.NEXT_PUBLIC_MINIMAX_API_KEY!;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

function validateEnvironment(): { isValid: boolean; message?: string } {
  if (!SUPABASE_URL) {
    return {
      isValid: false,
      message: 'NEXT_PUBLIC_SUPABASE_URL is not configured. Please check your .env file.',
    };
  }
  if (!SUPABASE_ANON_KEY) {
    return {
      isValid: false,
      message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. Please check your .env file.',
    };
  }
  if (!MINIMAX_API_KEY || MINIMAX_API_KEY === 'undefined') {
    return {
      isValid: false,
      message: 'NEXT_PUBLIC_MINIMAX_API_KEY is not configured. Please check your .env file and restart the development server.',
    };
  }
  return { isValid: true };
}

async function callEdgeFunction<T>(
  functionName: string,
  payload: any
): Promise<ApiResponse<T>> {
  const envCheck = validateEnvironment();
  if (!envCheck.isValid) {
    return {
      error: 'Configuration error',
      message: envCheck.message || 'Environment not configured correctly',
    };
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...payload, apiKey: MINIMAX_API_KEY }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'Unknown error',
        message: data.message || 'An error occurred',
      };
    }

    return { data };
  } catch (error: any) {
    return {
      error: 'Network error',
      message: error.message || 'Failed to connect to the server',
    };
  }
}

export async function generateScript(storyIdea: string) {
  return callEdgeFunction<{ script: { panels: PanelScript[] }; usage: any }>(
    'minimax-script',
    { storyIdea }
  );
}

export async function generateImage(
  prompt: string,
  subjectReferenceUrl?: string
) {
  return callEdgeFunction<{ imageUrl: string; taskId: string }>(
    'minimax-image',
    { prompt, subjectReferenceUrl }
  );
}

export async function generateSpeech(
  text: string,
  emotion: string,
  characterGender?: string,
  characterAge?: string,
  characterTrait?: string
) {
  return callEdgeFunction<{ audioUrl: string; taskId: string; emotion: string; voiceId: string }>(
    'minimax-speech',
    { text, emotion, characterGender, characterAge, characterTrait }
  );
}

export async function generateVideo(
  imageUrl: string,
  prompt: string,
  cameraMovement: string
) {
  return callEdgeFunction<{ videoUrl: string; taskId: string }>(
    'minimax-animate',
    { imageUrl, prompt, cameraMovement }
  );
}
