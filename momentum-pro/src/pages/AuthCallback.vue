<template>
  <div class="auth-callback">
    <div v-if="loading" class="loading-state">
      <h2>Processing your authentication...</h2>
      <p>Please wait while we complete the sign-in process.</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <h2>Authentication Error</h2>
      <p>{{ errorMessage }}</p>
      <button @click="goToAuth" class="auth-btn">Return to Login</button>
    </div>
    
    <div v-else class="success-state">
      <h2>Authentication Successful!</h2>
      <p>You will be redirected to the dashboard momentarily...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');

const goToAuth = () => {
  router.push('/auth');
};

onMounted(async () => {
  try {
    console.log('Auth callback mounted, processing authentication...');
    
    // Get the current URL and all parameters
    const url = window.location.href;
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    console.log('Current URL:', url);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    console.log('Hash params:', Object.fromEntries(hashParams.entries()));
    
    // Check for error in the URL
    if (url.includes('error=') || searchParams.has('error') || hashParams.has('error')) {
      const errorCode = searchParams.get('error') || hashParams.get('error');
      const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
      
      console.error('Auth error in URL:', errorCode, errorDescription);
      error.value = true;
      errorMessage.value = errorDescription || 'An error occurred during authentication.';
      loading.value = false;
      return;
    }
    
    // Try to exchange the code for a session if it exists in the URL
    if (searchParams.has('code') || hashParams.has('code')) {
      console.log('Code found in URL, exchanging for session...');
    }
    
    // Handle the callback from Supabase
    console.log('Getting session from Supabase...');
    const { data, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      error.value = true;
      errorMessage.value = sessionError.message || 'Failed to authenticate.';
      loading.value = false;
      return;
    }
    
    console.log('Session response:', data);
    
    if (data?.session) {
      console.log('Session found:', data.session);
      
      // Update the user store
      userStore.user = data.session.user;
      console.log('User store updated with:', data.session.user);
      
      // Success state
      loading.value = false;
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      console.log('No session found in callback');
      
      // Try to set up auth state change listener
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        if (session) {
          userStore.user = session.user;
          loading.value = false;
          setTimeout(() => {
            router.push('/');
          }, 1500);
        }
      });
      
      // Wait a bit longer before showing error
      setTimeout(() => {
        if (loading.value) {
          error.value = true;
          errorMessage.value = 'No authentication session found. Please try logging in again.';
          loading.value = false;
        }
      }, 5000);
    }
  } catch (err) {
    console.error('Unexpected error in auth callback:', err);
    error.value = true;
    errorMessage.value = err.message || 'An unexpected error occurred.';
    loading.value = false;
  }
});
</script>

<style scoped>
.auth-callback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 0 20px;
  background-color: #f5f5f5;
}

.loading-state, .error-state, .success-state {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

h2 {
  color: #333;
  margin-top: 0;
}

.error-state h2 {
  color: #d32f2f;
}

.success-state h2 {
  color: #2e7d32;
}

p {
  margin-bottom: 1.5rem;
  color: #555;
}

.auth-btn {
  padding: 0.75rem 1.5rem;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.auth-btn:hover {
  background-color: #3a5ce5;
}
</style>