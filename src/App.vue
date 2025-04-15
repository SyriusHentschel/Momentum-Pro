<template>
  <div class="app-container">
    <div v-if="isDevMode" class="dev-mode-banner">
      Momentum Pro - Development Mode
      <button @click="setMockUser" class="dev-button">
        {{ user ? 'Reset User' : 'Set Mock User' }}
      </button>
    </div>
    <router-view class="app-main" />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from './store/user.js'

const router = useRouter()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

// Check if we're in development mode without proper Supabase credentials
const isDevMode = computed(() => userStore.isDevelopmentMode)

// Function to set a mock user for development testing
const setMockUser = () => {
  if (user.value) {
    userStore.signOut()
    router.push('/auth')
  } else {
    userStore.setMockUserForDev()
    router.push('/')
  }
}

onMounted(async () => {
  try {
    await userStore.fetchUser()
    
    // In development mode, we'll allow viewing the app without authentication
    if (!user.value && !isDevMode.value) {
      router.push('/auth')
    }
  } catch (e) {
    console.error('Error in App.vue onMounted:', e)
    if (!isDevMode.value) {
      router.push('/auth')
    }
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;
  position: relative;
}

.app-main {
  min-height: 100vh;
  padding-top: var(--dev-banner-height, 0px);
}

.dev-mode-banner {
  --dev-banner-height: 40px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #ff9800;
  color: white;
  text-align: center;
  padding: 8px 16px;
  font-weight: bold;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.dev-button {
  background-color: white;
  color: #ff9800;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

button {
  cursor: pointer;
}

a {
  text-decoration: none;
  color: inherit;
}
</style>