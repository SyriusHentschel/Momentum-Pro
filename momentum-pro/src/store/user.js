// /store/user.js
import { defineStore } from 'pinia';
import { supabase } from '../supabase';
import { useToastStore } from './toast';

// Utility function for handling authentication errors
const handleAuthError = (error, toastStore, operation) => {
  const errorMessage = `${operation} failed: ${error.message}`;
  console.error(`${operation} error:`, error);
  toastStore.error(errorMessage);
  throw error;
};

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    lastFetchTime: null,
    cacheDuration: 30 * 60 * 1000, // 30 minutes cache duration
  }),
  getters: {
    // Check if cache is still valid
    isCacheValid: (state) => {
      if (!state.lastFetchTime) return false;
      const now = new Date().getTime();
      return (now - state.lastFetchTime) < state.cacheDuration;
    }
  },
  actions: {
    async fetchUser(forceRefresh = false) {
      // Use cached user if available and not forcing refresh
      if (this.user && this.isCacheValid && !forceRefresh) {
        console.log('Using cached user data');
        return this.user;
      }
      
      // Check for development mode user first
      const devModeUser = localStorage.getItem('dev_mode_user');
      if (devModeUser) {
        console.log('Development mode user found in localStorage');
        this.user = JSON.parse(devModeUser);
        this.lastFetchTime = new Date().getTime();
        return this.user;
      }
      
      // Otherwise, try to get the user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      this.user = user;
      this.lastFetchTime = new Date().getTime();
      return user;
    },
    async signUp(email, password) {
      console.log('Signing up with:', email);
      const toastStore = useToastStore();
      
      try {
        // Get redirect URL from environment variable or use default
        const redirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || 
                           window.location.origin + '/auth/callback';
        
        // Standard Supabase signup with email confirmation
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        
        console.log('Supabase sign-up response:', data);
        
        if (error) {
          return handleAuthError(error, toastStore, 'Sign up');
        }
        
        // Check if email confirmation is required
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          console.log('User already exists but is not confirmed');
          toastStore.info('This email is already registered. Please check your email for confirmation link or try signing in.');
        } else if (data.user && !data.session) {
          console.log('Email confirmation required. Check your email for the confirmation link.');
          toastStore.success('Sign up successful! Please check your email for the confirmation link.');
        } else {
          toastStore.success('Sign up successful!');
        }
        
        // Return the data for handling in the component
        return data;
      } catch (error) {
        return handleAuthError(error, toastStore, 'Sign up');
      }
    },
    
    async signIn(email, password) {
      console.log('Signing in with:', email);
      const toastStore = useToastStore();
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          return handleAuthError(error, toastStore, 'Sign in');
        }
        
        if (data.user) {
          console.log('User authenticated:', data.user.email);
          this.user = data.user;
          toastStore.success('Signed in successfully!');
        }
        
        return data;
      } catch (error) {
        return handleAuthError(error, toastStore, 'Sign in');
      }
    },
    
    async signInWithGoogle() {
      console.log('Signing in with Google...');
      const toastStore = useToastStore();
      
      try {
        // Get redirect URL from environment variable or use default
        const redirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || 
                           window.location.origin + '/auth/callback';
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl
          }
        });
        
        if (error) {
          return handleAuthError(error, toastStore, 'Google sign-in');
        }
        
        // This won't actually be reached immediately as the user will be redirected to Google
        console.log('Google sign-in initiated');
        return data;
      } catch (error) {
        return handleAuthError(error, toastStore, 'Google sign-in');
      }
    },
    
    async signInWithGoogle() {
      console.log('Signing in with Google...');
      const toastStore = useToastStore();
      
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/auth/callback'
          }
        });
        
        if (error) {
          console.error('Google sign-in error:', error);
          toastStore.error(`Google sign-in failed: ${error.message}`);
          throw error;
        }
        
        // This won't actually be reached immediately as the user will be redirected to Google
        console.log('Google sign-in initiated');
        return data;
      } catch (error) {
        toastStore.error(`Google sign-in failed: ${error.message}`);
        throw error;
      }
    },
    
    async signOut() {
      const toastStore = useToastStore();
      
      try {
        // Check if we're in development mode
        if (localStorage.getItem('dev_mode_user')) {
          console.log('Signing out development mode user');
          localStorage.removeItem('dev_mode_user');
          this.user = null;
          toastStore.info('Signed out from development mode');
          return;
        }
        
        // Otherwise, sign out from Supabase
        const { error } = await supabase.auth.signOut();
        if (error) {
          return handleAuthError(error, toastStore, 'Sign out');
        }
        
        this.user = null;
        toastStore.success('Signed out successfully');
      } catch (error) {
        return handleAuthError(error, toastStore, 'Sign out');
      }
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user',
        storage: localStorage
      }
    ]
  },
});