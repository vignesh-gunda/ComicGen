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
      value: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiJWaWduZXNoIEd1bmRhIiwiVXNlck5hbWUiOiJOL0EiLCJBY2NvdW50IjoiIiwiU3ViamVjdElEIjoiMjAwMTc2NzA1ODU1OTIwOTY3MiIsIlBob25lIjoiIiwiR3JvdXBJRCI6IjIwMDE3NjcwNTg1NTUwMTk0NjQiLCJQYWdlTmFtZSI6IiIsIk1haWwiOiJ2Z3VuZGEud29ya0BnbWFpbC5jb20iLCJDcmVhdGVUaW1lIjoiMjAyNS0xMi0yMyAxNTowNzoxMyIsIlRva2VuVHlwZSI6MSwiaXNzIjoibWluaW1heCJ9.TxVkVLwxpgfyNmXyd660wiWBFTxgXPMNSyVYXjbOut3zbiABcMxlJAJJGTTp2eCkOQvcpAoyF5kN1lvQu9GlFxOVbNvIO3V-JVUtRCAMFwWSFmp2sJZ0FiL5fgVlHFxyTsVcoBKVvv-Mb5dqB218n48Ll58pwJ_z5PkYf1tOoyp5GlCuKYYJwR6isouFufzqjy71-Rwv_4c8ZSUS0mmssLaRw4k5nqigBy52xjARM7ldzYw9xLYWIJ7kxekE-PI-8wX9XYFEA4e5BNknLb-16NikmqJYfpKVWELs0gjkWeB64BbxE6JmxF5VGGBm9laK4mqEoXpRS4os4ON2yF0HVQ",
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
