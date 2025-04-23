<template>
  <form @submit.prevent="handleSubmit" class="task-form">
    <div class="input-group">
      <input 
        type="text" 
        v-model="taskTitle" 
        placeholder="Add a new task..." 
        :disabled="isSubmitting"
        ref="inputField"
        class="task-input"
      />
      <select 
        v-model="taskPriority" 
        :disabled="isSubmitting"
        class="priority-select"
        aria-label="Task priority"
      >
        <option value="high">High Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="low">Low Priority</option>
      </select>
    </div>
    <button 
      type="submit" 
      :disabled="!taskTitle.trim() || isSubmitting"
      class="add-button"
    >
      {{ isSubmitting ? 'Adding...' : 'Add Task' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useTaskStore } from '../store/task';

const taskStore = useTaskStore();
const taskTitle = ref('');
const taskPriority = ref('medium'); // Default to medium priority
const isSubmitting = ref(false);
const inputField = ref(null);

const handleSubmit = async () => {
  if (!taskTitle.value.trim() || isSubmitting.value) return;
  
  isSubmitting.value = true;
  
  try {
    await taskStore.addTask(taskTitle.value.trim(), taskPriority.value);
    taskTitle.value = '';
    // Keep the same priority for the next task
    // Focus the input field after submission
    inputField.value.focus();
  } catch (error) {
    console.error('Failed to add task:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.task-form {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex: 1;
  gap: 10px;
  min-width: 250px;
}

.task-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  min-width: 200px;
}

.task-input:focus {
  outline: none;
  border-color: #42b883;
}

.priority-select {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.3s;
  min-width: 150px;
}

.priority-select:focus {
  outline: none;
  border-color: #42b883;
}

.add-button {
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.add-button:hover:not(:disabled) {
  background-color: #3aa876;
}

.add-button:disabled {
  background-color: #a8d5c3;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .task-form {
    flex-direction: column;
  }
  
  .input-group {
    flex-direction: column;
  }
}
</style>