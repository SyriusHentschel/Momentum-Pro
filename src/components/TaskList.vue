<template>
  <div class="task-list-container">
    <div class="task-list-header">
      <div class="task-stats">
        <span class="stat-item">Total: {{ taskStore.totalCount }}</span>
        <span class="stat-item">Completed: {{ taskStore.completedCount }}</span>
        <span class="stat-item">Pending: {{ taskStore.totalCount - taskStore.completedCount }}</span>
      </div>
      
      <button 
        v-if="taskStore.completedCount > 0"
        @click="clearCompleted" 
        class="clear-btn"
        :disabled="isClearing"
      >
        {{ isClearing ? 'Clearing...' : 'Clear Completed' }}
      </button>
    </div>
    
    <div v-if="taskStore.loading" class="loading-message">
      Loading tasks...
    </div>
    
    <div v-else-if="taskStore.error" class="error-message">
      Error loading tasks: {{ taskStore.error }}
    </div>
    
    <div v-else-if="taskStore.tasks.length === 0" class="empty-message">
      <p>You don't have any tasks yet.</p>
      <p>Add your first task above!</p>
    </div>
    
    <div v-else class="task-list">
      <TaskItem 
        v-for="task in taskStore.tasks" 
        :key="task.id" 
        :task="task" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTaskStore } from '../store/task';
import TaskItem from './TaskItem.vue';

const taskStore = useTaskStore();
const isClearing = ref(false);

onMounted(async () => {
  if (!taskStore.tasks.length) {
    await taskStore.fetchTasks();
  }
});

const clearCompleted = async () => {
  if (confirm('Are you sure you want to clear all completed tasks?')) {
    isClearing.value = true;
    try {
      await taskStore.clearCompletedTasks();
    } catch (error) {
      console.error('Error clearing completed tasks:', error);
    } finally {
      isClearing.value = false;
    }
  }
};
</script>

<style scoped>
.task-list-container {
  margin-top: 20px;
}

.task-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  font-size: 14px;
  color: #666;
  background-color: #f5f5f5;
  padding: 6px 12px;
  border-radius: 16px;
}

.clear-btn {
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.clear-btn:hover:not(:disabled) {
  background-color: #e04545;
}

.clear-btn:disabled {
  background-color: #ffb8b8;
  cursor: not-allowed;
}

.loading-message,
.error-message,
.empty-message {
  text-align: center;
  padding: 40px 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #666;
}

.error-message {
  color: #ff5252;
  background-color: #ffebee;
}

.empty-message p {
  margin: 8px 0;
}

.empty-message p:first-child {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.empty-message p:last-child {
  font-size: 16px;
  color: #666;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>