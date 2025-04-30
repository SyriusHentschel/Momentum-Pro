// /store/user.js
import { defineStore } from 'pinia';
import { supabase } from '../supabase';

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
        throw error;
      }
      
      // Check if email confirmation is required
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        console.log('User already exists but is not confirmed');
      }
      
      if (data.user && !data.session) {
        console.log('Email confirmation required. Check your email for the confirmation link.');
      }
      
      // Return the data for handling in the component
      return data;
    },
    async signIn(email, password) {
      console.log('Signing in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        console.log('User authenticated:', data.user.email);
        this.user = data.user;
      }
      
      return data;
    },
    async signOut() {
      // Check if we're in development mode
      if (localStorage.getItem('dev_mode_user')) {
        console.log('Signing out development mode user');
        localStorage.removeItem('dev_mode_user');
        this.user = null;
        return;
      }
      
      // Otherwise, sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      this.user = null;
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