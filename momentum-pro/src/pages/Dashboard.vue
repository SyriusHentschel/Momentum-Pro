<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Momentum Pro</h1>
      <button @click="handleSignOut" class="sign-out-btn">Sign Out</button>
    </header>
    
    <main class="dashboard-content">
      <h2>Welcome, {{ userEmail }}</h2>
      
      <!-- Old notification area removed - now using toast notifications -->
      
      <div class="task-form">
        <h3>Add New Task</h3>
        <div class="form-group">
          <input 
            type="text" 
            v-model="newTaskTitle" 
            placeholder="Task title" 
            class="task-input"
          />
          <textarea 
            v-model="newTaskDescription" 
            placeholder="Task description (optional)" 
            class="task-textarea"
          ></textarea>
          
          <div class="form-row">
            <label for="task-importance">Importance:</label>
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
            <span v-if="taskStore.isLoading && isAddingTask">Adding...</span>
            <span v-else>Add Task</span>
          </button>
        </div>
      </div>
      
      <div class="tasks-container">
        <h3>Your Tasks</h3>
        
        <div v-if="taskStore.isLoading && !isAddingTask" class="loading">
          <div class="spinner"></div>
          <p>Loading tasks...</p>
        </div>
        
        <div v-else-if="tasks && tasks.length === 0" class="no-tasks">
          You don't have any tasks yet. Add your first task above!
        </div>
        
        <div v-else class="task-list">
          <div 
            v-for="task in tasks" 
            :key="task.id" 
            class="task-card"
            :class="[
              { 'completed-task': task.is_complete },
              `importance-${task.importance || 'medium'}`
            ]"
          >
            <!-- Edit mode -->
            <div v-if="editingTaskId === task.id" class="edit-mode">
              <input 
                type="text" 
                v-model="editTaskForm.title" 
                class="edit-input"
                placeholder="Task title"
              />
              <textarea 
                v-model="editTaskForm.description" 
                class="edit-textarea"
                placeholder="Task description"
              ></textarea>
              
              <div class="form-row">
                <label>Importance:</label>
                <select v-model="editTaskForm.importance" class="importance-select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div class="edit-actions">
                <button @click="saveTaskEdit(task.id)" class="save-btn" :disabled="!editTaskForm.title.trim()">
                  Save
                </button>
                <button @click="cancelEdit" class="cancel-btn">Cancel</button>
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
              <p class="task-description">{{ task.description || 'No description' }}</p>
              <div class="task-meta">
                <span>Created: {{ formatDate(task.created_at) }}</span>
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

const router = useRouter();
const userStore = useUserStore();
const taskStore = useTaskStore();
const { user } = storeToRefs(userStore);
const { tasks, isLoading } = storeToRefs(taskStore);

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

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.dashboard-header h1 {
  margin: 0;
  color: #333;
}

.sign-out-btn {
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sign-out-btn:hover {
  background-color: #d32f2f;
}

.dashboard-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2, h3 {
  margin-top: 0;
  color: #333;
}

/* Notification styles */
.notification {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: fadeIn 0.3s ease-in-out;
}

.notification.error {
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  color: #d32f2f;
}

.notification.success {
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
  color: #388e3c;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
}

.close-btn:hover {
  opacity: 1;
}

/* Task form styles */
.task-form {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-input, .task-textarea, .importance-select, .edit-input, .edit-textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  color: #333; /* Adding text color to make input text visible */
}

.task-textarea, .edit-textarea {
  min-height: 100px;
  resize: vertical;
}

.importance-select {
  padding: 0.5rem;
  min-width: 120px;
  color: #333;
}

.add-task-btn, .save-btn, .cancel-btn, .confirm-btn {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-task-btn, .save-btn, .confirm-btn {
  background-color: #4a6cf7;
  color: white;
}

.add-task-btn:hover, .save-btn:hover, .confirm-btn:hover {
  background-color: #3a5ce5;
}

.add-task-btn:disabled, .save-btn:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

/* Tasks container styles */
.tasks-container {
  margin-top: 2rem;
}

.loading, .no-tasks {
  text-align: center;
  padding: 2rem;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4a6cf7;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.task-card {
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #4a6cf7; /* Default color */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.task-card.importance-low {
  border-left-color: #8bc34a;
}

.task-card.importance-medium {
  border-left-color: #ff9800;
}

.task-card.importance-high {
  border-left-color: #f44336;
}

.task-card.completed-task {
  opacity: 0.7;
  background-color: #f5f5f5;
}

.task-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  gap: 0.5rem;
  flex: 1;
}

.task-header h4 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
  word-break: break-word;
}

.task-header h4.completed {
  text-decoration: line-through;
  color: #888;
}

.importance-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  color: white;
  font-weight: bold;
}

.importance-badge.importance-low {
  background-color: #8bc34a;
}

.importance-badge.importance-medium {
  background-color: #ff9800;
}

.importance-badge.importance-high {
  background-color: #f44336;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-btn, .delete-btn, .edit-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.edit-btn {
  background-color: #2196f3;
  color: white;
}

.edit-btn:hover {
  background-color: #1976d2;
  transform: scale(1.05);
}

.status-btn {
  background-color: #4caf50;
  color: white;
}

.status-btn:hover {
  background-color: #388e3c;
  transform: scale(1.05);
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #d32f2f;
  transform: scale(1.05);
}

.icon {
  font-size: 1rem;
}

.task-description {
  margin-bottom: 1rem;
  color: #555;
  word-break: break-word;
}

.task-meta {
  font-size: 0.8rem;
  color: #888;
}

/* Edit mode styles */
.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>