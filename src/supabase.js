import { createClient } from '@supabase/supabase-js';

// Get environment variables or use placeholders for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Create a mock Supabase client if we're in development with placeholder values
const isMockClient = supabaseUrl.includes('placeholder');

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// If we're using a mock client, override methods to prevent errors
if (isMockClient) {
  console.warn('Using mock Supabase client. Please set up your .env file with valid Supabase credentials.');
  
  // Mock authentication methods
  supabase.auth = {
    ...supabase.auth,
    getUser: async () => ({ data: { user: null }, error: null }),
    signUp: async () => ({ data: { user: { id: 'mock-user-id', email: 'mock@example.com' } }, error: null }),
    signInWithPassword: async (credentials) => {
      // Simple mock authentication
      if (credentials.email === 'test@example.com' && credentials.password === 'password') {
        return { 
          data: { 
            user: { id: 'mock-user-id', email: credentials.email } 
          }, 
          error: null 
        };
      }
      return { data: null, error: { message: 'Invalid login credentials' } };
    },
    signInWithOAuth: async ({ provider }) => {
      console.log(`Mock OAuth sign-in with ${provider}`);
      // In a real environment, this would redirect to the provider's auth page
      // For development, we'll just log and return a mock response
      if (provider === 'github') {
        window.alert('In production, this would redirect to GitHub for authentication. For development, we\'ll simulate a successful login.');
        return { 
          data: { provider, url: 'https://github.com/login/oauth/authorize' },
          error: null 
        };
      }
      return { data: null, error: { message: `Provider ${provider} not supported in mock mode` } };
    },
    signOut: async () => ({ error: null })
  };
  
  // Mock database methods
  const mockTasks = [
    { id: 1, title: 'Complete Phase 1', is_complete: false, user_id: 'mock-user-id', inserted_at: new Date().toISOString() },
    { id: 2, title: 'Start Phase 2', is_complete: false, user_id: 'mock-user-id', inserted_at: new Date().toISOString() }
  ];
  
  supabase.from = (table) => {
    if (table === 'tasks') {
      return {
        select: () => ({
          order: () => Promise.resolve({ data: mockTasks, error: null }),
          eq: () => Promise.resolve({ data: mockTasks, error: null })
        }),
        insert: (task) => Promise.resolve({ 
          data: { ...task, id: Date.now(), inserted_at: new Date().toISOString() }, 
          error: null 
        }),
        update: (updates) => ({
          eq: () => Promise.resolve({ data: { ...updates }, error: null })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: null })
        })
      };
    }
    return supabase.from(table);
  };
}