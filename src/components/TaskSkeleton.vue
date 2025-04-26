<template>
  <div class="task-skeleton">
    <div class="skeleton-header">
      <div class="skeleton-checkbox"></div>
      <div class="skeleton-title"></div>
      <div class="skeleton-badge"></div>
    </div>
    <div class="skeleton-footer">
      <div class="skeleton-date"></div>
      <div class="skeleton-actions"></div>
    </div>
  </div>
</template>

<script setup>
// No props or logic needed for this component
</script>

<style scoped>
.task-skeleton {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.skeleton-checkbox {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background-color: var(--neutral-200);
  flex-shrink: 0;
}

.skeleton-title {
  height: 20px;
  flex: 1;
  background-color: var(--neutral-200);
  border-radius: var(--radius-sm);
}

.skeleton-badge {
  width: 80px;
  height: 24px;
  background-color: var(--neutral-200);
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skeleton-date {
  width: 100px;
  height: 16px;
  background-color: var(--neutral-200);
  border-radius: var(--radius-sm);
}

.skeleton-actions {
  width: 70px;
  height: 24px;
  background-color: var(--neutral-200);
  border-radius: var(--radius-sm);
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

/* Dark mode styles */
:global(.dark-mode) .task-skeleton {
  background-color: var(--neutral-200);
}

:global(.dark-mode) .skeleton-checkbox,
:global(.dark-mode) .skeleton-title,
:global(.dark-mode) .skeleton-badge,
:global(.dark-mode) .skeleton-date,
:global(.dark-mode) .skeleton-actions {
  background-color: var(--neutral-300);
}
</style>