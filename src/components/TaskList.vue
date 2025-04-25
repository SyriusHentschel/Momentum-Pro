<template>
  <div class="task-list-container">
    <div class="task-list-header">
      <div class="task-stats">
        <span class="stat-item">Total: {{ taskStore.totalCount }}</span>
        <span class="stat-item">Completed: {{ taskStore.completedCount }}</span>
        <span class="stat-item">Pending: {{ taskStore.totalCount - taskStore.completedCount }}</span>
      </div>
      
      <div class="task-actions">
        <div class="filter-container">
          <label for="filter-select">Show:</label>
          <select id="filter-select" v-model="filterOption" class="filter-select">
            <option value="all">All tasks</option>
            <option value="pending">Pending only</option>
            <option value="completed">Completed only</option>
          </select>
        </div>
        
        <div class="sort-container">
          <label for="sort-select">Sort by:</label>
          <select id="sort-select" v-model="sortOption" class="sort-select">
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="priority">Priority (High to Low)</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
          </select>
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
        v-for="task in sortedTasks" 
        :key="task.id" 
        :task="task" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTaskStore } from '../store/task';
import TaskItem from './TaskItem.vue';

const taskStore = useTaskStore();
const isClearing = ref(false);
const sortOption = ref('date-desc'); // Default sort option
const filterOption = ref('all'); // Default filter option

// Computed property for filtered and sorted tasks
const sortedTasks = computed(() => {
  // First, filter the tasks
  let filteredTasks;
  
  switch (filterOption.value) {
    case 'pending':
      filteredTasks = taskStore.pendingTasks;
      break;
    case 'completed':
      filteredTasks = taskStore.completedTasks;
      break;
    default:
      filteredTasks = taskStore.tasks;
  }
  
  // Then sort the filtered tasks
  const tasks = [...filteredTasks]; // Create a copy to avoid mutating the store
  
  switch (sortOption.value) {
    case 'date-asc':
      return tasks.sort((a, b) => new Date(a.inserted_at) - new Date(b.inserted_at));
    
    case 'date-desc':
      return tasks.sort((a, b) => new Date(b.inserted_at) - new Date(a.inserted_at));
    
    case 'priority':
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return tasks.sort((a, b) => {
        const priorityA = a.priority ? priorityOrder[a.priority] : 999;
        const priorityB = b.priority ? priorityOrder[b.priority] : 999;
        return priorityA - priorityB;
      });
    
    case 'alphabetical':
      return tasks.sort((a, b) => a.title.localeCompare(b.title));
    
    default:
      return tasks;
  }
});

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
  flex-wrap: wrap;
  gap: 15px;
}

.task-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  animation: fadeIn 0.5s ease;
}

.stat-item {
  font-size: 14px;
  color: #666;
  background-color: #f5f5f5;
  padding: 6px 12px;
  border-radius: 16px;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.sort-container,
.filter-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-container label,
.filter-container label {
  font-size: 14px;
  color: #666;
}

.sort-select,
.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.sort-select:focus,
.filter-select:focus {
  outline: none;
  border-color: #42b883;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.8s ease;
  border: 1px solid #eee;
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
  gap: 16px;
  transition: all 0.3s ease;
  
  /* Enhanced animation for task list */
  animation: fadeIn 0.5s ease;
.draggable-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: background-color var(--transition-fast);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
}

.draggable-item:hover {
  background-color: var(--neutral-200);
}

.task-drag-handle {
  cursor: grab;
  padding: var(--spacing-xs) var(--spacing-sm);
  color: var(--neutral-500);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-drag-handle:hover {
  background-color: var(--neutral-300);
  color: var(--neutral-700);
}

.drag-dots {
  font-size: 1.2rem;
  line-height: 1;
  user-select: none;
}

.ghost-task {
  opacity: 0.5;
  background: var(--primary-light);
  border: 1px dashed var(--primary);
}

.custom-order-info {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--info-light);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--info);
}

.drag-hint {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--info-dark);
  font-size: var(--font-size-sm);
}

.drag-icon {
  font-size: var(--font-size-lg);
}

/* Task list animations */
.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.5s ease;
}

.task-list-enter-from,
.task-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.task-list-move {
  transition: transform 0.5s ease;
}

/* Fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Responsive styles */
@media (min-width: 768px) {
  .task-list-header {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
  }
  
  .search-container {
    order: 1;
    flex: 1;
    max-width: 400px;
    margin: 0;
  }
  
  .task-stats {
    order: 0;
  }
  
  .task-actions {
    order: 2;
    justify-content: flex-end;
  }
}

@media (max-width: 767px) {
  .task-list-header {
    gap: var(--spacing-sm);
  }
  
  .filter-sort-container {
    width: 100%;
    justify-content: space-between;
  }
  
  .sort-select,
  .filter-select {
    min-width: 120px;
  }
}

/* Drag and drop styles */
.draggable-item {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
  position: relative;
}

.task-drag-handle {
  cursor: grab;
  padding: 0 var(--spacing-sm);
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  transition: all var(--transition-fast);
}

.task-drag-handle:hover {
  color: var(--primary);
}

.task-drag-handle:active {
  cursor: grabbing;
}

.drag-dots {
  font-size: 20px;
  line-height: 1;
  user-select: none;
}

.ghost-task {
  opacity: 0.5;
  background: var(--neutral-200);
  border: 1px dashed var(--primary);
}

.custom-order-info {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--primary-light);
  border-radius: var(--radius-md);
  color: var(--primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.5s ease;
}

.drag-hint {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.drag-icon {
  font-size: var(--font-size-md);
  animation: bounce 2s infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1;  
  .draggable-item {
    margin-bottom: var(--spacing-sm);
  }
  
  .task-drag-handle {
    padding: 0 var(--spacing-xs);
  }
}
</style>