import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cdskvspoucbfwnhiofoy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkc2t2c3BvdWNiZnduaGlvZm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzYyNDgsImV4cCI6MjA2MDMxMjI0OH0.I7TKi8sjt5iXVa64BqWA3ASVPCsDWWJwAWUGQ_6hfAg'
const authRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || 'https://momentum-testt.netlify.app/auth/callback'

// Log the values to help with debugging
console.log('Environment:', import.meta.env.MODE)
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Key is defined' : 'Key is undefined')
console.log('Auth Redirect URL:', authRedirectUrl)

// Export the redirect URL for use in other components
export const REDIRECT_URL = authRedirectUrl

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)