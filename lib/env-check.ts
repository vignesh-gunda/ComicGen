export function checkEnvironment() {
  const checks = {
    supabaseUrl: {
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      isValid: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
    supabaseAnonKey: {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isValid: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    minimaxApiKey: {
      key: 'NEXT_PUBLIC_MINIMAX_API_KEY',
      value: process.env.NEXT_PUBLIC_MINIMAX_API_KEY,
      isValid: !!process.env.NEXT_PUBLIC_MINIMAX_API_KEY &&
               process.env.NEXT_PUBLIC_MINIMAX_API_KEY !== 'undefined',
    },
  };

  const allValid = Object.values(checks).every((check) => check.isValid);

  return {
    checks,
    allValid,
    missingKeys: Object.entries(checks)
      .filter(([_, check]) => !check.isValid)
      .map(([_, check]) => check.key),
  };
}

export function getMaskedApiKey(apiKey: string | undefined): string {
  if (!apiKey || apiKey === 'undefined') {
    return 'NOT SET';
  }
  if (apiKey.length < 20) {
    return 'INVALID (too short)';
  }
  return `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 10)}`;
}
