<template>
  <form @submit.prevent="handleSubmit" class="task-form">
    <input 
      type="text" 
      v-model="taskTitle" 
      placeholder="Add a new task..." 
      :disabled="isSubmitting"
      ref="inputField"
    />
    <button 
      type="submit" 
      :disabled="!taskTitle.trim() || isSubmitting"
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
const isSubmitting = ref(false);
const inputField = ref(null);

const handleSubmit = async () => {
  if (!taskTitle.value.trim() || isSubmitting.value) return;
  
  isSubmitting.value = true;
  
  try {
    await taskStore.addTask(taskTitle.value.trim());
    taskTitle.value = '';
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
}

input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #42b883;
}

button {
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

button:hover:not(:disabled) {
  background-color: #3aa876;
}

button:disabled {
  background-color: #a8d5c3;
  cursor: not-allowed;
}
</style>