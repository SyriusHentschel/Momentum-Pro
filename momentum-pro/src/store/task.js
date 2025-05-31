// /store/task.js
import { defineStore } from "pinia";
import { supabase } from "../supabase";
import { useToastStore } from "./toast";

// Default tasks for development mode
const defaultDevTasks = [
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
    title: "Sample Task 3",
    description: "A task that is in progress",
    user_id: "dev-user-123",
    is_complete: false,
    importance: "high",
    status: "in-progress",
    created_at: new Date().toISOString()
  }
];

// Load tasks from localStorage or use defaults
const loadDevModeTasks = () => {
  try {
    const savedTasks = localStorage.getItem('dev_mode_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [...defaultDevTasks];
  } catch (error) {
    console.error('Error loading dev tasks from localStorage:', error);
    return [...defaultDevTasks];
  }
};

// Initialize dev mode tasks
let devModeTasks = loadDevModeTasks();

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
    
    // Save dev mode tasks to localStorage
    saveDevModeTasks() {
      if (localStorage.getItem('dev_mode_user')) {
        localStorage.setItem('dev_mode_tasks', JSON.stringify(devModeTasks));
        console.log('Saved dev mode tasks to localStorage');
      }
    },
    
    async fetchTasks() {
      this.setLoading(true);
      this.error = null;
      
      try {
        // Check if we're in development mode
        if (localStorage.getItem('dev_mode_user')) {
          console.log('Using development mode tasks');
          // Reload from localStorage in case it was updated in another tab
          devModeTasks = loadDevModeTasks();
          this.tasks = [...devModeTasks];
          return;
        }
        
        // Otherwise use Supabase
        // Get the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No authenticated user found');
        }
        
        console.log('Fetching tasks for user:', user.id);
        
        const { data: tasks, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("id", { ascending: false });
          
        if (error) throw error;
        
        // Restore _kanbanColumn property from localStorage if available
        const kanbanState = localStorage.getItem('kanban_column_state');
        const kanbanStateObj = kanbanState ? JSON.parse(kanbanState) : {};
        
        // Apply the saved kanban column state to each task
        this.tasks = tasks.map(task => {
          const savedState = kanbanStateObj[task.id];
          if (savedState && !task.is_complete) {
            return { 
              ...task, 
              _kanbanColumn: savedState === 'in-progress' ? 'in-progress' : 'todo'
            };
          }
          return task;
        });
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
          const taskId = Date.now(); // Use timestamp as ID
          const newTask = {
            id: taskId,
            title,
            description,
            user_id,
            is_complete: status === 'done',
            importance,
            status,
            _kanbanColumn: status, // Add the _kanbanColumn property
            created_at: new Date().toISOString()
          };
          
          // Save the kanban column state to localStorage
          const kanbanState = localStorage.getItem('kanban_column_state');
          const kanbanStateObj = kanbanState ? JSON.parse(kanbanState) : {};
          kanbanStateObj[taskId] = status;
          localStorage.setItem('kanban_column_state', JSON.stringify(kanbanStateObj));
          
          devModeTasks.unshift(newTask);
          // Save to localStorage
          this.saveDevModeTasks();
          await this.fetchTasks();
          this.setSuccess('Task created successfully!');
          return [newTask];
        }
        
        // Otherwise use Supabase
        // Get the current user's ID to ensure we're using the authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Use the provided user_id if available, otherwise use the authenticated user's ID
        const effectiveUserId = user_id || (user ? user.id : null);
        
        if (!effectiveUserId) {
          throw new Error('No user ID available for task creation');
        }
        
        // Create task object without status field for database compatibility
        const taskData = { 
          title, 
          description, 
          user_id: effectiveUserId,
          is_complete: status === 'done',
          importance
          // status field is not included as it's not in the database schema
        };
        
        console.log('Creating task in database:', taskData);
        
        // Make sure we have a valid user ID
        if (!taskData.user_id) {
          throw new Error('User ID is required to create a task');
        }
        
        const { data, error } = await supabase
          .from("tasks")
          .insert([taskData])
          .select();
        
        if (error) throw error;
        
        // If we have a task ID, save the kanban column state to localStorage
        if (data && data.length > 0) {
          const taskId = data[0].id;
          // Save the kanban column state to localStorage
          const kanbanState = localStorage.getItem('kanban_column_state');
          const kanbanStateObj = kanbanState ? JSON.parse(kanbanState) : {};
          kanbanStateObj[taskId] = status;
          localStorage.setItem('kanban_column_state', JSON.stringify(kanbanStateObj));
        }
        
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
            // Save to localStorage
            this.saveDevModeTasks();
            await this.fetchTasks();
            this.setSuccess('Task updated successfully!');
            return [devModeTasks[index]];
          }
          return null;
        }
        
        // Otherwise use Supabase
        // Make a copy of updates to modify for database compatibility
        const dbUpdates = { ...updates };
        
        // Save the kanban column state to localStorage if it's provided
        if (updates._kanbanColumn) {
          const kanbanState = localStorage.getItem('kanban_column_state');
          const kanbanStateObj = kanbanState ? JSON.parse(kanbanState) : {};
          kanbanStateObj[id] = updates._kanbanColumn;
          localStorage.setItem('kanban_column_state', JSON.stringify(kanbanStateObj));
          console.log(`Saved kanban column state for task ${id}:`, updates._kanbanColumn);
        }
        
        // Remove fields that don't exist in the database schema
        const fieldsToRemove = ['status', '_inProgress', '_kanbanColumn', 'computedStatus'];
        for (const field of fieldsToRemove) {
          if (field in dbUpdates) {
            console.log(`Removing ${field} field for database update`);
            delete dbUpdates[field];
          }
        }
        
        // Map status to is_complete if needed
        if (updates.status === 'done') {
          dbUpdates.is_complete = true;
        } else if (updates.status === 'todo' || updates.status === 'in-progress') {
          dbUpdates.is_complete = false;
        }
        
        console.log('Sending updates to database:', dbUpdates);
        
        // Get the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No authenticated user found');
        }
        
        // Only update tasks that belong to the current user
        const { data, error } = await supabase
          .from("tasks")
          .update(dbUpdates)
          .match({ id, user_id: user.id });
        
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
      return this.updateTask(id, { 
        is_complete: !currentStatus
      });
    },
    
    async updateTaskImportance(id, importance) {
      return this.updateTask(id, { importance });
    },
    
    async deleteTask(id) {
      this.setLoading(true);
      this.error = null;
      
      try {
        // Remove the task from the kanban column state
        const kanbanState = localStorage.getItem('kanban_column_state');
        if (kanbanState) {
          const kanbanStateObj = JSON.parse(kanbanState);
          if (kanbanStateObj[id]) {
            delete kanbanStateObj[id];
            localStorage.setItem('kanban_column_state', JSON.stringify(kanbanStateObj));
            console.log(`Removed task ${id} from kanban column state`);
          }
        }
        
        // Check if we're in development mode
        if (localStorage.getItem('dev_mode_user')) {
          console.log('Deleting task in development mode', id);
          devModeTasks = devModeTasks.filter(task => task.id !== id);
          // Save to localStorage
          this.saveDevModeTasks();
          await this.fetchTasks();
          this.setSuccess('Task deleted successfully!');
          return;
        }
        
        // Otherwise use Supabase
        // Get the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No authenticated user found');
        }
        
        // Only delete tasks that belong to the current user
        const { error } = await supabase
          .from("tasks")
          .delete()
          .match({ id, user_id: user.id });
        
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