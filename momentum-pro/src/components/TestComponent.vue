<template>
  <div class="test-component">
    <h1>Test Component</h1>
    <p>This is a test component to verify that Vue files are being processed correctly.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const message = ref('Hello from TestComponent!');
</script>

<style scoped>
.test-component {
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin: 20px 0;
}
</style>