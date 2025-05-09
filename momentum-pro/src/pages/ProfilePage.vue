<template>
  <div class="profile-container">
    <header class="profile-header">
      <h1>My Profile</h1>
      <router-link to="/" class="back-btn">
        <span class="btn-text">Back to Dashboard</span>
      </router-link>
    </header>
    
    <main class="profile-content">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading profile...</p>
      </div>
      
      <div v-else class="profile-card">
        <h2>User Information</h2>
        <div class="profile-info">
          <div class="info-item">
            <label>Email:</label>
            <p>{{ user?.email || 'Not available' }}</p>
          </div>
          
          <div class="info-item">
            <label>User ID:</label>
            <p>{{ user?.id || 'Not available' }}</p>
          </div>
          
          <div class="info-item">
            <label>Last Sign In:</label>
            <p>{{ formatDate(user?.last_sign_in_at) || 'Not available' }}</p>
          </div>
        </div>
        
        <div class="profile-stats">
          <h3>Task Statistics</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-value">{{ totalTasks }}</span>
              <span class="stat-label">Total Tasks</span>
            </div>
            
            <div class="stat-card">
              <span class="stat-value">{{ completedTasks }}</span>
              <span class="stat-label">Completed</span>
            </div>
            
            <div class="stat-card">
              <span class="stat-value">{{ incompleteTasks }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '../store/user';
import { useTaskStore } from '../store/task';

const userStore = useUserStore();
const taskStore = useTaskStore();
const { user } = storeToRefs(userStore);
const { tasks } = storeToRefs(taskStore);
const isLoading = ref(true);

// Computed properties for task statistics
const totalTasks = computed(() => tasks.value?.length || 0);
const completedTasks = computed(() => tasks.value?.filter(task => task.is_complete).length || 0);
const incompleteTasks = computed(() => tasks.value?.filter(task => !task.is_complete).length || 0);

onMounted(async () => {
  try {
    // Fetch user if not already loaded
    if (!user.value) {
      await userStore.fetchUser();
    }
    
    // Fetch tasks if not already loaded
    if (!tasks.value || tasks.value.length === 0) {
      await taskStore.fetchTasks();
    }
  } catch (error) {
    console.error('Error loading profile data:', error);
  } finally {
    isLoading.value = false;
  }
});

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: var(--text-color);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.profile-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: var(--primary-color-dark);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.profile-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.profile-card h2 {
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--heading-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.profile-info {
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  margin-bottom: 1rem;
}

.info-item label {
  font-weight: 600;
  width: 120px;
  color: var(--label-color);
}

.info-item p {
  margin: 0;
}

.profile-stats h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--heading-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background-color: var(--bg-light);
  border-radius: 6px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }
  
  .info-item {
    flex-direction: column;
  }
  
  .info-item label {
    width: 100%;
    margin-bottom: 0.25rem;
  }
}
</style>