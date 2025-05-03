<template>
  <div class="image-test">
    <h2>Image Test Component</h2>
    <div class="image-container">
      <h3>Method 1: Direct img tag</h3>
      <img src="../assets/images/Mometum Pro App Bakcground.jpg" alt="Background Test" />
    </div>
    
    <div class="image-container">
      <h3>Method 2: Using import</h3>
      <img :src="importedImage" alt="Background Test" />
    </div>
    
    <div class="image-container">
      <h3>Method 3: Background image in CSS</h3>
      <div class="bg-test"></div>
    </div>
    
    <div class="image-container">
      <h3>Method 4: Dynamic background</h3>
      <div class="dynamic-bg" :style="{ backgroundImage: bgImageUrl }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Method 2: Import the image
import importedImage from '../assets/images/Mometum Pro App Bakcground.jpg';

// Method 4: Dynamic background
const bgImageUrl = `url(${new URL('../assets/images/Mometum Pro App Bakcground.jpg', import.meta.url).href})`;
</script>

<style scoped>
.image-test {
  padding: 20px;
  background-color: #333;
  color: white;
  border-radius: 8px;
  margin: 20px;
}

.image-container {
  margin-bottom: 30px;
  border: 1px solid #555;
  padding: 15px;
  border-radius: 4px;
}

h2 {
  margin-bottom: 20px;
}

h3 {
  margin-bottom: 10px;
  color: #ddd;
}

img {
  max-width: 100%;
  height: auto;
  border: 2px solid #666;
}

.bg-test {
  width: 100%;
  height: 200px;
  background-image: url('../assets/images/Mometum Pro App Bakcground.jpg');
  background-size: cover;
  background-position: center;
  border: 2px solid #666;
}

.dynamic-bg {
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
  border: 2px solid #666;
}
</style>