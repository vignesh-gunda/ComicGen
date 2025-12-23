import { PanelScript } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const MINIMAX_API_KEY = eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJWaWduZXNoIEd1bmRhIiwiVXNlck5hbWUiOiJOL0EiLCJBY2NvdW50IjoiIiwiU3ViamVjdElEIjoiMjAwMTc2NzA1ODU1OTIwOTY3MiIsIlBob25lIjoiIiwiR3JvdXBJRCI6IjIwMDE3NjcwNTg1NTUwMTk0NjQiLCJQYWdlTmFtZSI6IiIsIk1haWwiOiJ2Z3VuZGEud29ya0BnbWFpbC5jb20iLCJDcmVhdGVUaW1lIjoiMjAyNS0xMi0yMyAxNTowNzoxMyIsIlRva2VuVHlwZSI6MSwiaXNzIjoibWluaW1heCJ9.TxVkVLwxpgfyNmXyd660wiWBFTxgXPMNSyVYXjbOut3zbiABcMxlJAJJGTTp2eCkOQvcpAoyF5kN1lvQu9GlFxOVbNvIO3V-JVUtRCAMFwWSFmp2sJZ0FiL5fgVlHFxyTsVcoBKVvv-Mb5dqB218n48Ll58pwJ_z5PkYf1tOoyp5GlCuKYYJwR6isouFufzqjy71-Rwv_4c8ZSUS0mmssLaRw4k5nqigBy52xjARM7ldzYw9xLYWIJ7kxekE-PI-8wX9XYFEA4e5BNknLb-16NikmqJYfpKVWELs0gjkWeB64BbxE6JmxF5VGGBm9laK4mqEoXpRS4os4ON2yF0HVQ!;

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
