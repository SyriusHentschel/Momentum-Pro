// This file contains configuration that will be used throughout the application
// It centralizes all environment variables and provides fallbacks

// Supabase configuration
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://cdskvspoucbfwnhiofoy.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkc2t2c3BvdWNiZnduaGlvZm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzYyNDgsImV4cCI6MjA2MDMxMjI0OH0.I7TKi8sjt5iXVa64BqWA3ASVPCsDWWJwAWUGQ_6hfAg',
  redirectUrl: import.meta.env.VITE_AUTH_REDIRECT_URL || 'https://momentum-testt.netlify.app/auth/callback'
};

// Application configuration
export const APP_CONFIG = {
  name: 'Momentum Pro',
  version: '1.0.0',
  buildDate: '2025-05-30T05:40:00Z',
  buildId: 'FORCE-REBUILD-003',
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  mode: import.meta.env.MODE
};

// Log configuration on load (will appear in console)
console.log('App config loaded:', APP_CONFIG);
console.log('Supabase URL:', SUPABASE_CONFIG.url);
console.log('Auth Redirect URL:', SUPABASE_CONFIG.redirectUrl);