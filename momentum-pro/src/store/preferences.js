// /store/preferences.js
import { defineStore } from 'pinia';

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    taskFilter: 'all', // 'all', 'complete', 'incomplete'
    taskSort: 'date-desc', // 'date-desc', 'date-asc', 'importance', 'alphabetical'
    theme: 'dark-default', // 'dark-default', 'light-gold', 'professional-blue', 'elegant-purple'
    viewMode: 'list', // 'list', 'kanban'
    kanbanFilter: 'all', // 'all', 'importance'
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
    
    setViewMode(mode) {
      this.viewMode = mode;
    },
    
    setKanbanFilter(filter) {
      this.kanbanFilter = filter;
    },
    
    applyTheme() {
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', this.theme);
    },
    
    resetPreferences() {
      this.taskFilter = 'all';
      this.taskSort = 'date-desc';
      this.theme = 'dark-default';
      this.viewMode = 'list';
      this.kanbanFilter = 'all';
      this.applyTheme();
    },
    
    // Initialize theme on app start
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