// /store/user.js
import { defineStore } from "pinia";
import { supabase } from "../supabase";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    isDevelopmentMode: import.meta.env.DEV && 
      (import.meta.env.VITE_SUPABASE_URL === undefined || 
       import.meta.env.VITE_SUPABASE_URL.includes('placeholder'))
  }),
  actions: {
    async fetchUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        this.user = user;
        
        // For development without Supabase, create a mock user
        if (this.isDevelopmentMode && !this.user) {
          console.log('Development mode: Using mock user');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        this.user = null;
      }
    },
    async signUp(email, password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // In development mode, set the user immediately for testing
        if (this.isDevelopmentMode) {
          this.user = data.user;
        }
        
        return data;
      } catch (error) {
        console.error('Error signing up:', error);
        throw error;
      }
    },
    async signIn(email, password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        this.user = data.user;
        return data;
      } catch (error) {
        console.error('Error signing in:', error);
        throw error;
      }
    },
    async signInWithGitHub() {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: window.location.origin
          }
        });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error signing in with GitHub:', error);
        throw error;
      }
    },
    async signOut() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        this.user = null;
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    },
    // Development helper method
    setMockUserForDev() {
      if (this.isDevelopmentMode) {
        this.user = {
          id: 'mock-user-id',
          email: 'dev@example.com',
          user_metadata: { name: 'Development User' }
        };
        return true;
      }
      return false;
    }
  },
  persist: true,
});