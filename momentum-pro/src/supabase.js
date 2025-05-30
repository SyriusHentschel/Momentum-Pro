import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, APP_CONFIG } from './config'

// Log the values to help with debugging
console.log('Environment:', APP_CONFIG.mode)
console.log('Build ID:', APP_CONFIG.buildId)
console.log('Supabase URL:', SUPABASE_CONFIG.url)
console.log('Supabase Anon Key:', SUPABASE_CONFIG.anonKey ? 'Key is defined' : 'Key is undefined')
console.log('Auth Redirect URL:', SUPABASE_CONFIG.redirectUrl)

// Export the redirect URL for use in other components
export const REDIRECT_URL = SUPABASE_CONFIG.redirectUrl

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)