// /store/preferences.js
import { defineStore } from 'pinia';

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    taskFilter: 'all', // 'all', 'complete', 'incomplete'
    taskSort: 'date-desc', // 'date-desc', 'date-asc', 'importance', 'alphabetical'
    theme: 'system', // 'light', 'dark', 'system'
  }),
  
  actions: {
    setTaskFilter(filter) {
      this.taskFilter = filter;
    },
    
    setTaskSort(sort) {
      this.taskSort = sort;
    },
    
    setTheme(theme) {
      this.theme = theme;
      this.applyTheme();
    },
    
    applyTheme() {
      let themeToApply = this.theme;
      
      // If system preference, check user's OS preference
      if (themeToApply === 'system') {
        themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', themeToApply);
    },
    
    resetPreferences() {
      this.taskFilter = 'all';
      this.taskSort = 'date-desc';
      this.theme = 'system';
      this.applyTheme();
    },
    
    // Initialize theme on app start
    initTheme() {
      this.applyTheme();
      
      // Listen for system preference changes if using system theme
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.theme === 'system') {
          document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
      });
    }
  },
  
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user-preferences',
        storage: localStorage
      }
    ]
  },
});