<template>
  <div class="app-container">
    <!-- Background elements -->
    <div class="app-background">
      <img src="/Mometum Pro App Bakcground.jpg" alt="Background" class="bg-image" />
      <div class="bg-overlay"></div>
      <div class="bg-grid"></div>
    </div>
    
    <!-- App content -->
    <div class="app-content">
      <router-view /> <!-- your routes will load inside of these tags -->
      <ToastNotification />
    </div>
  </div>
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
    // Add a class to the body for additional styling
    document.body.classList.add('momentum-app-body');
    
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

/* App container - holds everything */
.app-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
}

/* Custom class for the app body with background image */
.momentum-app-body {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

/* App content - holds the router view and other components */
.app-content {
  position: relative;
  min-height: 100vh;
  width: 100%;
  z-index: 10; /* Ensure content is above background */
}

@media (max-width: 768px) {
  .app-content {
    padding: 0 0.5rem;
  }
}

@media (max-width: 576px) {
  .app-content {
    padding: 0 0.25rem;
  }
}

/* Background container */
.app-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* Behind all content */
  pointer-events: none; /* Don't interfere with clicks */
}

/* Background image layer */
.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 
    Adjust the opacity value below to make the image more or less visible:
    - Higher values (closer to 1) make the image more visible
    - Lower values (closer to 0) make the image more subtle
    - Try values between 0.05 and 0.3 for best results
  */
  opacity: 0.15;
  z-index: 2; /* Stacking order within background container */
}

/* Dark overlay layer */
.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    /* 
      Dark gradient overlay - adjust the opacity values (0.92 and 0.95) to control darkness:
      - Higher values (closer to 1) make the overlay darker
      - Lower values (closer to 0) make the overlay more transparent
      - Try values between 0.85 and 0.98 for best results
    */
    linear-gradient(135deg, rgba(18, 18, 18, 0.92) 0%, rgba(18, 18, 18, 0.95) 100%),
    
    /* Colored gradients for visual interest - these add subtle color accents */
    linear-gradient(135deg, rgba(138, 43, 226, 0.05) 0%, transparent 50%),
    linear-gradient(225deg, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
    linear-gradient(315deg, rgba(255, 56, 96, 0.05) 0%, transparent 50%);
  z-index: 3; /* Above the image */
}

/* Grid pattern layer */
.bg-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  z-index: 4; /* Above the overlay */
}

/* Ensure all form elements have visible text */
input, textarea, select {
  color: var(--color-text-primary);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-light-gray);
}
</style>
