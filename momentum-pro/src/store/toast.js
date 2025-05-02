import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);
  
  // Generate a unique ID for each toast
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  // Add a new toast
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = generateId();
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'info', 'warning'
      duration,
    };
    
    toasts.value.push(toast);
    
    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };
  
  // Remove a toast by ID
  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };
  
  // Shorthand methods for different toast types
  const success = (message, duration = 3000) => addToast(message, 'success', duration);
  const error = (message, duration = 4000) => addToast(message, 'error', duration);
  const info = (message, duration = 3000) => addToast(message, 'info', duration);
  const warning = (message, duration = 3500) => addToast(message, 'warning', duration);
  
  // Clear all toasts
  const clearAll = () => {
    toasts.value = [];
  };
  
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
    clearAll
  };
});