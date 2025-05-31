<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id" 
        class="toast" 
        :class="[`toast-${toast.type}`]"
        @click="toastStore.removeToast(toast.id)"
      >
        <div class="toast-content">
          <span class="toast-icon">
            <span v-if="toast.type === 'success'">✅</span>
            <span v-else-if="toast.type === 'error'">❌</span>
            <span v-else-if="toast.type === 'warning'">⚠️</span>
            <span v-else>ℹ️</span>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button class="toast-close" @click.stop="toastStore.removeToast(toast.id)">
          &times;
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '../store/toast';

const toastStore = useToastStore();
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 380px;
}

.toast {
  padding: 14px 18px;
  border-radius: 4px;
  background-color: var(--color-bg-card);
  box-shadow: var(--shadow-md), 0 0 15px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: slideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-light-gray);
}

.toast:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg), 0 0 20px rgba(0, 0, 0, 0.4);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast-icon {
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
}

.toast-message {
  font-size: 0.95rem;
  color: var(--color-text-primary);
  letter-spacing: 0.3px;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  opacity: 0.7;
  transition: all 0.2s;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.toast-close:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Toast types with futuristic styling */
.toast-success {
  border-left: 3px solid var(--color-green);
  box-shadow: var(--shadow-md), 0 0 15px rgba(var(--color-green-rgb), 0.3);
}

.toast-success:hover {
  box-shadow: var(--shadow-lg), 0 0 20px rgba(var(--color-green-rgb), 0.4);
}

.toast-error {
  border-left: 3px solid var(--color-red);
  box-shadow: var(--shadow-md), 0 0 15px rgba(var(--color-red-rgb), 0.3);
}

.toast-error:hover {
  box-shadow: var(--shadow-lg), 0 0 20px rgba(var(--color-red-rgb), 0.4);
}

.toast-warning {
  border-left: 3px solid var(--color-gold);
  box-shadow: var(--shadow-md), 0 0 15px rgba(var(--color-gold-rgb), 0.3);
}

.toast-warning:hover {
  box-shadow: var(--shadow-lg), 0 0 20px rgba(var(--color-gold-rgb), 0.4);
}

.toast-info {
  border-left: 3px solid var(--color-purple);
  box-shadow: var(--shadow-md), 0 0 15px rgba(var(--color-purple-rgb), 0.3);
}

.toast-info:hover {
  box-shadow: var(--shadow-lg), 0 0 20px rgba(var(--color-purple-rgb), 0.4);
}

/* Futuristic animations */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
    filter: blur(5px);
  }
  to {
    transform: translateX(0);
    opacity: 1;
    filter: blur(0);
  }
}

.toast-enter-active {
  animation: slideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.toast-leave-active {
  animation: slideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards reverse;
}
</style>