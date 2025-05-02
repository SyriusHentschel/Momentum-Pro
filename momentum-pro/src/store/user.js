// /store/user.js
import { defineStore } from 'pinia';
import { supabase } from '../supabase';
import { useToastStore } from './toast';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
  }),
  actions: {
    async fetchUser() {
      // Check for development mode user first
      const devModeUser = localStorage.getItem('dev_mode_user');
      if (devModeUser) {
        console.log('Development mode user found in localStorage');
        this.user = JSON.parse(devModeUser);
        return;
      }
      
      // Otherwise, try to get the user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      this.user = user;
    },
    async signUp(email, password) {
      console.log('Signing up with:', email);
      const toastStore = useToastStore();
      
      try {
        // Standard Supabase signup with email confirmation
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/auth/callback'
          }
        });
        
        console.log('Supabase sign-up response:', data);
        
        if (error) {
          console.error('Supabase sign-up error:', error);
          toastStore.error(`Sign up failed: ${error.message}`);
          throw error;
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
        toastStore.error(`Sign up failed: ${error.message}`);
        throw error;
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
          toastStore.error(`Sign in failed: ${error.message}`);
          throw error;
        }
        
        if (data.user) {
          console.log('User authenticated:', data.user.email);
          this.user = data.user;
          toastStore.success('Signed in successfully!');
        }
        
        return data;
      } catch (error) {
        toastStore.error(`Sign in failed: ${error.message}`);
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
          toastStore.error(`Sign out failed: ${error.message}`);
          throw error;
        }
        
        this.user = null;
        toastStore.success('Signed out successfully');
      } catch (error) {
        toastStore.error(`Sign out failed: ${error.message}`);
        throw error;
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