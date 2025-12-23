// import { PanelScript } from './types';

// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY!;

// interface ApiResponse<T> {
//   data?: T;
//   error?: string;
//   message?: string;
// }

// function validateEnvironment(): { isValid: boolean; message?: string } {
//   if (!SUPABASE_URL) {
//     return {
//       isValid: false,
//       message: 'NEXT_PUBLIC_SUPABASE_URL is not configured. Please check your .env file.',
//     };
//   }
//   if (!SUPABASE_ANON_KEY) {
//     return {
//       isValid: false,
//       message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. Please check your .env file.',
//     };
//   }
//   if (!MINIMAX_API_KEY) {
//     return {
//       isValid: false,
//       message: 'no minimaxapi key'
//     };
//   }
//   return { isValid: true };
// }

// async function callEdgeFunction<T>(
//   functionName: string,
//   payload: any
// ): Promise<ApiResponse<T>> {
//   const envCheck = validateEnvironment();
//   if (!envCheck.isValid) {
//     return {
//       error: 'Configuration error',
//       message: envCheck.message || 'Environment not configured correctly',
//     };
//   }

//   try {
//     const response = await fetch(
//       `${SUPABASE_URL}/functions/v1/${functionName}`,
//       {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ ...payload, apiKey: MINIMAX_API_KEY }),
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       return {
//         error: data.error || 'Unknown error',
//         message: data.message || 'An error occurred',
//       };
//     }

//     return { data };
//   } catch (error: any) {
//     return {
//       error: 'Network error',
//       message: error.message || 'Failed to connect to the server',
//     };
//   }
// }

// export async function generateScript(storyIdea: string) {
//   return callEdgeFunction<{ script: { panels: PanelScript[] }; usage: any }>(
//     'minimax-script',
//     { storyIdea }
//   );
// }

// export async function generateImage(
//   prompt: string,
//   subjectReferenceUrl?: string
// ) {
//   return callEdgeFunction<{ imageUrl: string; taskId: string }>(
//     'minimax-image',
//     { prompt, subjectReferenceUrl }
//   );
// }

// export async function generateSpeech(
//   text: string,
//   emotion: string,
//   characterGender?: string,
//   characterAge?: string,
//   characterTrait?: string
// ) {
//   return callEdgeFunction<{ audioUrl: string; taskId: string; emotion: string; voiceId: string }>(
//     'minimax-speech',
//     { text, emotion, characterGender, characterAge, characterTrait }
//   );
// }

// export async function generateVideo(
//   imageUrl: string,
//   prompt: string,
//   cameraMovement: string
// ) {
//   return callEdgeFunction<{ videoUrl: string; taskId: string }>(
//     'minimax-animate',
//     { imageUrl, prompt, cameraMovement }
//   );
// }


import { PanelScript } from './types';

// Hardcoded Supabase configuration
const SUPABASE_URL = 'https://byjgwaykvgbmztecggzk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5amd3YXlrdmdibXp0ZWNnZ3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzQ0NjMsImV4cCI6MjA4MTg1MDQ2M30.WwHpFEurX1SEdy8FETJz1njNEXpOIvOxMBfpDP2mPnM';

// localStorage key for user-provided API key
const API_KEY_STORAGE_KEY = 'minimax_api_key';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Helper function to save user's API key to localStorage
export function setUserApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  }
}

// Helper function to get user's API key from localStorage
export function getUserApiKey(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  }
  return null;
}

// Helper function to clear user's API key
export function clearUserApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

// Get API key from localStorage first, then fall back to env variable
function getApiKey(): string | null {
  // First check localStorage for user-provided key
  const userKey = getUserApiKey();
  if (userKey) return userKey;

  // Fall back to environment variable
  const envKey = process.env.NEXT_PUBLIC_MINIMAX_API_KEY;
  if (envKey && envKey !== 'undefined') return envKey;

  return null;
}

function validateEnvironment(): { isValid: boolean; message?: string } {
  // Supabase values are now hardcoded, so no need to validate them
  
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      isValid: false,
      message: 'MiniMax API key is not configured. Please enter your API key.',
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

  const apiKey = getApiKey();

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...payload, apiKey }),
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
