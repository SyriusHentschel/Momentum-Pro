<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="app-branding">
        <h1 class="app-name">Momentum Pro</h1>
        <p class="app-tagline">Keep Moving Forward</p>
      </div>
      
      <h2 class="auth-title">{{ isLogin ? 'Sign In' : 'Create Account' }}</h2>
      
      <div v-if="errorMsg" class="error-message">
        {{ errorMsg }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            placeholder="your@email.com"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required
            placeholder="Your password"
            minlength="6"
          />
        </div>
        
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up') }}
        </button>
      </form>
      
      <div class="social-auth">
        <div class="divider">
          <span>OR</span>
        </div>
        <button @click="signInWithGitHub" class="github-btn" :disabled="loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>
      </div>
      
      <div class="toggle-form">
        <p>
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <a href="#" @click.prevent="toggleForm">
            {{ isLogin ? 'Sign Up' : 'Sign In' }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const loading = ref(false);

const toggleForm = () => {
  isLogin.value = !isLogin.value;
  errorMsg.value = '';
};

const handleSubmit = async () => {
  errorMsg.value = '';
  loading.value = true;
  
  try {
    if (isLogin.value) {
      await userStore.signIn(email.value, password.value);
    } else {
      await userStore.signUp(email.value, password.value);
      errorMsg.value = 'Registration successful! Please check your email for confirmation.';
      loading.value = false;
      return;
    }
    
    // If we get here, login was successful
    router.push('/');
  } catch (error) {
    if (error.message.includes('Email not confirmed')) {
      errorMsg.value = 'Email not confirmed. Please check your inbox for the confirmation link.';
    } else {
      errorMsg.value = error.message;
    }
  } finally {
    loading.value = false;
  }
};

const signInWithGitHub = async () => {
  errorMsg.value = '';
  loading.value = true;
  
  try {
    await userStore.signInWithGitHub();
    // The page will redirect to GitHub for authentication
  } catch (error) {
    errorMsg.value = error.message;
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.app-branding {
  text-align: center;
  margin-bottom: 30px;
}

.app-name {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #42b883 0%, #347474 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-tagline {
  color: #666;
  font-size: 16px;
  font-style: italic;
}

.auth-title {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
  font-size: 22px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #42b883;
  outline: none;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #3aa876;
}

.submit-btn:disabled {
  background-color: #a8d5c3;
  cursor: not-allowed;
}

.toggle-form {
  margin-top: 24px;
  text-align: center;
}

.toggle-form a {
  color: #42b883;
  text-decoration: none;
  font-weight: 600;
}

.toggle-form a:hover {
  text-decoration: underline;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.social-auth {
  margin-top: 24px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 16px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.divider span {
  padding: 0 10px;
  color: #777;
  font-size: 14px;
}

.github-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  background-color: #24292e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  gap: 10px;
}

.github-btn:hover {
  background-color: #1b1f23;
}

.github-btn:disabled {
  background-color: #6e7681;
  cursor: not-allowed;
}
</style>