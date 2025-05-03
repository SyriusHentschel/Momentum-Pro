<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Momentum Pro</h1>
      <button @click="handleSignOut" class="sign-out-btn">
        <span class="btn-text">Sign Out</span>
      </button>
    </header>
    
    <main class="dashboard-content">
      <h2>Welcome, {{ userEmail }}</h2>
      
      <!-- Old notification area removed - now using toast notifications -->
      
      <div class="task-form">
        <h3>Add New Task</h3>
        <div class="form-group">
          <div class="input-wrapper">
            <input 
              type="text" 
              v-model="newTaskTitle" 
              placeholder="Task title" 
              class="task-input"
            />
            <span class="input-focus-effect"></span>
          </div>
          
          <div class="input-wrapper">
            <textarea 
              v-model="newTaskDescription" 
              placeholder="Task description (optional)" 
              class="task-textarea"
            ></textarea>
            <span class="input-focus-effect"></span>
          </div>
          
          <div class="form-row">
            <label for="task-importance">
              <span class="label-icon">⚡</span>
              Importance:
            </label>
            <select id="task-importance" v-model="newTaskImportance" class="importance-select">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <button 
            @click="addTask" 
            class="add-task-btn" 
            :disabled="!newTaskTitle.trim() || taskStore.isLoading"
          >
            <span v-if="taskStore.isLoading && isAddingTask" class="loading-text">
              <span class="dot-animation">Adding</span>
            </span>
            <span v-else class="btn-text">Add Task</span>
          </button>
        </div>
      </div>
      
      <div class="tasks-container">
        <div class="tasks-header">
          <h3>Your Tasks</h3>
          
          <div class="task-controls">
            <div class="filter-controls">
              <label for="task-filter">Filter:</label>
              <select id="task-filter" v-model="taskFilter" @change="savePreferences">
                <option value="all">All Tasks</option>
                <option value="complete">Completed</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </div>
            
            <div class="sort-controls">
              <label for="task-sort">Sort By:</label>
              <select id="task-sort" v-model="taskSort" @change="savePreferences">
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="importance">Importance</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
        
        <div v-if="taskStore.isLoading && !isAddingTask" class="loading">
          <div class="spinner"></div>
          <p>Loading tasks...</p>
        </div>
        
        <div v-else-if="tasks && tasks.length === 0" class="no-tasks">
          You don't have any tasks yet. Add your first task above!
        </div>
        
        <div v-else-if="filteredSortedTasks.length === 0" class="no-tasks">
          No tasks match your current filter. Try changing your filter settings.
        </div>
        
        <div v-else class="task-list">
          <div 
            v-for="task in filteredSortedTasks" 
            :key="task.id" 
            class="task-card"
            :class="[
              { 'completed-task': task.is_complete },
              `importance-${task.importance || 'medium'}`
            ]"
          >
            <!-- Edit mode -->
            <div v-if="editingTaskId === task.id" class="edit-mode">
              <div class="input-wrapper">
                <input 
                  type="text" 
                  v-model="editTaskForm.title" 
                  class="edit-input"
                  placeholder="Task title"
                />
                <span class="input-focus-effect"></span>
              </div>
              
              <div class="input-wrapper">
                <textarea 
                  v-model="editTaskForm.description" 
                  class="edit-textarea"
                  placeholder="Task description"
                ></textarea>
                <span class="input-focus-effect"></span>
              </div>
              
              <div class="form-row">
                <label>
                  <span class="label-icon">⚡</span>
                  Importance:
                </label>
                <select v-model="editTaskForm.importance" class="importance-select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div class="edit-actions">
                <button @click="saveTaskEdit(task.id)" class="save-btn" :disabled="!editTaskForm.title.trim()">
                  <span class="btn-text">Save</span>
                </button>
                <button @click="cancelEdit" class="cancel-btn">
                  <span class="btn-text">Cancel</span>
                </button>
              </div>
            </div>
            
            <!-- View mode -->
            <div v-else>
              <div class="task-header">
                <div class="task-title-area">
                  <h4 :class="{ 'completed': task.is_complete }">{{ task.title }}</h4>
                  <span class="importance-badge" :class="`importance-${task.importance || 'medium'}`">
                    {{ task.importance ? task.importance.charAt(0).toUpperCase() + task.importance.slice(1) : 'Medium' }}
                  </span>
                </div>
                <div class="task-actions">
                  <button @click="startEditTask(task)" class="edit-btn" title="Edit task">
                    <span class="icon">✏️</span>
                  </button>
                  <button @click="toggleTaskStatus(task)" class="status-btn" :title="task.is_complete ? 'Mark as incomplete' : 'Mark as complete'">
                    <span class="icon">{{ task.is_complete ? '↩️' : '✓' }}</span>
                  </button>
                  <button @click="confirmDeleteTask(task.id)" class="delete-btn" title="Delete task">
                    <span class="icon">🗑️</span>
                  </button>
                </div>
              </div>
              <div class="task-content">
                <p class="task-description">{{ task.description || 'No description' }}</p>
                <div class="task-meta">
                  <span>Created: {{ formatDate(task.created_at) }}</span>
                </div>
              </div>
              
              <!-- Task completion indicator -->
              <div v-if="task.is_complete" class="completion-indicator">
                <span class="completion-icon">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-content">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this task? This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="deleteTask(taskToDelete)" class="confirm-btn">Yes, Delete</button>
          <button @click="cancelDelete" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useUserStore } from '../store/user';
import { useTaskStore } from '../store/task';
import { usePreferencesStore } from '../store/preferences';

const router = useRouter();
const userStore = useUserStore();
const taskStore = useTaskStore();
const preferencesStore = usePreferencesStore();
const { user } = storeToRefs(userStore);
const { tasks, isLoading } = storeToRefs(taskStore);

// Task filtering and sorting
const taskFilter = ref(preferencesStore.taskFilter);
const taskSort = ref(preferencesStore.taskSort);

// Task form state
const newTaskTitle = ref('');
const newTaskDescription = ref('');
const newTaskImportance = ref('medium');
const isAddingTask = ref(false);

// Edit task state
const editingTaskId = ref(null);
const editTaskForm = ref({
  title: '',
  description: '',
  importance: 'medium'
});

// Delete confirmation state
const showDeleteConfirm = ref(false);
const taskToDelete = ref(null);

const userEmail = computed(() => {
  return user.value?.email || 'User';
});

// Computed property for filtered and sorted tasks
const filteredSortedTasks = computed(() => {
  if (!tasks.value) return [];
  
  // First, filter the tasks
  let result = [...tasks.value];
  
  if (taskFilter.value === 'complete') {
    result = result.filter(task => task.is_complete);
  } else if (taskFilter.value === 'incomplete') {
    result = result.filter(task => !task.is_complete);
  }
  
  // Then, sort the tasks
  switch (taskSort.value) {
    case 'date-desc':
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case 'date-asc':
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
    case 'importance':
      const importanceOrder = { high: 3, medium: 2, low: 1 };
      result.sort((a, b) => {
        const aImportance = importanceOrder[a.importance || 'medium'] || 2;
        const bImportance = importanceOrder[b.importance || 'medium'] || 2;
        return bImportance - aImportance;
      });
      break;
    case 'alphabetical':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }
  
  return result;
});

// Save user preferences
const savePreferences = () => {
  preferencesStore.setTaskFilter(taskFilter.value);
  preferencesStore.setTaskSort(taskSort.value);
};

onMounted(async () => {
  try {
    // Fetch user if not already loaded
    if (!user.value) {
      await userStore.fetchUser();
    }
    
    // Fetch tasks
    if (user.value) {
      await taskStore.fetchTasks();
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
});

const handleSignOut = async () => {
  try {
    await userStore.signOut();
    router.push('/auth');
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

const addTask = async () => {
  if (!newTaskTitle.value.trim()) return;
  
  try {
    isAddingTask.value = true;
    await taskStore.createTask(
      newTaskTitle.value.trim(),
      newTaskDescription.value.trim(),
      user.value.id,
      newTaskImportance.value
    );
    
    // Clear form
    newTaskTitle.value = '';
    newTaskDescription.value = '';
    newTaskImportance.value = 'medium';
  } catch (error) {
    console.error('Error adding task:', error);
  } finally {
    isAddingTask.value = false;
  }
};

const toggleTaskStatus = async (task) => {
  try {
    await taskStore.toggleTaskCompletion(task.id, task.is_complete);
  } catch (error) {
    console.error('Error updating task status:', error);
  }
};

// Start editing a task
const startEditTask = (task) => {
  editingTaskId.value = task.id;
  editTaskForm.value = {
    title: task.title,
    description: task.description || '',
    importance: task.importance || 'medium'
  };
};

// Save task edits
const saveTaskEdit = async (taskId) => {
  if (!editTaskForm.value.title.trim()) return;
  
  try {
    await taskStore.updateTask(taskId, {
      title: editTaskForm.value.title.trim(),
      description: editTaskForm.value.description.trim(),
      importance: editTaskForm.value.importance
    });
    
    // Exit edit mode
    editingTaskId.value = null;
  } catch (error) {
    console.error('Error saving task edits:', error);
  }
};

// Cancel editing
const cancelEdit = () => {
  editingTaskId.value = null;
};

// Show delete confirmation
const confirmDeleteTask = (taskId) => {
  taskToDelete.value = taskId;
  showDeleteConfirm.value = true;
};

// Delete task after confirmation
const deleteTask = async (taskId) => {
  try {
    await taskStore.deleteTask(taskId);
    showDeleteConfirm.value = false;
    taskToDelete.value = null;
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};

// Cancel delete
const cancelDelete = () => {
  showDeleteConfirm.value = false;
  taskToDelete.value = null;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  .dashboard-container {
    padding: 1rem;
  }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-light-gray);
  position: relative;
}

.dashboard-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, 
    var(--color-purple) 0%, 
    var(--color-gold) 50%, 
    var(--color-red) 100%);
  box-shadow: 0 0 8px rgba(138, 43, 226, 0.5);
}

.dashboard-header h1 {
  margin: 0;
  font-size: 2.5rem;
  background: linear-gradient(90deg, var(--color-purple), var(--color-gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(138, 43, 226, 0.3);
}

@media (max-width: 768px) {
  .dashboard-header {
    margin-bottom: 1.5rem;
  }
  
  .dashboard-header h1 {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .dashboard-header h1 {
    font-size: 1.8rem;
  }
}

.sign-out-btn {
  padding: 0.6rem 1.2rem;
  background-color: var(--color-red);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 10px rgba(255, 56, 96, 0.3);
}

.sign-out-btn:hover {
  background-color: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 56, 96, 0.4);
}

.dashboard-content {
  background-color: var(--color-bg-secondary);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-light-gray);
  position: relative;
  overflow: hidden;
}

.dashboard-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, 
    var(--color-purple) 0%, 
    var(--color-gold) 50%, 
    var(--color-red) 100%);
}

h2 {
  margin-top: 0;
  color: var(--color-text-primary);
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
}

h2::after {
  content: '';
  display: block;
  width: 50px;
  height: 3px;
  background: var(--color-accent-secondary);
  margin-top: 8px;
  border-radius: 2px;
}

h3 {
  margin-top: 0;
  color: var(--color-accent-secondary);
  font-size: 1.4rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

h3::before {
  content: '●';
  color: var(--color-accent-primary);
  margin-right: 8px;
  font-size: 0.8rem;
}

/* Task form styles */
.task-form {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: var(--color-bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--color-light-gray);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.task-form::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(138, 43, 226, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.form-row label {
  color: var(--color-text-secondary);
  font-weight: 500;
  min-width: 90px;
}

@media (max-width: 576px) {
  .form-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .form-row label {
    min-width: auto;
    margin-bottom: 0.3rem;
  }
  
  .importance-select {
    width: 100%;
  }
}

.task-input, .task-textarea, .importance-select, .edit-input, .edit-textarea {
  padding: 0.75rem;
  border: 1px solid var(--color-light-gray);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  transition: all 0.3s;
}

.task-input:focus, .task-textarea:focus, .importance-select:focus, 
.edit-input:focus, .edit-textarea:focus {
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2);
  outline: none;
}

.task-textarea, .edit-textarea {
  min-height: 100px;
  resize: vertical;
}

.importance-select {
  padding: 0.5rem;
  min-width: 120px;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-light-gray);
  cursor: pointer;
}

.add-task-btn, .save-btn, .cancel-btn, .confirm-btn {
  padding: 0.75rem 1.2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.add-task-btn, .save-btn, .confirm-btn {
  background-color: var(--color-accent-primary);
  color: white;
  box-shadow: 0 2px 10px rgba(138, 43, 226, 0.3);
}

.add-task-btn:hover, .save-btn:hover, .confirm-btn:hover {
  background-color: var(--color-purple-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(138, 43, 226, 0.4);
}

.add-task-btn:disabled, .save-btn:disabled {
  background-color: var(--color-light-gray);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cancel-btn {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-light-gray);
}

.cancel-btn:hover {
  background-color: var(--color-light-gray);
  transform: translateY(-2px);
}

/* Tasks container styles */
.tasks-container {
  margin-top: 2rem;
}

.loading, .no-tasks {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--color-light-gray);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid rgba(138, 43, 226, 0.1);
  border-radius: 50%;
  border-top-color: var(--color-accent-primary);
  animation: spin 1s linear infinite;
  box-shadow: 0 0 15px rgba(138, 43, 226, 0.2);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); filter: blur(5px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .task-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 576px) {
  .task-list {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.task-card {
  padding: 1.5rem;
  background-color: var(--color-bg-tertiary);
  border-radius: 8px;
  border-left: 4px solid var(--color-accent-primary); /* Default color */
  box-shadow: var(--shadow-md);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.3s ease-out;
}

.task-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.task-card.importance-low {
  border-left-color: #8bc34a;
}

.task-card.importance-medium {
  border-left-color: var(--color-gold);
}

.task-card.importance-high {
  border-left-color: var(--color-red);
}

.task-card.completed-task {
  opacity: 0.7;
  background-color: var(--color-bg-secondary);
}

.task-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.task-title-area {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
}

@media (max-width: 576px) {
  .task-header {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .task-title-area {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .task-actions {
    align-self: flex-end;
  }
}

.task-header h4 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--color-text-primary);
  word-break: break-word;
  font-weight: 600;
}

.task-header h4.completed {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.importance-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.importance-badge.importance-low {
  background-color: #8bc34a;
}

.importance-badge.importance-medium {
  background-color: var(--color-gold);
}

.importance-badge.importance-high {
  background-color: var(--color-red);
}

.task-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-btn, .delete-btn, .edit-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.edit-btn {
  background-color: var(--color-purple);
  color: white;
}

.edit-btn:hover {
  background-color: var(--color-purple-dark);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 8px rgba(138, 43, 226, 0.4);
}

.status-btn {
  background-color: #4caf50;
  color: white;
}

.status-btn:hover {
  background-color: #388e3c;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.4);
}

.delete-btn {
  background-color: var(--color-red);
  color: white;
}

.delete-btn:hover {
  background-color: var(--color-red-dark);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 8px rgba(255, 56, 96, 0.4);
}

.icon {
  font-size: 1rem;
}

.task-description {
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
  word-break: break-word;
  line-height: 1.5;
  font-size: 0.95rem;
}

.task-meta {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
}

.task-meta span::before {
  content: '⏱️';
  margin-right: 5px;
  font-size: 0.9rem;
}

/* Edit mode styles */
.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.edit-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background-color: var(--color-bg-secondary);
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-lg), 0 0 20px rgba(138, 43, 226, 0.3);
  border: 1px solid var(--color-light-gray);
  position: relative;
  overflow: hidden;
}

@media (max-width: 576px) {
  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .modal-actions button {
    width: 100%;
  }
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--color-red) 0%, var(--color-red-dark) 100%);
}

.modal-content h3 {
  margin-top: 0;
  color: var(--color-red);
  font-size: 1.5rem;
}

.modal-content p {
  color: var(--color-text-primary);
  margin: 1rem 0;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.confirm-btn {
  background-color: var(--color-red);
  box-shadow: 0 2px 10px rgba(255, 56, 96, 0.3);
}

.confirm-btn:hover {
  background-color: var(--color-red-dark);
  box-shadow: 0 4px 15px rgba(255, 56, 96, 0.4);
}

/* Enhanced input styling */
.input-wrapper {
  position: relative;
  width: 100%;
}

.input-focus-effect {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-purple), var(--color-gold));
  transition: width 0.3s ease;
}

.task-input:focus + .input-focus-effect,
.task-textarea:focus + .input-focus-effect,
.edit-input:focus + .input-focus-effect,
.edit-textarea:focus + .input-focus-effect {
  width: 100%;
}

/* Button text animation */
.btn-text {
  position: relative;
  z-index: 1;
}

/* Loading animation */
.loading-text {
  display: inline-block;
}

.dot-animation::after {
  content: '...';
  display: inline-block;
  width: 1em;
  text-align: left;
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

/* Label icon styling */
.label-icon {
  display: inline-block;
  margin-right: 5px;
  font-size: 0.9rem;
}

/* Task content styling */
.task-content {
  position: relative;
  z-index: 1;
}

/* Completion indicator */
.completion-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(76, 175, 80, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
}

.completion-icon {
  color: #4caf50;
  font-size: 1rem;
  font-weight: bold;
}

/* Hover effects for buttons */
.sign-out-btn:active,
.add-task-btn:active,
.save-btn:active,
.confirm-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* Subtle pulse animation for important tasks */
.task-card.importance-high {
  animation: subtle-pulse 3s infinite alternate;
}

@keyframes subtle-pulse {
  0% { box-shadow: var(--shadow-md); }
  100% { box-shadow: 0 5px 15px rgba(255, 56, 96, 0.3); }
}

/* Task filtering and sorting styles */
.tasks-container {
  margin-top: 2rem;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.tasks-header h3 {
  font-size: 1.5rem;
  color: var(--color-text-primary);
  margin: 0;
}

.task-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-controls,
.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-controls label,
.sort-controls label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.filter-controls select,
.sort-controls select {
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-light-gray);
  color: var(--color-text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-controls select:hover,
.sort-controls select:hover {
  border-color: var(--color-purple);
}

.filter-controls select:focus,
.sort-controls select:focus {
  outline: none;
  border-color: var(--color-purple);
  box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2);
}

@media (max-width: 768px) {
  .tasks-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .task-controls {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 576px) {
  .task-controls {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
  
  .filter-controls,
  .sort-controls {
    width: 100%;
  }
  
  .filter-controls select,
  .sort-controls select {
    flex-grow: 1;
  }
}
</style>