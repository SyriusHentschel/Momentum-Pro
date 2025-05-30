// This file is used to debug Netlify deployments
console.log('Netlify environment variables:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Set' : 'Not set');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
console.log('VITE_AUTH_REDIRECT_URL:', process.env.VITE_AUTH_REDIRECT_URL ? 'Set' : 'Not set');

// Check if we're running in Netlify
console.log('NETLIFY:', process.env.NETLIFY ? 'Yes' : 'No');
console.log('CONTEXT:', process.env.CONTEXT || 'Not set');
console.log('DEPLOY_URL:', process.env.DEPLOY_URL || 'Not set');
console.log('DEPLOY_PRIME_URL:', process.env.DEPLOY_PRIME_URL || 'Not set');
console.log('URL:', process.env.URL || 'Not set');

// Export for potential use in other files
export const netlifyInfo = {
  isNetlify: !!process.env.NETLIFY,
  context: process.env.CONTEXT,
  deployUrl: process.env.DEPLOY_URL,
  deployPrimeUrl: process.env.DEPLOY_PRIME_URL,
  url: process.env.URL,
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
  authRedirectUrl: process.env.VITE_AUTH_REDIRECT_URL
};