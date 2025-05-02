<template>
  <section>
    <router-view class="app-main" /> <!-- your routes will load inside of these tags -->
    <ToastNotification />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from './store/user.js'
import ToastNotification from './components/ToastNotification.vue'

const router = useRouter()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

onMounted(async () => {
  try {
    await userStore.fetchUser() // here we call fetch user
    if (!user.value) {
      // redirect them to logout if the user is not there
      router.push({ path: '/auth' });
    } else {
      // continue to dashboard
      router.push({ path: '/' });
    }
  } catch (e) {
    console.log(e)
  }
})
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
}

.app-main {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* Futuristic background elements */
.app-main::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(135deg, rgba(138, 43, 226, 0.05) 0%, transparent 50%),
    linear-gradient(225deg, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
    linear-gradient(315deg, rgba(255, 56, 96, 0.05) 0%, transparent 50%);
  z-index: -1;
  pointer-events: none;
}

/* Ensure all form elements have visible text */
input, textarea, select {
  color: var(--color-text-primary);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-light-gray);
}

/* Subtle grid pattern for futuristic look */
.app-main::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  z-index: -1;
  pointer-events: none;
}
</style>
