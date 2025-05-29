<template>
  <div class="test-page">
    <h1>Test Page</h1>
    <p>If you can see this page, Vue is working correctly.</p>
    <button @click="showToast">Show Toast</button>
  </div>
</template>

<script setup>
import { useToastStore } from '../store/toast';

const toastStore = useToastStore();

function showToast() {
  toastStore.success('This is a test toast message!');
}
</script>

<style scoped>
.test-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: var(--color-accent-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>