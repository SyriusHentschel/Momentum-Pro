// /store/task.js
import { defineStore } from "pinia";
import { supabase } from "../supabase";
import { useUserStore } from "./user";

export const useTaskStore = defineStore("tasks", {
  state: () => ({
    tasks: [],
    loading: false,
    error: null
  }),
  getters: {
    completedTasks: (state) => state.tasks.filter(task => task.is_complete),
    pendingTasks: (state) => state.tasks.filter(task => !task.is_complete),
    totalCount: (state) => state.tasks.length,
    completedCount: (state) => state.tasks.filter(task => task.is_complete).length
  },
  actions: {
    async fetchTasks() {
      this.loading = true;
      this.error = null;
      
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .order("inserted_at", { ascending: false });
          
        if (error) throw error;
        
        this.tasks = data || [];
      } catch (error) {
        console.error("Error fetching tasks:", error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    async addTask(title) {
      const userStore = useUserStore();
      
      try {
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            title,
            user_id: userStore.user.id,
            is_complete: false
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Add the new task to the beginning of the array
        this.tasks = [data, ...this.tasks];
        return data;
      } catch (error) {
        console.error("Error adding task:", error);
        throw error;
      }
    },
    
    async updateTask(id, updates) {
      try {
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
    
    // Clear all completed tasks
    async clearCompletedTasks() {
      const completedIds = this.completedTasks.map(task => task.id);
      
      if (completedIds.length === 0) return;
      
      try {
        // Delete all completed tasks in a single operation
        const { error } = await supabase
          .from("tasks")
          .delete()
          .in("id", completedIds);
          
        if (error) throw error;
        
        // Update local state
        this.tasks = this.tasks.filter(task => !task.is_complete);
      } catch (error) {
        console.error("Error clearing completed tasks:", error);
        throw error;
      }
    }
  },
  persist: true,
});