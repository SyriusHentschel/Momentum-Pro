import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);
  
  /**
   * Generates a unique ID for each toast
   * @returns {string} A unique ID
   */
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  /**
   * Adds a new toast notification
   * @param {string} message - The message to display
   * @param {string} type - The type of toast ('success', 'error', 'info', 'warning')
   * @param {number} duration - How long to display the toast in milliseconds
   * @returns {string} The ID of the created toast
   */
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
  
  /**
   * Removes a toast by ID
   * @param {string} id - The ID of the toast to remove
   */
  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };
  
  // Shorthand methods for different toast types
  /**
   * Shows a success toast notification
   * @param {string} message - The message to display
   * @param {number} duration - How long to display the toast in milliseconds
   * @returns {string} The ID of the created toast
   */
  const success = (message, duration = 3000) => addToast(message, 'success', duration);
  
  /**
   * Shows an error toast notification
   * @param {string} message - The message to display
   * @param {number} duration - How long to display the toast in milliseconds
   * @returns {string} The ID of the created toast
   */
  const error = (message, duration = 4000) => addToast(message, 'error', duration);
  
  /**
   * Shows an info toast notification
   * @param {string} message - The message to display
   * @param {number} duration - How long to display the toast in milliseconds
   * @returns {string} The ID of the created toast
   */
  const info = (message, duration = 3000) => addToast(message, 'info', duration);
  
  /**
   * Shows a warning toast notification
   * @param {string} message - The message to display
   * @param {number} duration - How long to display the toast in milliseconds
   * @returns {string} The ID of the created toast
   */
  const warning = (message, duration = 3500) => addToast(message, 'warning', duration);
  
  /**
   * Clears all toast notifications
   */
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