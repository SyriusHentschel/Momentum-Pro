<template>
  <div class="verification-page">
    <h1>Momentum Pro Build Verification (Vue Component)</h1>
    
    <div class="info-box">
      <p><strong>Build Date:</strong> <span class="timestamp">{{ buildDate }}</span></p>
      <p><strong>Build ID:</strong> {{ buildId }}</p>
      <p><strong>Environment:</strong> {{ environment }}</p>
      <p><strong>Target Site:</strong> {{ targetSite }}</p>
    </div>
    
    <h2>Environment Variables</h2>
    <div class="info-box">
      <p><strong>Supabase URL:</strong> {{ supabaseUrl }}</p>
      <p><strong>Auth Redirect URL:</strong> {{ authRedirectUrl }}</p>
      <p><strong>Supabase Key:</strong> {{ supabaseKeyStatus }}</p>
    </div>
    
    <h2>Next Steps</h2>
    <p>After confirming this page is visible:</p>
    <ol>
      <li>Check that authentication is working properly</li>
      <li>Verify that Supabase connections are successful</li>
      <li>Test the application functionality</li>
    </ol>
    
    <p><em>This file was created specifically to verify that Netlify is properly deploying updated files.</em></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { SUPABASE_CONFIG, APP_CONFIG } from '../config';

const buildDate = ref(new Date().toLocaleString());
const buildId = ref(APP_CONFIG.buildId);
const environment = ref(APP_CONFIG.isProduction ? 'Production' : 'Development');
const targetSite = ref('momentum-testt.netlify.app');

const supabaseUrl = ref(SUPABASE_CONFIG.url);
const authRedirectUrl = ref(SUPABASE_CONFIG.redirectUrl);
const supabaseKeyStatus = ref(SUPABASE_CONFIG.anonKey ? 'Key is defined' : 'Key is undefined');
</script>

<style scoped>
.verification-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

h1 {
  color: #4a6cf7;
  border-bottom: 2px solid #4a6cf7;
  padding-bottom: 10px;
}

.info-box {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

.timestamp {
  font-weight: bold;
  color: #2e7d32;
}
</style>