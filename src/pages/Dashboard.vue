<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>Momentum Pro</h1>
      <button @click="handleSignOut" class="sign-out-btn">Sign Out</button>
    </header>
    
    <main class="dashboard-content">
      <h2>Welcome, {{ userEmail }}</h2>
      
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
          <button @click="addTask" class="add-task-btn" :disabled="!newTaskTitle.trim()">
            Add Task
          </button>
        </div>
      </div>
      
      <div class="tasks-container">
        <h3>Your Tasks</h3>
        
        <div v-if="loading" class="loading">
          Loading tasks...
        </div>
        
        <div v-else-if="tasks && tasks.length === 0" class="no-tasks">
          You don't have any tasks yet. Add your first task above!
        </div>
        
        <div v-else class="task-list">
          <div v-for="task in tasks" :key="task.id" class="task-card">
            <div class="task-header">
              <h4 :class="{ 'completed': task.is_complete }">{{ task.title }}</h4>
              <div class="task-actions">
                <button @click="toggleTaskStatus(task)" class="status-btn">
                  {{ task.is_complete ? 'Mark Incomplete' : 'Mark Complete' }}
                </button>
                <button @click="deleteTask(task.id)" class="delete-btn">Delete</button>
              </div>
            </div>
            <p class="task-description">{{ task.description || 'No description' }}</p>
            <div class="task-meta">
              <span>Created: {{ formatDate(task.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useUserStore } from '../store/user';
import { useTaskStore } from '../store/task';

const router = useRouter();
const userStore = useUserStore();
const taskStore = useTaskStore();
const { user } = storeToRefs(userStore);
const { tasks } = storeToRefs(taskStore);

const loading = ref(true);
const newTaskTitle = ref('');
const newTaskDescription = ref('');

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
  } finally {
    loading.value = false;
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
    await taskStore.createTask(
      newTaskTitle.value.trim(),
      newTaskDescription.value.trim(),
      user.value.id
    );
    
    // Clear form
    newTaskTitle.value = '';
    newTaskDescription.value = '';
  } catch (error) {
    console.error('Error adding task:', error);
  }
};

const toggleTaskStatus = async (task) => {
  try {
    await taskStore.updateTask(task.id, {
      is_complete: !task.is_complete
    });
  } catch (error) {
    console.error('Error updating task:', error);
  }
};

const deleteTask = async (taskId) => {
  try {
    await taskStore.deleteTask(taskId);
  } catch (error) {
    console.error('Error deleting task:', error);
  }
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

.task-input, .task-textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.task-textarea {
  min-height: 100px;
  resize: vertical;
}

.add-task-btn {
  padding: 0.75rem;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-task-btn:hover {
  background-color: #3a5ce5;
}

.add-task-btn:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

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

.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.task-card {
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
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

.task-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-btn, .delete-btn {
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.status-btn {
  background-color: #4caf50;
  color: white;
}

.status-btn:hover {
  background-color: #388e3c;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #d32f2f;
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
</style>