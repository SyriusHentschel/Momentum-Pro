import { createClient } from '@supabase/supabase-js';

// Get environment variables or use placeholders for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Force development mode for now due to API key issues
const isMockClient = true; // Force mock client

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// If we're using a mock client, override methods to prevent errors
if (isMockClient) {
  console.warn('Using mock Supabase client. Please set up your .env file with valid Supabase credentials.');
  
  // Mock authentication methods
  // Use localStorage to persist mock user between page refreshes
  let mockUser = null;
  try {
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      mockUser = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error('Error accessing localStorage for user:', e);
  }
  
  // Helper function to save user to localStorage
  const saveMockUser = (user) => {
    try {
      if (user) {
        localStorage.setItem('mockUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('mockUser');
      }
    } catch (e) {
      console.error('Error saving user to localStorage:', e);
    }
  };
  
  supabase.auth = {
    ...supabase.auth,
    getUser: async () => ({ data: { user: mockUser }, error: null }),
    signUp: async ({ email, password }) => {
      // Create a new mock user
      mockUser = { 
        id: 'mock-user-id', 
        email, 
        user_metadata: { name: email.split('@')[0] } 
      };
      saveMockUser(mockUser);
      return { data: { user: mockUser }, error: null };
    },
    signInWithPassword: async ({ email, password }) => {
      // Accept any credentials in development mode
      mockUser = { 
        id: 'mock-user-id', 
        email, 
        user_metadata: { name: email.split('@')[0] } 
      };
      saveMockUser(mockUser);
      return { data: { user: mockUser }, error: null };
    },
    signInWithOAuth: async ({ provider, options }) => {
      console.log(`Mock OAuth sign-in with ${provider}`);
      
      if (provider === 'github') {
        // Create a GitHub mock user
        mockUser = { 
          id: 'mock-github-user', 
          email: 'github-user@example.com', 
          user_metadata: { 
            name: 'GitHub User',
            avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
          } 
        };
        saveMockUser(mockUser);
        
        // In development mode, we'll return the user directly instead of redirecting
        return { 
          data: { user: mockUser },
          error: null 
        };
      }
      
      return { data: null, error: { message: `Provider ${provider} not supported in mock mode` } };
    },
    signOut: async () => {
      mockUser = null;
      saveMockUser(null);
      return { error: null };
    }
  };
  
  // Mock database methods
  // Use localStorage to persist mock tasks between page refreshes
  let mockTasks = [];
  try {
    const storedTasks = localStorage.getItem('mockTasks');
    if (storedTasks) {
      mockTasks = JSON.parse(storedTasks);
    } else {
      // Initial mock tasks
      mockTasks = [
        { id: 'mock-1', title: 'Complete Phase 1', is_complete: false, user_id: 'mock-user-id', priority: 'high', inserted_at: new Date().toISOString() },
        { id: 'mock-2', title: 'Start Phase 2', is_complete: false, user_id: 'mock-user-id', priority: 'medium', inserted_at: new Date().toISOString() },
        { id: 'mock-3', title: 'Review Progress', is_complete: true, user_id: 'mock-user-id', priority: 'low', inserted_at: new Date().toISOString() }
      ];
      localStorage.setItem('mockTasks', JSON.stringify(mockTasks));
    }
  } catch (e) {
    console.error('Error accessing localStorage:', e);
    // Fallback to in-memory tasks
    mockTasks = [
      { id: 'mock-1', title: 'Complete Phase 1', is_complete: false, user_id: 'mock-user-id', priority: 'high', inserted_at: new Date().toISOString() },
      { id: 'mock-2', title: 'Start Phase 2', is_complete: false, user_id: 'mock-user-id', priority: 'medium', inserted_at: new Date().toISOString() }
    ];
  }
  
  // Helper function to save tasks to localStorage
  const saveMockTasks = () => {
    try {
      localStorage.setItem('mockTasks', JSON.stringify(mockTasks));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };
  
  // Override the from method to handle different tables
  supabase.from = (table) => {
    if (table === 'tasks') {
      return {
        select: () => ({
          order: (column, { ascending } = {}) => {
            // Sort the tasks based on the column and direction
            const sortedTasks = [...mockTasks].sort((a, b) => {
              if (ascending) {
                return a[column] > b[column] ? 1 : -1;
              } else {
                return a[column] < b[column] ? 1 : -1;
              }
            });
            return Promise.resolve({ data: sortedTasks, error: null });
          },
          eq: (column, value) => {
            // Filter tasks by the column value
            const filteredTasks = mockTasks.filter(task => task[column] === value);
            return Promise.resolve({ data: filteredTasks, error: null });
          },
          in: (column, values) => {
            // Filter tasks where column value is in the provided array
            const filteredTasks = mockTasks.filter(task => values.includes(task[column]));
            return Promise.resolve({ data: filteredTasks, error: null });
          }
        }),
        insert: (task) => {
          // Create a new task with a unique ID
          const newTask = { 
            ...task, 
            id: 'mock-' + Date.now(), 
            inserted_at: new Date().toISOString() 
          };
          mockTasks.push(newTask);
          saveMockTasks();
          return Promise.resolve({ 
            data: newTask,
            error: null 
          });
        },
        update: (updates) => ({
          eq: (column, value) => {
            // Find and update the task
            const index = mockTasks.findIndex(task => task[column] === value);
            if (index !== -1) {
              mockTasks[index] = { ...mockTasks[index], ...updates };
              saveMockTasks();
              return Promise.resolve({ data: mockTasks[index], error: null });
            }
            return Promise.resolve({ data: null, error: { message: 'Task not found' } });
          }
        }),
        delete: () => ({
          eq: (column, value) => {
            // Remove the task
            const initialLength = mockTasks.length;
            mockTasks = mockTasks.filter(task => task[column] !== value);
            saveMockTasks();
            
            if (mockTasks.length < initialLength) {
              return Promise.resolve({ error: null });
            }
            return Promise.resolve({ error: { message: 'Task not found' } });
          },
          in: (column, values) => {
            // Remove multiple tasks
            const initialLength = mockTasks.length;
            mockTasks = mockTasks.filter(task => !values.includes(task[column]));
            saveMockTasks();
            
            if (mockTasks.length < initialLength) {
              return Promise.resolve({ error: null });
            }
            return Promise.resolve({ error: { message: 'No tasks found' } });
          }
        })
      };
    }
    // For other tables, return a minimal implementation
    return {
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        eq: () => Promise.resolve({ data: [], error: null })
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null })
      })
    };
  };
}