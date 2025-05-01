<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="app-title">Momentum Pro</h1>
      
      <div v-if="errorMsg" class="error-message">
        {{ errorMsg }}
      </div>
      
      <div v-if="successMsg" class="success-message">
        {{ successMsg }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            placeholder="Enter your email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required
            placeholder="Enter your password"
          />
        </div>
        
        <div v-if="!isLogin" class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            required
            placeholder="Confirm your password"
          />
        </div>
        
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Processing...' : (isLogin ? 'Login to Account' : 'Create Account') }}
        </button>
      </form>
      
      <div class="toggle-auth">
        <p>
          {{ isLogin ? "Need an account?" : "Already have an account?" }}
          <a href="#" @click.prevent="toggleAuth">
            {{ isLogin ? 'Create one now' : 'Login here' }}
          </a>
        </p>
      </div>
      
      <!-- Development Mode Only - Remove in Production -->
      <div class="dev-login">
        <button @click.prevent="devLogin" class="dev-login-btn">
          Development Login (Skip Email Verification)
        </button>
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
const confirmPassword = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const loading = ref(false);

const toggleAuth = () => {
  isLogin.value = !isLogin.value;
  errorMsg.value = '';
  successMsg.value = '';
};

// Development only function to bypass authentication completely
const devLogin = () => {
  console.log('Dev login button clicked');
  
  try {
    // Create a mock user object
    const mockUser = {
      id: 'dev-user-123',
      email: 'dev@example.com',
      user_metadata: {
        name: 'Development User'
      }
    };
    
    console.log('Created mock user:', mockUser);
    
    // Set the user in the store
    userStore.user = mockUser;
    console.log('User store updated:', userStore.user);
    
    // Store in localStorage to persist across page refreshes
    localStorage.setItem('dev_mode_user', JSON.stringify(mockUser));
    console.log('Saved to localStorage');
    
    // Force a small delay before redirecting
    setTimeout(() => {
      console.log('Redirecting to dashboard...');
      router.push('/');
    }, 100);
  } catch (error) {
    console.error('Error in dev login:', error);
  }
};

const handleSubmit = async () => {
  errorMsg.value = '';
  successMsg.value = '';
  loading.value = true;
  
  try {
    if (!isLogin.value) {
      // Sign up
      if (password.value !== confirmPassword.value) {
        errorMsg.value = 'Passwords do not match';
        loading.value = false;
        return;
      }
      
      console.log('Starting sign up process...');
      
      // Sign up
      const result = await userStore.signUp(email.value, password.value);
      console.log('Auth result:', result);
      
      // Check if email confirmation is required
      if (result.user && !result.session) {
        // Show success message with detailed instructions
        successMsg.value = `Registration successful! Please check your email (${email.value}) to confirm your account. If you don't see the email, check your spam folder.`;
        
        // Clear form
        email.value = '';
        password.value = '';
        confirmPassword.value = '';
      } else if (result.session) {
        // If we got a session, the user is already confirmed
        console.log('User is already confirmed, logging in directly');
        userStore.user = result.user;
        router.push('/');
      }
      
    } else {
      // Sign in
      console.log('Starting sign in process...');
      await userStore.signIn(email.value, password.value);
      router.push('/');
    }
  } catch (error) {
    console.error('Auth error:', error);
    errorMsg.value = error.message || 'An error occurred during authentication';
  } finally {
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
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.app-title {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #4a6cf7;
  font-size: 2rem;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  color: #333; /* Adding text color to make input text visible */
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #3a5ce5;
}

.submit-btn:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.toggle-auth {
  margin-top: 1rem;
  text-align: center;
}

.toggle-auth a {
  color: #4a6cf7;
  text-decoration: none;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

/* Development mode styles */
.dev-login {
  margin-top: 1.5rem;
  border-top: 1px dashed #ccc;
  padding-top: 1rem;
}

.dev-login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dev-login-btn:hover {
  background-color: #f57c00;
}
</style>