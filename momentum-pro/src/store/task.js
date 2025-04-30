// /store/task.js
import { defineStore } from "pinia";
import { supabase } from "../supabase";

// For development mode
let devModeTasks = [
  {
    id: 1,
    title: "Sample Task 1",
    description: "This is a sample task for development mode",
    user_id: "dev-user-123",
    is_complete: false,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Sample Task 2",
    description: "Another sample task for testing",
    user_id: "dev-user-123",
    is_complete: true,
    created_at: new Date().toISOString()
  }
];

export const useTaskStore = defineStore("tasks", {
  state: () => ({
    tasks: null,
  }),
  actions: {
    async fetchTasks() {
      // Check if we're in development mode
      if (localStorage.getItem('dev_mode_user')) {
        console.log('Using development mode tasks');
        this.tasks = [...devModeTasks];
        return;
      }
      
      // Otherwise use Supabase
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .order("id", { ascending: false });
      this.tasks = tasks;
    },
    
    async createTask(title, description, user_id) {
      // Check if we're in development mode
      if (localStorage.getItem('dev_mode_user')) {
        console.log('Creating task in development mode');
        const newTask = {
          id: Date.now(), // Use timestamp as ID
          title,
          description,
          user_id,
          is_complete: false,
          created_at: new Date().toISOString()
        };
        
        devModeTasks.unshift(newTask);
        await this.fetchTasks();
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
            is_complete: false 
          }
        ]);
      
      if (error) throw error;
      await this.fetchTasks();
      return data;
    },
    
    async updateTask(id, updates) {
      // Check if we're in development mode
      if (localStorage.getItem('dev_mode_user')) {
        console.log('Updating task in development mode', id, updates);
        const index = devModeTasks.findIndex(task => task.id === id);
        
        if (index !== -1) {
          devModeTasks[index] = { ...devModeTasks[index], ...updates };
          await this.fetchTasks();
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
      return data;
    },
    
    async deleteTask(id) {
      // Check if we're in development mode
      if (localStorage.getItem('dev_mode_user')) {
        console.log('Deleting task in development mode', id);
        devModeTasks = devModeTasks.filter(task => task.id !== id);
        await this.fetchTasks();
        return;
      }
      
      // Otherwise use Supabase
      const { error } = await supabase
        .from("tasks")
        .delete()
        .match({ id });
      
      if (error) throw error;
      await this.fetchTasks();
    }
  },
});