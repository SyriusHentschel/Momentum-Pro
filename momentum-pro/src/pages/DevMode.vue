<template>
  <div class="dev-mode-page">
    <h1>Development Mode</h1>
    <p>This page allows you to enable development mode for testing.</p>
    
    <div class="card">
      <h2>Enable Development Mode</h2>
      <p>This will create a fake user in localStorage to bypass authentication.</p>
      <button @click="enableDevMode" class="enable-btn">Enable Dev Mode</button>
      
      <div v-if="isDevModeEnabled" class="success-message">
        <p>✅ Development mode is enabled!</p>
        <p>You can now access the app without authentication.</p>
        <router-link to="/test" class="nav-link">Go to Test Page</router-link>
        <router-link to="/" class="nav-link">Go to Dashboard</router-link>
      </div>
    </div>
    
    <div class="card">
      <h2>Disable Development Mode</h2>
      <p>This will remove the fake user from localStorage.</p>
      <button @click="disableDevMode" class="disable-btn" :disabled="!isDevModeEnabled">Disable Dev Mode</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToastStore } from '../store/toast';

const toastStore = useToastStore();
const isDevModeEnabled = ref(false);

onMounted(() => {
  checkDevMode();
});

function checkDevMode() {
  isDevModeEnabled.value = localStorage.getItem('dev_mode_user') !== null;
}

function enableDevMode() {
  const devModeUser = {
    id: 'dev-user-123',
    email: 'dev@example.com',
    user_metadata: {
      name: 'Development User'
    },
    created_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString()
  };
  
  localStorage.setItem('dev_mode_user', JSON.stringify(devModeUser));
  localStorage.setItem('user_profile', JSON.stringify({
    id: 'dev-profile-123',
    user_id: 'dev-user-123',
    display_name: 'Development User',
    bio: 'This is a development user profile',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  checkDevMode();
  toastStore.success('Development mode enabled!');
}

function disableDevMode() {
  localStorage.removeItem('dev_mode_user');
  localStorage.removeItem('user_profile');
  
  checkDevMode();
  toastStore.success('Development mode disabled!');
}
</script>

<style scoped>
.dev-mode-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.card {
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-md);
}

h2 {
  margin-top: 0;
  color: var(--color-text-primary);
}

button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.enable-btn {
  background-color: var(--color-green);
  color: white;
}

.enable-btn:hover {
  background-color: var(--color-green-dark);
}

.disable-btn {
  background-color: var(--color-red);
  color: white;
}

.disable-btn:hover {
  background-color: var(--color-red-dark);
}

.disable-btn:disabled {
  background-color: var(--color-light-gray);
  cursor: not-allowed;
}

.success-message {
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(35, 209, 96, 0.1);
  border-left: 3px solid var(--color-green);
  border-radius: 4px;
}

.nav-link {
  display: inline-block;
  margin-top: 0.5rem;
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-accent-primary);
  color: white;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: color-mix(in srgb, var(--color-accent-primary) 80%, black);
  color: white;
}
</style>