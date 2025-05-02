// /store/task.js
import { defineStore } from "pinia";
import { supabase } from "../supabase";
import { useToastStore } from "./toast";

// For development mode
let devModeTasks = [
  {
    id: 1,
    title: "Sample Task 1",
    description: "This is a sample task for development mode",
    user_id: "dev-user-123",
    is_complete: false,
    importance: "medium",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Sample Task 2",
    description: "Another sample task for testing",
    user_id: "dev-user-123",
    is_complete: true,
    importance: "low",
    created_at: new Date().toISOString()
  }
];

export const useTaskStore = defineStore("tasks", {
  state: () => ({
    tasks: null,
    isLoading: false,
    error: null,
    successMessage: null,
  }),
  actions: {
    // Set loading state
    setLoading(status) {
      this.isLoading = status;
    },
    
    // Set error message with toast
    setError(message) {
      this.error = message;
      // Show toast notification
      const toastStore = useToastStore();
      toastStore.error(message);
      
      // Auto-clear error after 5 seconds (keeping for backward compatibility)
      setTimeout(() => {
        this.error = null;
      }, 5000);
    },
    
    // Set success message with toast
    setSuccess(message) {
      this.successMessage = message;
      // Show toast notification
      const toastStore = useToastStore();
      toastStore.success(message);
      
      // Auto-clear success message after 5 seconds (keeping for backward compatibility)
      setTimeout(() => {
        this.successMessage = null;
      }, 5000);
    },
    
    async fetchTasks() {
      this.setLoading(true);
      this.error = null;
      
      try {
        // Check if we're in development mode
        if (localStorage.getItem('dev_mode_user')) {
          console.log('Using development mode tasks');
          this.tasks = [...devModeTasks];
          return;
        }
        
        // Otherwise use Supabase
        const { data: tasks, error } = await supabase
          .from("tasks")
          .select("*")
          .order("id", { ascending: false });
          
        if (error) throw error;
        this.tasks = tasks;
      } catch (error) {
        console.error('Error fetching tasks:', error);
        this.setError('Failed to load tasks. Please try again.');
        this.tasks = [];
      } finally {
        this.setLoading(false);
      }
    },
    
    async createTask(title, description, user_id, importance = 'medium') {
      this.setLoading(true);
      this.error = null;
      
      try {
        // Check if we're in development mode
        if (localStorage.getItem('dev_mode_user')) {
          console.log('Creating task in development mode');
          const newTask = {
            id: Date.now(), // Use timestamp as ID
            title,
            description,
            user_id,
            is_complete: false,
            importance,
            created_at: new Date().toISOString()
          };
          
          devModeTasks.unshift(newTask);
          await this.fetchTasks();
          this.setSuccess('Task created successfully!');
          return [newTask];
        }
        
        // Otherwise use Supabase
        const { data, error } = await supabase
          .from("tasks")
          .insert([
            { 
              title, 
              description, 
              user_id, 
              is_complete: false,
              importance
            }
          ]);
        
        if (error) throw error;
        await this.fetchTasks();
        this.setSuccess('Task created successfully!');
        return data;
      } catch (error) {
        console.error('Error creating task:', error);
        this.setError('Failed to create task. Please try again.');
        return null;
      } finally {
        this.setLoading(false);
      }
    },
    
    async updateTask(id, updates) {
      this.setLoading(true);
      this.error = null;
      
      try {
        // Check if we're in development mode
        if (localStorage.getItem('dev_mode_user')) {
          console.log('Updating task in development mode', id, updates);
          const index = devModeTasks.findIndex(task => task.id === id);
          
          if (index !== -1) {
            devModeTasks[index] = { ...devModeTasks[index], ...updates };
            await this.fetchTasks();
            this.setSuccess('Task updated successfully!');
            return [devModeTasks[index]];
          }
          return null;
        }
        
        // Otherwise use Supabase
        const { data, error } = await supabase
          .from("tasks")
          .update(updates)
          .match({ id });
        
        if (error) throw error;
        await this.fetchTasks();
        this.setSuccess('Task updated successfully!');
        return data;
      } catch (error) {
        console.error('Error updating task:', error);
        this.setError('Failed to update task. Please try again.');
        return null;
      } finally {
        this.setLoading(false);
      }
    },
    
    async toggleTaskCompletion(id, currentStatus) {
      return this.updateTask(id, { is_complete: !currentStatus });
    },
    
    async updateTaskImportance(id, importance) {
      return this.updateTask(id, { importance });
    },
    
    async deleteTask(id) {
      this.setLoading(true);
      this.error = null;
      
      try {
        // Check if we're in development mode
        if (localStorage.getItem('dev_mode_user')) {
          console.log('Deleting task in development mode', id);
          devModeTasks = devModeTasks.filter(task => task.id !== id);
          await this.fetchTasks();
          this.setSuccess('Task deleted successfully!');
          return;
        }
        
        // Otherwise use Supabase
        const { error } = await supabase
          .from("tasks")
          .delete()
          .match({ id });
        
        if (error) throw error;
        await this.fetchTasks();
        this.setSuccess('Task deleted successfully!');
      } catch (error) {
        console.error('Error deleting task:', error);
        this.setError('Failed to delete task. Please try again.');
      } finally {
        this.setLoading(false);
      }
    }
  },
});