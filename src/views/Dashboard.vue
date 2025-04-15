<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <div class="header-left">
        <h1 class="app-title">Momentum Pro</h1>
        <h2 class="page-title">My Tasks</h2>
      </div>
      <div class="user-controls">
        <span v-if="user" class="user-email">{{ user.email }}</span>
        <button class="logout-btn" @click="handleLogout">Logout</button>
      </div>
    </header>
    
    <div class="dashboard-content">
      <TaskForm />
      <TaskList />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTaskStore } from '../store/task';
import { storeToRefs } from 'pinia';
import TaskForm from '../components/TaskForm.vue';
import TaskList from '../components/TaskList.vue';

const router = useRouter();
const userStore = useUserStore();
const taskStore = useTaskStore();
const { user } = storeToRefs(userStore);

onMounted(async () => {
  // Fetch tasks when the dashboard loads
  await taskStore.fetchTasks();
});

const handleLogout = async () => {
  try {
    await userStore.signOut();
    router.push('/auth');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};
</script>

<style scoped>
.dashboard-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.app-title {
  color: #2c3e50;
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #42b883 0%, #347474 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-title {
  color: #333;
  margin: 4px 0 0 0;
  font-size: 18px;
  font-weight: 500;
}

.user-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-email {
  font-size: 14px;
  color: #666;
}

.logout-btn {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #d32f2f;
}

.dashboard-content {
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .user-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .dashboard-content {
    padding: 20px 15px;
  }
}
</style>