// /store/task.js
import { defineStore } from "pinia";
import { supabase } from "../supabase";
import { useUserStore } from "./user";

export const useTaskStore = defineStore("tasks", {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
    customOrder: [] // Array of task IDs in custom order
  }),
  getters: {
    completedTasks: (state) => state.tasks.filter(task => task.is_complete),
    pendingTasks: (state) => state.tasks.filter(task => !task.is_complete),
    totalCount: (state) => state.tasks.length,
    completedCount: (state) => state.tasks.filter(task => task.is_complete).length,
    
    // Priority-based getters
    highPriorityTasks: (state) => state.tasks.filter(task => task.priority === 'high'),
    mediumPriorityTasks: (state) => state.tasks.filter(task => task.priority === 'medium'),
    lowPriorityTasks: (state) => state.tasks.filter(task => task.priority === 'low'),
    
    // Tasks sorted by priority (high to low)
    tasksByPriority: (state) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return [...state.tasks].sort((a, b) => {
        const priorityA = a.priority ? priorityOrder[a.priority] : 999;
        const priorityB = b.priority ? priorityOrder[b.priority] : 999;
        return priorityA - priorityB;
      });
    },
    
    // Get tasks in custom order
    getOrderedTasks: (state) => {
      // If no custom order is set, return tasks in default order
      if (!state.customOrder || state.customOrder.length === 0) {
        return state.tasks;
      }
      
      // Create a map of tasks by ID for quick lookup
      const tasksById = {};
      state.tasks.forEach(task => {
        tasksById[task.id] = task;
      });
      
      // Filter out any IDs in customOrder that don't exist in tasks
      const validOrderIds = state.customOrder.filter(id => tasksById[id]);
      
      // Find any tasks that aren't in the custom order
      const missingTasks = state.tasks.filter(task => !state.customOrder.includes(task.id));
      
      // Return tasks in custom order, with any missing tasks at the end
      const orderedTasks = validOrderIds.map(id => tasksById[id]);
      return [...orderedTasks, ...missingTasks];
    }
  },
  actions: {
    async fetchTasks() {
      this.loading = true;
      this.error = null;
      
      try {
        const userStore = useUserStore();
        
        // Check if user exists before fetching tasks
        if (!userStore.user) {
          console.log('No user found, using development mode or not logged in');
          this.tasks = [];
          return;
        }
        
        // In development mode, use mock tasks from localStorage
        if (userStore.isDevelopmentMode) {
          try {
            const storedTasks = localStorage.getItem('mockTasks');
            if (storedTasks) {
              const parsedTasks = JSON.parse(storedTasks);
              // Filter tasks for the current user
              this.tasks = parsedTasks.filter(task => task.user_id === userStore.user.id);
            } else {
              // Create some initial mock tasks
              const mockTasks = [
                { id: 'mock-1', title: 'Complete Phase 1', is_complete: false, user_id: userStore.user.id, priority: 'high', inserted_at: new Date().toISOString() },
                { id: 'mock-2', title: 'Start Phase 2', is_complete: false, user_id: userStore.user.id, priority: 'medium', inserted_at: new Date().toISOString() },
                { id: 'mock-3', title: 'Review Progress', is_complete: true, user_id: userStore.user.id, priority: 'low', inserted_at: new Date().toISOString() }
              ];
              localStorage.setItem('mockTasks', JSON.stringify(mockTasks));
              this.tasks = mockTasks;
            }
            
            // Load custom order if available
            const storedOrder = localStorage.getItem('momentum-task-order');
            if (storedOrder) {
              try {
                this.customOrder = JSON.parse(storedOrder);
              } catch (e) {
                console.error('Error parsing stored task order:', e);
                this.customOrder = [];
              }
            } else {
              // Initialize custom order with current task IDs
              this.customOrder = this.tasks.map(task => task.id);
            }
            
            return;
          } catch (e) {
            console.error('Error accessing localStorage:', e);
          }
        }
        
        // Only fetch tasks for the current user from Supabase
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", userStore.user.id)
          .order("inserted_at", { ascending: false });
          
        if (error) throw error;
        
        this.tasks = data || [];
        
        // Initialize custom order if not already set
        if (!this.customOrder.length) {
          // Try to load from localStorage first
          try {
            const storedOrder = localStorage.getItem('momentum-task-order');
            if (storedOrder) {
              this.customOrder = JSON.parse(storedOrder);
            } else {
              // If no stored order, initialize with current task IDs
              this.customOrder = this.tasks.map(task => task.id);
              localStorage.setItem('momentum-task-order', JSON.stringify(this.customOrder));
            }
          } catch (e) {
            console.error('Error initializing task order:', e);
            // Fallback to default order
            this.customOrder = this.tasks.map(task => task.id);
          }
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    async addTask(title, priority = 'medium') {
      const userStore = useUserStore();
      
      try {
        // Check if user exists
        if (!userStore.user) {
          throw new Error('User not logged in');
        }
        
        // In development mode, create a mock task
        if (userStore.isDevelopmentMode) {
          const mockTask = {
            id: 'mock-' + Date.now(),
            title,
            user_id: userStore.user.id,
            is_complete: false,
            priority,
            inserted_at: new Date().toISOString()
          };
          
          // Add to local state
          this.tasks = [mockTask, ...this.tasks];
          
          // Save to localStorage
          try {
            const storedTasks = localStorage.getItem('mockTasks');
            let allTasks = storedTasks ? JSON.parse(storedTasks) : [];
            allTasks = [mockTask, ...allTasks];
            localStorage.setItem('mockTasks', JSON.stringify(allTasks));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
          
          return mockTask;
        }
        
        // Normal Supabase operation
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            title,
            user_id: userStore.user.id,
            is_complete: false,
            priority: priority // Add priority field
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Add the new task to the beginning of the array
        this.tasks = [data, ...this.tasks];
        
        // Update custom order to include the new task at the beginning
        this.customOrder = [data.id, ...this.customOrder];
        
        // Save the updated order
        try {
          localStorage.setItem('momentum-task-order', JSON.stringify(this.customOrder));
        } catch (e) {
          console.error('Error saving task order to localStorage:', e);
        }
        
        // If we're in development mode, also update the mock tasks order
        if (userStore.isDevelopmentMode) {
          try {
            const storedOrder = localStorage.getItem('momentum-task-order');
            if (!storedOrder) {
              localStorage.setItem('momentum-task-order', JSON.stringify(this.customOrder));
            }
          } catch (e) {
            console.error('Error updating mock task order:', e);
          }
        }
        
        return data;
      } catch (error) {
        console.error("Error adding task:", error);
        throw error;
      }
    },
    
    async updateTask(id, updates) {
      try {
        const userStore = useUserStore();
        
        // Handle tasks in development mode
        if (userStore.isDevelopmentMode) {
          const index = this.tasks.findIndex(task => task.id === id);
          if (index !== -1) {
            // Update in local state
            this.tasks[index] = { ...this.tasks[index], ...updates };
            
            // Update in localStorage
            try {
              const storedTasks = localStorage.getItem('mockTasks');
              if (storedTasks) {
                let allTasks = JSON.parse(storedTasks);
                const taskIndex = allTasks.findIndex(task => task.id === id);
                if (taskIndex !== -1) {
                  allTasks[taskIndex] = { ...allTasks[taskIndex], ...updates };
                  localStorage.setItem('mockTasks', JSON.stringify(allTasks));
                }
              }
            } catch (e) {
              console.error('Error updating localStorage:', e);
            }
            
            return this.tasks[index];
          }
          throw new Error('Task not found');
        }
        
        // Normal Supabase operation
        const { data, error } = await supabase
          .from("tasks")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
          
        if (error) throw error;
        
        // Update the task in the local state
        const index = this.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
          this.tasks[index] = { ...this.tasks[index], ...updates };
        }
        
        return data;
      } catch (error) {
        console.error("Error updating task:", error);
        throw error;
      }
    },
    
    async toggleTaskCompletion(id, currentStatus) {
      return this.updateTask(id, { is_complete: !currentStatus });
    },
    
    async deleteTask(id) {
      try {
        const userStore = useUserStore();
        
        // Handle tasks in development mode
        if (userStore.isDevelopmentMode) {
          // Remove from local state
          this.tasks = this.tasks.filter(task => task.id !== id);
          
          // Remove from custom order
          this.customOrder = this.customOrder.filter(taskId => taskId !== id);
          
          // Save the updated order
          try {
            localStorage.setItem('momentum-task-order', JSON.stringify(this.customOrder));
          } catch (e) {
            console.error('Error saving task order to localStorage:', e);
          }
          
          // Remove from localStorage
          try {
            const storedTasks = localStorage.getItem('mockTasks');
            if (storedTasks) {
              let allTasks = JSON.parse(storedTasks);
              allTasks = allTasks.filter(task => task.id !== id);
              localStorage.setItem('mockTasks', JSON.stringify(allTasks));
            }
          } catch (e) {
            console.error('Error updating localStorage:', e);
          }
          
          return;
        }
        
        // Normal Supabase operation
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", id);
          
        if (error) throw error;
        
        // Remove the task from the local state
        this.tasks = this.tasks.filter(task => task.id !== id);
      } catch (error) {
        console.error("Error deleting task:", error);
        throw error;
      }
    },
    
    // Update the custom order of tasks
    async updateTaskOrder(newOrder) {
      try {
        if (!newOrder || !Array.isArray(newOrder)) {
          throw new Error('Invalid task order provided');
        }
        
        // Update the custom order in state
        this.customOrder = newOrder;
        
        // Save to localStorage
        try {
          localStorage.setItem('momentum-task-order', JSON.stringify(newOrder));
        } catch (e) {
          console.error('Error saving task order to localStorage:', e);
          throw new Error('Failed to save task order: ' + e.message);
        }
        
        const userStore = useUserStore();
        
        // If not in development mode, save to database
        if (!userStore.isDevelopmentMode) {
          // Here you would implement saving the order to your database
          // For example, you might have a user_preferences table in Supabase
          // This is a placeholder for future implementation
          console.log('Task order updated in state and localStorage');
        }
        
        return true;
      } catch (error) {
        console.error("Error updating task order:", error);
        throw error;
      }
    },
    
    // Clear all completed tasks
    async clearCompletedTasks() {
      const completedIds = this.completedTasks.map(task => task.id);
      
      if (completedIds.length === 0) return;
      
      try {
        const userStore = useUserStore();
        
        // Check if user exists
        if (!userStore.user) {
          console.log('No user found, cannot clear completed tasks');
          return;
        }
        
        // Handle tasks in development mode
        if (userStore.isDevelopmentMode) {
          // Update the local state
          this.tasks = this.tasks.filter(task => !task.is_complete);
          
          // Update localStorage
          try {
            const storedTasks = localStorage.getItem('mockTasks');
            if (storedTasks) {
              let allTasks = JSON.parse(storedTasks);
              // Keep all tasks from other users and non-completed tasks from current user
              allTasks = allTasks.filter(task => 
                !task.user_id || 
                task.user_id !== userStore.user.id || 
                !task.is_complete
              );
              localStorage.setItem('mockTasks', JSON.stringify(allTasks));
            }
          } catch (e) {
            console.error('Error updating localStorage:', e);
          }
          
          return;
        }
        
        // Filter out mock IDs if any
        const realIds = completedIds.filter(id => !id.toString().startsWith('mock-'));
        
        if (realIds.length > 0) {
          // Delete all completed tasks in a single operation
          const { error } = await supabase
            .from("tasks")
            .delete()
            .in("id", realIds);
            
          if (error) throw error;
        }
        
        // Update local state
        this.tasks = this.tasks.filter(task => !task.is_complete);
      } catch (error) {
        console.error("Error clearing completed tasks:", error);
        throw error;
      }
    }
  },
  
  // Add a new action to update the task order
  updateTaskOrder(newOrder) {
    this.customOrder = newOrder;
    
    // Save to localStorage for persistence
    try {
      const userStore = useUserStore();
      
      if (userStore.isDevelopmentMode) {
        localStorage.setItem('momentum-task-order', JSON.stringify(newOrder));
      }
    } catch (e) {
      console.error('Error saving task order to localStorage:', e);
    }
  },
  
  // Get tasks in custom order if available
  getOrderedTasks() {
    // If we have a custom order and it contains all task IDs
    if (this.customOrder.length > 0 && this.customOrder.length === this.tasks.length) {
      // Create a map of tasks by ID for quick lookup
      const tasksById = {};
      this.tasks.forEach(task => {
        tasksById[task.id] = task;
      });
      
      // Return tasks in the custom order
      return this.customOrder
        .map(id => tasksById[id])
        .filter(task => task !== undefined); // Filter out any missing tasks
    }
    
    // If no custom order or it's incomplete, return tasks as is
    return this.tasks;
  }
  },
  persist: {
    paths: ['tasks', 'customOrder']
  },
});