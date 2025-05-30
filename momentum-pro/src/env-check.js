// This file is used to verify that environment variables are properly loaded
// It will be included in the build and can be accessed at /env-check.txt

const envInfo = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
  authRedirectUrl: import.meta.env.VITE_AUTH_REDIRECT_URL ? 'Set' : 'Not set',
  mode: import.meta.env.MODE,
  prod: import.meta.env.PROD,
  buildTime: new Date().toISOString()
};

export default envInfo;