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
      <div class="priority-summary" v-if="taskStore.totalCount > 0">
        <div class="priority-card priority-high">
          <h3>High Priority</h3>
          <p class="count">{{ taskStore.highPriorityTasks.length }}</p>
        </div>
        <div class="priority-card priority-medium">
          <h3>Medium Priority</h3>
          <p class="count">{{ taskStore.mediumPriorityTasks.length }}</p>
        </div>
        <div class="priority-card priority-low">
          <h3>Low Priority</h3>
          <p class="count">{{ taskStore.lowPriorityTasks.length }}</p>
        </div>
      </div>
      
      <TaskForm />
      <TaskList />
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
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

.priority-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.priority-card {
  flex: 1;
  min-width: 150px;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.priority-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.priority-card h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.priority-card .count {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.priority-card.priority-high {
  background-color: #fff8f8;
  border-left: 4px solid #c62828;
}

.priority-card.priority-medium {
  background-color: #f8fff8;
  border-left: 4px solid #2e7d32;
}

.priority-card.priority-low {
  background-color: #f8f8ff;
  border-left: 4px solid #1565c0;
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