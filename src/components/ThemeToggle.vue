<template>
  <button 
    class="theme-toggle" 
    @click="toggleTheme" 
    :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
    :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <span class="icon light-icon" v-if="isDarkMode">☀️</span>
    <span class="icon dark-icon" v-else>🌙</span>
  </button>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const isDarkMode = ref(false);

// Function to toggle between light and dark mode
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  updateTheme();
};

// Function to update the theme based on isDarkMode value
const updateTheme = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-mode');
    localStorage.setItem('momentum-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark-mode');
    localStorage.setItem('momentum-theme', 'light');
  }
};

// Initialize theme on component mount
onMounted(() => {
  // Check if user has a saved preference
  const savedTheme = localStorage.getItem('momentum-theme');
  
  if (savedTheme === 'dark') {
    isDarkMode.value = true;
  } else if (savedTheme === 'light') {
    isDarkMode.value = false;
  } else {
    // If no saved preference, check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDarkMode.value = prefersDark;
  }
  
  // Apply the theme
  updateTheme();
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    // Only update if user hasn't set a preference
    if (!localStorage.getItem('momentum-theme')) {
      isDarkMode.value = e.matches;
      updateTheme();
    }
  });
});
</script>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  background-color: var(--neutral-100);
}

.theme-toggle:hover {
  background-color: var(--neutral-200);
  transform: rotate(15deg);
}

.icon {
  font-size: 20px;
  transition: transform var(--transition-normal);
}

.light-icon {
  animation: spin-in 0.5s ease;
}

.dark-icon {
  animation: spin-in 0.5s ease;
}

@keyframes spin-in {
  from {
    transform: rotate(-180deg) scale(0);
    opacity: 0;
  }
  to {
    transform: rotate(0) scale(1);
    opacity: 1;
  }
}
</style>