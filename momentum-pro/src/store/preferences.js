// /store/preferences.js
import { defineStore } from 'pinia';

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    taskFilter: 'all', // 'all', 'complete', 'incomplete'
    taskSort: 'date-desc', // 'date-desc', 'date-asc', 'importance', 'alphabetical'
    theme: 'dark-default', // 'dark-default', 'light-gold', 'professional-blue', 'elegant-purple'
  }),
  
  actions: {
    /**
     * Sets the task filter preference
     * @param {string} filter - The filter to apply ('all', 'complete', 'incomplete')
     */
    setTaskFilter(filter) {
      this.taskFilter = filter;
    },
    
    /**
     * Sets the task sort preference
     * @param {string} sort - The sort method ('date-desc', 'date-asc', 'importance', 'alphabetical')
     */
    setTaskSort(sort) {
      this.taskSort = sort;
    },
    
    /**
     * Sets the theme preference and applies it
     * @param {string} theme - The theme to apply ('dark-default', 'light-gold', 'professional-blue', 'elegant-purple')
     */
    setTheme(theme) {
      this.theme = theme;
      this.applyTheme();
    },
    
    /**
     * Applies the current theme to the document
     */
    applyTheme() {
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', this.theme);
    },
    
    /**
     * Resets all preferences to default values
     */
    resetPreferences() {
      this.taskFilter = 'all';
      this.taskSort = 'date-desc';
      this.theme = 'dark-default';
      this.applyTheme();
    },
    
    /**
     * Initializes the theme on app start
     */
    initTheme() {
      this.applyTheme();
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