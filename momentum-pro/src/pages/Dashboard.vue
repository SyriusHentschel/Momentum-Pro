<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Momentum Pro</h1>
      <div class="header-actions">
        <router-link to="/profile" class="profile-btn">
          <span class="profile-icon">👤</span>
          <span class="btn-text">My Profile</span>
        </router-link>
        <button @click="handleSignOut" class="sign-out-btn">
          <span class="sign-out-icon">🚪</span>
          <span class="btn-text">Sign Out</span>
        </button>
      </div>
    </header>
    
    <main class="dashboard-content">
      <div class="dashboard-top-bar">
        <h2>Welcome, {{ userDisplayName }}</h2>
        <div class="view-toggle">
          <router-link to="/" class="view-btn active">
            <span class="view-icon">📋</span>
            <span class="btn-text">List View</span>
          </router-link>
          <router-link to="/kanban" class="view-btn">
            <span class="view-icon">📊</span>
            <span class="btn-text">Kanban View</span>
          </router-link>
        </div>
      </div>
      
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
              maxlength="50"
            />
            <div class="char-counter" :class="{ 'near-limit': newTaskTitle.length > 40 }">
              {{ newTaskTitle.length }}/50
            </div>
            <span class="input-focus-effect"></span>
          </div>
          
          <div class="input-wrapper">
            <textarea 
              v-model="newTaskDescription" 
              placeholder="Task description (optional)" 
              class="task-textarea"
              maxlength="200"
            ></textarea>
            <div class="char-counter" :class="{ 'near-limit': newTaskDescription.length > 160 }">
              {{ newTaskDescription.length }}/200
            </div>
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
          
          <div class="form-row">
            <label for="task-status">
              <span class="label-icon">📋</span>
              Status:
            </label>
            <select id="task-status" v-model="newTaskStatus" class="status-select">
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Complete</option>
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
          <transition-group 
            name="task-transition" 
            tag="div" 
            class="task-list-inner"
          >
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
                  maxlength="50"
                />
                <div class="char-counter" :class="{ 'near-limit': editTaskForm.title.length > 40 }">
                  {{ editTaskForm.title.length }}/50
                </div>
                <span class="input-focus-effect"></span>
              </div>
              
              <div class="input-wrapper">
                <textarea 
                  v-model="editTaskForm.description" 
                  class="edit-textarea"
                  placeholder="Task description"
                  maxlength="200"
                ></textarea>
                <div class="char-counter" :class="{ 'near-limit': editTaskForm.description.length > 160 }">
                  {{ editTaskForm.description.length }}/200
                </div>
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
              
              <div class="form-row">
                <label>
                  <span class="label-icon">📋</span>
                  Status:
                </label>
                <select v-model="editTaskForm.status" class="status-select">
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Complete</option>
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
                <div class="description-container">
                  <p class="task-description" :class="{ 'expanded': expandedDescriptions[task.id] }">
                    {{ task.description || 'No description' }}
                  </p>
                  <button 
                    v-if="task.description && task.description.length > 100" 
                    @click="toggleDescription(task.id)" 
                    class="read-more-btn"
                  >
                    {{ expandedDescriptions[task.id] ? 'Show Less' : 'Read More' }}
                  </button>
                </div>
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
          </transition-group>
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
import { useToastStore } from '../store/toast';
import { usePreferencesStore } from '../store/preferences';
import { supabase } from '../supabase';

const router = useRouter();
const userStore = useUserStore();
const taskStore = useTaskStore();
const toastStore = useToastStore();
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
const newTaskStatus = ref('todo');
const isAddingTask = ref(false);

// Edit task state
const editingTaskId = ref(null);
const editTaskForm = ref({
  title: '',
  description: '',
  importance: 'medium',
  status: 'todo'
});

// Delete confirmation state
const showDeleteConfirm = ref(false);
const taskToDelete = ref(null);

// Description expansion state
const expandedDescriptions = ref({});

// Get user display name from profile or fallback to email
const userDisplayName = computed(() => {
  // Try to get user profile from localStorage
  const savedProfile = localStorage.getItem('user_profile');
  if (savedProfile) {
    const userProfile = JSON.parse(savedProfile);
    if (userProfile.display_name) {
      return userProfile.display_name;
    }
  }
  
  // Fallback to email or default
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
    
    // Get the current user from Supabase directly
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      console.error('No authenticated user found');
      toastStore.error('You must be logged in to create tasks');
      return;
    }
    
    // Prepare description with status marker if needed
    let description = newTaskDescription.value.trim();
    if (newTaskStatus.value === 'in-progress' && !description.includes('[STATUS:in-progress]')) {
      description = `[STATUS:in-progress] ${description}`;
    }
    
    // Set is_complete based on status
    const isComplete = newTaskStatus.value === 'done';
    
    await taskStore.createTask(
      newTaskTitle.value.trim(),
      description,
      userId,
      newTaskImportance.value,
      newTaskStatus.value
    );
    
    // Clear form
    newTaskTitle.value = '';
    newTaskDescription.value = '';
    newTaskImportance.value = 'medium';
    newTaskStatus.value = 'todo';
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
  // Clean up the description by removing the status marker for display
  let cleanDescription = task.description || '';
  if (cleanDescription.includes('[STATUS:in-progress]')) {
    cleanDescription = cleanDescription.replace('[STATUS:in-progress] ', '');
  }
  
  // Determine the correct status
  let status = task.status;
  if (!status) {
    if (task.is_complete) {
      status = 'done';
    } else if (task.description && task.description.includes('[STATUS:in-progress]')) {
      status = 'in-progress';
    } else {
      status = 'todo';
    }
  }
  
  editingTaskId.value = task.id;
  editTaskForm.value = {
    title: task.title,
    description: cleanDescription,
    importance: task.importance || 'medium',
    status: status,
    originalDescription: task.description // Store original for reference
  };
};

// Save task edits
const saveTaskEdit = async (taskId) => {
  if (!editTaskForm.value.title.trim()) return;
  
  try {
    const status = editTaskForm.value.status || 'todo';
    
    // Prepare description with status marker if needed
    let description = editTaskForm.value.description.trim();
    
    if (status === 'in-progress') {
      // Add the marker if it's not already there
      if (!description.includes('[STATUS:in-progress]')) {
        description = `[STATUS:in-progress] ${description}`;
      }
    } else {
      // Remove the marker if the task is no longer in progress
      if (description.includes('[STATUS:in-progress]')) {
        description = description.replace('[STATUS:in-progress] ', '');
      }
    }
    
    // Create base task data that works for both database and dev mode
    const updateData = {
      title: editTaskForm.value.title.trim(),
      description: description,
      importance: editTaskForm.value.importance,
      is_complete: status === 'done'
    };
    
    // Only add status for dev mode
    if (localStorage.getItem('dev_mode_user')) {
      updateData.status = status;
    }
    
    // Set the _kanbanColumn property to track which column this task is in
    // This won't be sent to the database because we'll filter it out
    updateData._kanbanColumn = status;
    
    // Save the kanban column state to localStorage
    const kanbanState = localStorage.getItem('kanban_column_state');
    const kanbanStateObj = kanbanState ? JSON.parse(kanbanState) : {};
    kanbanStateObj[taskId] = status;
    localStorage.setItem('kanban_column_state', JSON.stringify(kanbanStateObj));
    
    await taskStore.updateTask(taskId, updateData);
    
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
  animation: fadeIn 0.8s ease-out;
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
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
  background-color: var(--color-bg-tertiary);
  padding: 0.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.view-btn:hover {
  background-color: var(--color-bg-tertiary);
}

.view-btn.active {
  background-color: var(--color-accent-primary);
  color: white;
}

.view-icon {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .dashboard-top-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .view-toggle {
    width: 100%;
    justify-content: center;
  }
}

.dashboard-header h1 {
  text-shadow: 0 0 10px rgba(138, 43, 226, 0.3);
  position: relative;
  animation: titleGlow 3s infinite alternate;
  letter-spacing: 0.5px;
}

@keyframes titleGlow {
  0% {
    text-shadow: 0 0 10px rgba(138, 43, 226, 0.3);
  }
  100% {
    text-shadow: 0 0 20px rgba(138, 43, 226, 0.6), 0 0 30px rgba(255, 215, 0, 0.3);
  }
}

.dashboard-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.dashboard-content h2 {
  animation: fadeIn 1s ease-out;
  margin-bottom: 0;
  position: relative;
  display: inline-block;
  transition: all 0.3s ease;
  color: var(--color-text-primary);
}

.dashboard-content h2::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary));
  transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 2px;
}

.dashboard-content h2:hover::after {
  width: 100%;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 576px) {
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}

.profile-btn {
  padding: 0.6rem 1.2rem;
  background-color: var(--color-purple);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 10px rgba(138, 43, 226, 0.3);
  position: relative;
  overflow: hidden;
  z-index: 1;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.profile-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.6s;
  z-index: -1;
}

.profile-btn:hover::before {
  left: 100%;
}

.profile-btn:hover {
  background-color: var(--color-purple-dark, #6a1b9a);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(138, 43, 226, 0.4);
}

.profile-icon {
  font-size: 1.1rem;
}

.sign-out-btn {
  padding: 0.6rem 1.2rem;
  background-color: var(--color-red);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 10px rgba(255, 56, 96, 0.3);
  position: relative;
  overflow: hidden;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.sign-out-icon {
  font-size: 1.1rem;
}

.sign-out-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.6s;
  z-index: -1;
}

.sign-out-btn:hover::before {
  left: 100%;
}

.sign-out-btn:hover {
  background-color: var(--color-red-dark);
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(255, 56, 96, 0.5);
}

.sign-out-btn .btn-text {
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.sign-out-btn:hover .btn-text {
  transform: scale(1.05);
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.dashboard-content {
  background-color: var(--color-bg-secondary);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-light-gray);
  position: relative;
  overflow: hidden;
  animation: fadeIn 1s ease-out;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.dashboard-content:hover {
  box-shadow: var(--shadow-lg), 0 0 20px rgba(138, 43, 226, 0.1);
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
  padding: 1.8rem;
  background-color: var(--color-bg-tertiary);
  border-radius: 12px;
  border: 1px solid var(--color-light-gray);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  animation: fadeIn 1s ease-out;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.task-form:hover {
  box-shadow: var(--shadow-lg), 0 0 20px rgba(138, 43, 226, 0.15);
  transform: translateY(-3px);
}

.task-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary));
  opacity: 0.8;
}

.task-form::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(138, 43, 226, 0.1) 0%, transparent 70%);
  pointer-events: none;
  animation: pulse 3s infinite alternate;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  animation: fadeIn 1.2s ease-out;
  position: relative;
}

.form-group > * {
  animation: slideUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(10px);
}

.form-group > *:nth-child(1) { animation-delay: 0.1s; }
.form-group > *:nth-child(2) { animation-delay: 0.2s; }
.form-group > *:nth-child(3) { animation-delay: 0.3s; }
.form-group > *:nth-child(4) { animation-delay: 0.4s; }

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  margin-bottom: 1rem;
  width: 100%;
}

.form-row:hover {
  transform: translateX(3px);
}

.form-row label {
  color: var(--color-text-secondary);
  font-weight: 500;
  min-width: 100px;
  width: 100px;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
}

.importance-select, .status-select {
  flex: 1;
  min-width: 140px;
  width: 100%;
}

.form-row:hover label {
  color: var(--color-accent-primary);
  transform: scale(1.02);
}

.label-icon {
  margin-right: 5px;
  display: inline-block;
  transition: all 0.3s ease;
}

.form-row:hover .label-icon {
  transform: scale(1.2) rotate(10deg);
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
  
  .importance-select, .status-select {
    width: 100%;
  }
}

.task-input, .task-textarea, .edit-input, .edit-textarea {
  padding: 0.85rem;
  border: 1px solid var(--color-light-gray);
  border-radius: 8px;
  font-size: 1rem;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.task-input:hover, .task-textarea:hover, .edit-input:hover, .edit-textarea:hover {
  border-color: var(--color-accent-primary);
  box-shadow: 0 3px 8px rgba(138, 43, 226, 0.1);
  transform: translateY(-2px);
}

.task-input:focus, .task-textarea:focus, .edit-input:focus, .edit-textarea:focus {
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2), 0 3px 8px rgba(0, 0, 0, 0.1);
  outline: none;
  transform: translateY(-2px);
}

.task-textarea, .edit-textarea {
  min-height: 120px;
  resize: vertical;
  line-height: 1.5;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.task-textarea:focus, .edit-textarea:focus {
  min-height: 140px;
}

/* Character counter */
.char-counter {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: right;
  margin-top: 0.3rem;
  transition: all 0.3s ease;
}

.char-counter.near-limit {
  color: var(--color-red);
  font-weight: 500;
}

.importance-select, .status-select {
  padding: 0.6rem 0.8rem;
  min-width: 140px;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-light-gray);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1em;
  padding-right: 2.5rem;
}

.importance-select:hover, .status-select:hover {
  border-color: var(--color-accent-primary);
  box-shadow: 0 3px 8px rgba(138, 43, 226, 0.15);
  transform: translateY(-2px);
}

.importance-select:focus, .status-select:focus {
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2), 0 3px 8px rgba(0, 0, 0, 0.1);
  outline: none;
  transform: translateY(-2px);
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
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.add-task-btn::before, .save-btn::before, .confirm-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.6s;
  z-index: -1;
}

.add-task-btn:hover::before, .save-btn:hover::before, .confirm-btn:hover::before {
  left: 100%;
}

.add-task-btn:hover, .save-btn:hover, .confirm-btn:hover {
  background-color: var(--color-purple-dark);
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(138, 43, 226, 0.5);
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
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.cancel-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: all 0.6s;
  z-index: -1;
}

.cancel-btn:hover::before {
  left: 100%;
}

.cancel-btn:hover {
  background-color: var(--color-light-gray);
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cancel-btn:active {
  transform: translateY(1px);
  transition: all 0.1s;
}

/* Tasks container styles */
.tasks-container {
  margin-top: 2rem;
}

.no-tasks {
  text-align: center;
  padding: 2.5rem;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-tertiary);
  border-radius: 12px;
  border: 1px solid var(--color-light-gray);
  animation: fadeIn 0.5s ease-out, pulse 3s infinite alternate;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.no-tasks::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(138, 43, 226, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-tertiary);
  border-radius: 12px;
  border: 1px solid var(--color-light-gray);
  box-shadow: var(--shadow-md);
  animation: pulse 2s ease-in-out infinite;
}

.loading p {
  margin-top: 1.2rem;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  font-weight: 500;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 0.5rem;
  border: 4px solid rgba(138, 43, 226, 0.1);
  border-radius: 50%;
  border-top-color: var(--color-accent-primary);
  border-right-color: var(--color-accent-secondary);
  animation: spin 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  box-shadow: 0 0 20px rgba(138, 43, 226, 0.3);
  position: relative;
}

.spinner::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(138, 43, 226, 0.2) 0%, transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); filter: blur(5px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

.task-list {
  width: 100%;
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
  border-radius: 12px;
  border-left: 4px solid var(--color-accent-primary); /* Default color */
  box-shadow: var(--shadow-md);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.5s ease-out;
  transform-origin: center;
  will-change: transform, box-shadow, opacity;
  backdrop-filter: blur(5px);
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
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-lg), 0 10px 20px rgba(0, 0, 0, 0.2);
  border-left-width: 6px;
}

.task-card:active {
  transform: translateY(-2px) scale(0.98);
  transition: all 0.2s;
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
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* Show full title on hover */
.task-header h4:hover {
  white-space: normal;
  overflow: visible;
  position: relative;
  z-index: 10;
  background-color: var(--color-bg-tertiary);
  box-shadow: var(--shadow-sm);
  padding: 2px 5px;
  border-radius: 4px;
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
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  will-change: transform, box-shadow;
}

.edit-btn {
  background-color: var(--color-purple);
  color: white;
}

.edit-btn:hover {
  background-color: var(--color-purple-dark);
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 5px 10px rgba(138, 43, 226, 0.4);
}

.edit-btn:active {
  transform: translateY(1px) scale(0.95);
  box-shadow: 0 2px 3px rgba(138, 43, 226, 0.3);
  transition: all 0.1s;
}

.status-btn {
  background-color: #4caf50;
  color: white;
}

.status-btn:hover {
  background-color: #388e3c;
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 5px 10px rgba(76, 175, 80, 0.4);
}

.status-btn:active {
  transform: translateY(1px) scale(0.95);
  box-shadow: 0 2px 3px rgba(76, 175, 80, 0.3);
  transition: all 0.1s;
}

.delete-btn {
  background-color: var(--color-red);
  color: white;
}

.delete-btn:hover {
  background-color: var(--color-red-dark);
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 5px 10px rgba(255, 56, 96, 0.4);
}

.delete-btn:active {
  transform: translateY(1px) scale(0.95);
  box-shadow: 0 2px 3px rgba(255, 56, 96, 0.3);
  transition: all 0.1s;
}

.icon {
  font-size: 1.1rem;
  transition: all 0.3s;
  display: inline-block;
}

.edit-btn:hover .icon {
  transform: rotate(15deg);
}

.status-btn:hover .icon {
  transform: scale(1.2);
}

.delete-btn:hover .icon {
  animation: shake 0.5s;
}

@keyframes shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-3px); }
  40% { transform: translateX(3px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
  100% { transform: translateX(0); }
}

.description-container {
  position: relative;
  margin-bottom: 1rem;
}

.task-description {
  color: var(--color-text-secondary);
  word-break: break-word;
  line-height: 1.5;
  font-size: 0.95rem;
  max-height: 4.5rem; /* Limit to about 3 lines of text */
  overflow: hidden;
  position: relative;
  margin-bottom: 0.5rem;
  transition: max-height 0.3s ease;
}

.task-description.expanded {
  max-height: 300px;
  overflow-y: auto;
}

/* Add fade-out effect for long descriptions */
.task-description:not(.expanded)::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 1.5rem;
  background: linear-gradient(to bottom, transparent, var(--color-bg-tertiary));
  pointer-events: none;
  opacity: 0.8;
}

.read-more-btn {
  background: none;
  border: none;
  color: var(--color-accent-primary);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  font-weight: 500;
  transition: all 0.2s ease;
}

.read-more-btn:hover {
  color: var(--color-purple-dark);
  text-decoration: underline;
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
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.modal-content {
  background-color: var(--color-bg-secondary);
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-lg), 0 0 30px rgba(138, 43, 226, 0.4);
  border: 1px solid var(--color-light-gray);
  position: relative;
  overflow: hidden;
  animation: modalEnter 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-origin: center;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary));
}

@keyframes modalEnter {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(30px);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
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
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  margin-bottom: 1.2rem;
}

.input-wrapper:focus-within {
  transform: translateY(-2px);
}

.input-focus-effect {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-purple), var(--color-gold));
  transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease;
  border-radius: 2px;
}

.task-input:focus + .input-focus-effect,
.task-textarea:focus + .input-focus-effect,
.edit-input:focus + .input-focus-effect,
.edit-textarea:focus + .input-focus-effect {
  width: 100%;
  box-shadow: 0 0 10px rgba(138, 43, 226, 0.4);
}

/* Add subtle animation to inputs on focus */
.task-input:focus,
.task-textarea:focus,
.edit-input:focus,
.edit-textarea:focus,
.importance-select:focus {
  animation: inputPulse 1s ease-in-out;
}

@keyframes inputPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.01); }
  100% { transform: scale(1); }
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
  60%, 80% { content: '...'; }
  100% { content: ''; }
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
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: rgba(76, 175, 80, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
  animation: pulse 2s infinite alternate;
  transition: all 0.3s ease;
}

.task-card:hover .completion-indicator {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
}

.completion-icon {
  color: #4caf50;
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  animation: fadeIn 0.5s;
}

/* Enhanced button animations */
.sign-out-btn,
.add-task-btn,
.save-btn,
.confirm-btn,
.cancel-btn,
.edit-btn,
.status-btn,
.delete-btn {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.sign-out-btn:hover,
.add-task-btn:hover,
.save-btn:hover,
.confirm-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 14px rgba(0, 0, 0, 0.3), 0 0 10px rgba(138, 43, 226, 0.3);
}

.sign-out-btn:active,
.add-task-btn:active,
.save-btn:active,
.confirm-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.1s;
}

/* Button ripple effect */
.sign-out-btn::after,
.add-task-btn::after,
.save-btn::after,
.confirm-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.sign-out-btn:focus:not(:active)::after,
.add-task-btn:focus:not(:active)::after,
.save-btn:focus:not(:active)::after,
.confirm-btn:focus:not(:active)::after {
  animation: ripple 0.8s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0) translate(-50%, -50%);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20) translate(-50%, -50%);
    opacity: 0;
  }
}

/* Subtle pulse animation for important tasks */
.task-card.importance-high {
  animation: subtle-pulse 3s infinite alternate;
}

@keyframes subtle-pulse {
  0% { box-shadow: var(--shadow-md); }
  100% { box-shadow: 0 5px 15px rgba(255, 56, 96, 0.3); }
}

/* Task transition animations */
.task-list-inner {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

@media (max-width: 768px) {
  .task-list-inner {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
}

.task-transition-enter-active,
.task-transition-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.task-transition-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
  filter: blur(5px);
}

.task-transition-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.9);
  filter: blur(5px);
}

/* Staggered animation for multiple items */
.task-transition-move {
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Task filtering and sorting styles */
.tasks-container {
  margin-top: 2rem;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  animation: fadeIn 0.8s ease-out;
  position: relative;
  padding-bottom: 0.5rem;
}

.tasks-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(138, 43, 226, 0.3), 
    rgba(255, 215, 0, 0.3), 
    transparent
  );
}

.tasks-header h3 {
  font-size: 1.5rem;
  color: var(--color-text-primary);
  margin: 0;
  position: relative;
  display: inline-block;
  transition: all 0.3s ease;
}

.tasks-header h3::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary));
  transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 2px;
}

.tasks-header:hover h3::after {
  width: 100%;
}

.task-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  animation: fadeIn 0.8s ease-out;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-light-gray);
  color: var(--color-text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.filter-controls select:hover,
.sort-controls select:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(138, 43, 226, 0.2);
  border-color: var(--color-accent-primary);
}

.filter-controls select:focus,
.sort-controls select:focus {
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1);
  outline: none;
  animation: selectPulse 1s ease-in-out;
}

@keyframes selectPulse {
  0% { box-shadow: 0 0 0 0 rgba(138, 43, 226, 0.4), 0 4px 8px rgba(0, 0, 0, 0.1); }
  70% { box-shadow: 0 0 0 6px rgba(138, 43, 226, 0), 0 4px 8px rgba(0, 0, 0, 0.1); }
  100% { box-shadow: 0 0 0 0 rgba(138, 43, 226, 0), 0 4px 8px rgba(0, 0, 0, 0.1); }
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