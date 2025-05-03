// /store/preferences.js
import { defineStore } from 'pinia';

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    taskFilter: 'all', // 'all', 'complete', 'incomplete'
    taskSort: 'date-desc', // 'date-desc', 'date-asc', 'importance', 'alphabetical'
  }),
  
  actions: {
    setTaskFilter(filter) {
      this.taskFilter = filter;
    },
    
    setTaskSort(sort) {
      this.taskSort = sort;
    },
    
    resetPreferences() {
      this.taskFilter = 'all';
      this.taskSort = 'date-desc';
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