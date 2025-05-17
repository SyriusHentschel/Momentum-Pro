<template>
  <div class="kanban-page">
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
    
    <main class="kanban-page-content">
      <div class="dashboard-top-bar">
        <h2>Welcome, {{ userDisplayName }}</h2>
        <div class="view-toggle">
          <router-link to="/" class="view-btn">
            <span class="view-icon">📋</span>
            <span class="btn-text">List View</span>
          </router-link>
          <router-link to="/kanban" class="view-btn active">
            <span class="view-icon">📊</span>
            <span class="btn-text">Kanban View</span>
          </router-link>
        </div>
      </div>
      <p class="view-description">
        Drag and drop tasks between columns to update their status. Click on a task to edit its details.
      </p>
      
      <div class="task-form-container">
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
              <div class="form-column">
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
              
              <div class="form-column">
                <label for="task-status">
                  <span class="label-icon">📋</span>
                  Status:
                </label>
                <select id="task-status" v-model="newTaskStatus" class="status-select">
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
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
      </div>
      
      <KanbanBoard />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useUserStore } from '../store/user';
import { useTaskStore } from '../store/task';
import KanbanBoard from '../components/KanbanBoard.vue';

const router = useRouter();
const userStore = useUserStore();
const taskStore = useTaskStore();
const { user } = storeToRefs(userStore);

// Task form state
const newTaskTitle = ref('');
const newTaskDescription = ref('');
const newTaskImportance = ref('medium');
const newTaskStatus = ref('todo');
const isAddingTask = ref(false);

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
</script>

<style scoped>
.kanban-page {
  width: 100%;
  min-height: 100vh;
  padding: 1rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.dashboard-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--color-text-primary);
  font-weight: 700;
}

.dashboard-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.profile-btn, .sign-out-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  transition: background-color 0.2s;
}

.profile-btn:hover, .sign-out-btn:hover {
  background-color: var(--color-bg-tertiary);
}

.profile-icon, .sign-out-icon {
  font-size: 1.2rem;
}

.welcome-section h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text-primary);
}

.view-description {
  color: var(--color-text-secondary);
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
  background-color: var(--color-bg-tertiary);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border-left: 3px solid var(--color-accent-primary);
}

.task-form-container {
  margin-bottom: 2rem;
}

.task-form {
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.task-form h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  font-size: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-wrapper {
  position: relative;
}

.task-input, .task-textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.task-input:focus, .task-textarea:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-accent-primary-rgb), 0.2);
}

.task-textarea {
  min-height: 100px;
  resize: vertical;
}

.char-counter {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

.char-counter.near-limit {
  color: #e74c3c;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-column label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.label-icon {
  font-size: 1.2rem;
}

.importance-select, .status-select {
  padding: 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.importance-select:focus, .status-select:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-accent-primary-rgb), 0.2);
}

.add-task-btn {
  background-color: var(--color-accent-primary);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

.add-task-btn:hover {
  background-color: color-mix(in srgb, var(--color-accent-primary) 80%, black);
}

.add-task-btn:disabled {
  background-color: var(--color-light-gray);
  cursor: not-allowed;
}

.loading-text {
  display: inline-block;
}

.dot-animation::after {
  content: '...';
  animation: dots 1.5s infinite;
  display: inline-block;
  width: 1.5rem;
  text-align: left;
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
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
  
  .form-row {
    flex-direction: column;
  }
}
</style>