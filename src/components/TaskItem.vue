<template>
  <div class="task-item" :class="{ 'completed': task.is_complete }">
    <div class="task-content">
      <label class="checkbox-container">
        <input 
          type="checkbox" 
          :checked="task.is_complete" 
          @change="toggleComplete"
          :disabled="isUpdating"
        />
        <span class="checkmark"></span>
      </label>
      
      <div class="task-details">
        <p class="task-title">{{ task.title }}</p>
        <span class="task-date">{{ formatDate(task.inserted_at) }}</span>
      </div>
    </div>
    
    <button 
      class="delete-btn" 
      @click="deleteTask"
      :disabled="isUpdating"
      aria-label="Delete task"
    >
      <span class="delete-icon">×</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTaskStore } from '../store/task';

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const taskStore = useTaskStore();
const isUpdating = ref(false);

const toggleComplete = async () => {
  isUpdating.value = true;
  try {
    await taskStore.toggleTaskCompletion(props.task.id, props.task.is_complete);
  } catch (error) {
    console.error('Error toggling task completion:', error);
  } finally {
    isUpdating.value = false;
  }
};

const deleteTask = async () => {
  if (confirm('Are you sure you want to delete this task?')) {
    isUpdating.value = true;
    try {
      await taskStore.deleteTask(props.task.id);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      isUpdating.value = false;
    }
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};
</script>

<style scoped>
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.task-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-item.completed {
  background-color: #f9f9f9;
}

.task-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.checkbox-container {
  display: block;
  position: relative;
  padding-left: 30px;
  margin-right: 15px;
  cursor: pointer;
  user-select: none;
  min-width: 24px;
  height: 24px;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 24px;
  width: 24px;
  background-color: #eee;
  border-radius: 4px;
  transition: all 0.2s;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: #ccc;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #42b883;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 9px;
  top: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.task-details {
  flex: 1;
}

.task-title {
  font-size: 16px;
  margin: 0;
  color: #333;
  transition: all 0.3s;
}

.completed .task-title {
  text-decoration: line-through;
  color: #888;
}

.task-date {
  font-size: 12px;
  color: #888;
  display: block;
  margin-top: 4px;
}

.delete-btn {
  background: none;
  border: none;
  color: #ff5252;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.delete-btn:hover {
  opacity: 1;
  background-color: rgba(255, 82, 82, 0.1);
}

.delete-icon {
  line-height: 1;
}
</style>