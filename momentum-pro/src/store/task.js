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
    status: "todo",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Sample Task 2",
    description: "Another sample task for testing",
    user_id: "dev-user-123",
    is_complete: true,
    importance: "low",
    status: "done",
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "In Progress Task",
    description: "This task is currently being worked on",
    user_id: "dev-user-123",
    is_complete: false,
    importance: "high",
    status: "in-progress",
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
        
        // Process tasks to extract status from description if needed
        const processedTasks = tasks.map(task => {
          const processedTask = { ...task };
          
          // Check if description contains a status tag
          if (task.description && task.description.includes('[STATUS:')) {
            const statusMatch = task.description.match(/\[STATUS:([^\]]+)\]/);
            if (statusMatch && statusMatch[1]) {
              // Extract status
              processedTask.status = statusMatch[1];
              
              // Clean up description (remove the status tag)
              processedTask.description = task.description
                .replace(/\[STATUS:[^\]]+\]\s*/, '')
                .trim();
            }
          } else {
            // Set default status based on completion
            processedTask.status = task.is_complete ? 'done' : 'todo';
          }
          
          return processedTask;
        });
        
        this.tasks = processedTasks;
      } catch (error) {
        console.error('Error fetching tasks:', error);
        this.setError('Failed to load tasks. Please try again.');
        this.tasks = [];
      } finally {
        this.setLoading(false);
      }
    },
    
    async createTask(title, description, user_id, importance = 'medium', status = 'todo') {
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
            is_complete: status === 'done',
            importance,
            status,
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
              is_complete: status === 'done',
              importance,
              status
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
        // Filter out any fields that might not exist in the database
        const safeUpdates = { ...updates };
        
        // If status is provided but we're using the existing database,
        // we'll store it in the description field with a special prefix
        if (safeUpdates.status && !localStorage.getItem('kanban_migration_done')) {
          // Store status in description if it's not already there
          const statusPrefix = `[STATUS:${safeUpdates.status}]`;
          if (safeUpdates.description) {
            // Check if description already has a status tag
            if (!safeUpdates.description.includes('[STATUS:')) {
              safeUpdates.description = `${statusPrefix} ${safeUpdates.description}`;
            } else {
              // Replace existing status tag
              safeUpdates.description = safeUpdates.description.replace(
                /\[STATUS:[^\]]+\]/,
                statusPrefix
              );
            }
          } else {
            // Get the current task to preserve its description
            const { data: currentTask } = await supabase
              .from("tasks")
              .select("description")
              .eq("id", id)
              .single();
              
            const currentDesc = currentTask?.description || '';
            
            // Check if description already has a status tag
            if (!currentDesc.includes('[STATUS:')) {
              safeUpdates.description = `${statusPrefix} ${currentDesc}`;
            } else {
              // Replace existing status tag
              safeUpdates.description = currentDesc.replace(
                /\[STATUS:[^\]]+\]/,
                statusPrefix
              );
            }
          }
          
          // Remove status from updates since it's not in the database
          delete safeUpdates.status;
        }
        
        const { data, error } = await supabase
          .from("tasks")
          .update(safeUpdates)
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
      // When toggling completion, also update the status field
      const updates = { 
        is_complete: !currentStatus,
        status: !currentStatus ? 'done' : 'todo'
      };
      return this.updateTask(id, updates);
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