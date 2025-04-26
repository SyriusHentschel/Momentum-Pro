<template>
  <transition name="fade">
    <div v-if="show" class="welcome-container">
      <div class="welcome-content">
        <div class="welcome-header">
          <h1>Welcome to Momentum</h1>
          <button @click="close" class="close-button" aria-label="Close welcome message">×</button>
        </div>
        
        <div class="welcome-body">
          <p>Your personal task management app is ready to help you stay organized and productive.</p>
          
          <div class="features">
            <div class="feature">
              <div class="feature-icon">✓</div>
              <div class="feature-text">
                <h3>Create Tasks</h3>
                <p>Add tasks with different priority levels to organize your work.</p>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">↕</div>
              <div class="feature-text">
                <h3>Drag & Drop</h3>
                <p>Reorder your tasks by dragging them to arrange by importance.</p>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">🔍</div>
              <div class="feature-text">
                <h3>Filter & Sort</h3>
                <p>Easily find what you need with powerful filtering and sorting options.</p>
              </div>
            </div>
          </div>
          
          <div class="welcome-actions">
            <button @click="close" class="primary-button">Get Started</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const show = ref(false);
const props = defineProps({
  autoShow: {
    type: Boolean,
    default: true
  },
  delay: {
    type: Number,
    default: 500
  }
});

const close = () => {
  show.value = false;
  localStorage.setItem('momentum-welcome-shown', 'true');
};

onMounted(() => {
  // Only show welcome message if it hasn't been shown before
  const hasShown = localStorage.getItem('momentum-welcome-shown');
  
  if (!hasShown && props.autoShow) {
    setTimeout(() => {
      show.value = true;
    }, props.delay);
  }
});

// Expose methods to parent components
defineExpose({
  open: () => { show.value = true; },
  close
});
</script>

<style scoped>
.welcome-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-md);
}

.welcome-content {
  background-color: white;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  animation: slideInUp var(--transition-normal);
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--neutral-200);
}

.welcome-header h1 {
  font-size: var(--font-size-2xl);
  color: var(--primary);
  margin: 0;
  font-weight: var(--font-weight-bold);
}

.close-button {
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  color: var(--neutral-500);
  cursor: pointer;
  transition: color var(--transition-fast);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-button:hover {
  color: var(--neutral-800);
  background-color: var(--neutral-100);
}

.welcome-body {
  padding: var(--spacing-lg);
}

.welcome-body > p {
  font-size: var(--font-size-lg);
  color: var(--neutral-700);
  margin-bottom: var(--spacing-lg);
  line-height: var(--line-height-relaxed);
}

.features {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
}

.feature {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.feature-icon {
  background-color: var(--primary-bg);
  color: var(--primary);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.feature-text h3 {
  font-size: var(--font-size-lg);
  color: var(--neutral-800);
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-semibold);
}

.feature-text p {
  color: var(--neutral-600);
  line-height: var(--line-height-relaxed);
}

.welcome-actions {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
}

.primary-button {
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.primary-button:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.primary-button:active {
  transform: translateY(0);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive styles */
@media (max-width: 640px) {
  .welcome-content {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .welcome-header {
    padding: var(--spacing-md);
  }
  
  .welcome-body {
    padding: var(--spacing-md);
  }
  
  .welcome-header h1 {
    font-size: var(--font-size-xl);
  }
  
  .features {
    gap: var(--spacing-md);
  }
}
</style>