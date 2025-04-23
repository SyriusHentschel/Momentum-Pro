// /store/user.js
import { defineStore } from "pinia";
import { supabase } from "../supabase";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    isDevelopmentMode: false // Use real Supabase client
  }),
  actions: {
    async fetchUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        this.user = user;
      } catch (error) {
        console.error('Error fetching user:', error);
        this.user = null;
      }
    },
    async signUp(email, password) {
      try {
        // Use the mock or real Supabase client
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // If we got a user back directly (in mock mode), set it
        if (data && data.user) {
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
        // Use the mock or real Supabase client
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Set the user
        this.user = data.user;
        return data;
      } catch (error) {
        console.error('Error signing in:', error);
        throw error;
      }
    },
    async signInWithGitHub() {
      try {
        // Use the standard GitHub OAuth flow without custom parameters
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: window.location.origin
          }
        });
        
        if (error) throw error;
        
        // If we got a user back directly (in mock mode), set it
        if (data && data.user) {
          this.user = data.user;
        }
        
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