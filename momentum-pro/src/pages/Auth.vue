<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="app-title">Momentum Pro</h1>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">
            <span class="label-icon">✉️</span>
            Email
          </label>
          <div class="input-wrapper">
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              required
              placeholder="Enter your email"
            />
            <span class="input-focus-effect"></span>
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">
            <span class="label-icon">🔒</span>
            Password
          </label>
          <div class="input-wrapper">
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              required
              placeholder="Enter your password"
            />
            <span class="input-focus-effect"></span>
          </div>
        </div>
        
        <div v-if="!isLogin" class="form-group">
          <label for="confirmPassword">
            <span class="label-icon">🔐</span>
            Confirm Password
          </label>
          <div class="input-wrapper">
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              required
              placeholder="Confirm your password"
            />
            <span class="input-focus-effect"></span>
          </div>
        </div>
        
        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="loading-text">
            <span class="dot-animation">Processing</span>
          </span>
          <span v-else class="btn-text">
            {{ isLogin ? 'Login to Account' : 'Create Account' }}
          </span>
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
import { useToastStore } from '../store/toast';

const router = useRouter();
const userStore = useUserStore();
const toastStore = useToastStore();

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

const toggleAuth = () => {
  isLogin.value = !isLogin.value;
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
    
    // Show toast notification
    toastStore.info('Logged in with development mode');
    
    // Force a small delay before redirecting
    setTimeout(() => {
      console.log('Redirecting to dashboard...');
      router.push('/');
    }, 100);
  } catch (error) {
    console.error('Error in dev login:', error);
    toastStore.error('Development login failed');
  }
};

const handleSubmit = async () => {
  loading.value = true;
  
  try {
    if (!isLogin.value) {
      // Sign up
      if (password.value !== confirmPassword.value) {
        toastStore.error('Passwords do not match');
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
        toastStore.success(`Registration successful! Please check your email (${email.value}) to confirm your account.`);
        
        // Clear form
        email.value = '';
        password.value = '';
        confirmPassword.value = '';
      } else if (result.session) {
        // If we got a session, the user is already confirmed
        console.log('User is already confirmed, logging in directly');
        userStore.user = result.user;
        toastStore.success('Logged in successfully!');
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
    toastStore.error(error.message || 'An error occurred during authentication');
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
  position: relative;
  overflow: hidden;
  z-index: 10; /* Ensure it's above the background but doesn't create its own stacking context */
}

@keyframes slowRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  box-shadow: var(--shadow-lg), 0 0 30px rgba(138, 43, 226, 0.2);
  border: 1px solid var(--color-light-gray);
  position: relative;
  z-index: 1;
  overflow: hidden;
  animation: fadeIn 0.5s ease-out;
}

@media (max-width: 576px) {
  .auth-card {
    max-width: 100%;
    padding: 1.5rem;
    margin: 1rem;
    border-radius: 6px;
  }
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, 
    var(--color-purple) 0%, 
    var(--color-gold) 50%, 
    var(--color-red) 100%);
  z-index: 2;
}

.auth-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(138, 43, 226, 0.05) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
}

.app-title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(90deg, var(--color-purple), var(--color-gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(138, 43, 226, 0.3);
  position: relative;
}

@media (max-width: 768px) {
  .app-title {
    font-size: 2.2rem;
  }
}

@media (max-width: 576px) {
  .app-title {
    font-size: 1.8rem;
  }
}

.app-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-purple), var(--color-gold));
  margin: 0.5rem auto 0;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(138, 43, 226, 0.5);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

@media (max-width: 576px) {
  .form-group {
    margin-bottom: 1.2rem;
  }
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  transition: all 0.3s;
}

input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-light-gray);
  border-radius: 4px;
  font-size: 1rem;
  color: var(--color-text-primary);
  background-color: var(--color-bg-tertiary);
  transition: all 0.3s;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

input:focus {
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2), inset 0 1px 3px rgba(0, 0, 0, 0.1);
  outline: none;
}

.submit-btn {
  width: 100%;
  padding: 0.85rem;
  background-color: var(--color-accent-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(138, 43, 226, 0.3);
  position: relative;
  overflow: hidden;
}

@media (max-width: 576px) {
  .submit-btn {
    padding: 0.75rem;
    font-size: 0.95rem;
  }
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: all 0.5s;
}

.submit-btn:hover {
  background-color: var(--color-purple-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(138, 43, 226, 0.4);
}

.submit-btn:hover::before {
  left: 100%;
}

.submit-btn:disabled {
  background-color: var(--color-light-gray);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.toggle-auth {
  margin-top: 1.5rem;
  text-align: center;
}

.toggle-auth p {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.toggle-auth a {
  color: var(--color-accent-primary);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.toggle-auth a:hover {
  color: var(--color-accent-secondary);
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

/* Development mode styles */
.dev-login {
  margin-top: 2rem;
  border-top: 1px solid var(--color-light-gray);
  padding-top: 1.5rem;
  position: relative;
}

.dev-login::before {
  content: 'DEV MODE';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-bg-secondary);
  padding: 0 10px;
  font-size: 0.7rem;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

.dev-login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-gold);
  color: var(--color-black);
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(255, 215, 0, 0.3);
}

@media (max-width: 576px) {
  .dev-login-btn {
    padding: 0.65rem;
    font-size: 0.85rem;
  }
  
  .dev-login {
    margin-top: 1.5rem;
    padding-top: 1.2rem;
  }
}

.dev-login-btn:hover {
  background-color: var(--color-gold-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 215, 0, 0.4);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Enhanced input styling */
.input-wrapper {
  position: relative;
  width: 100%;
}

.input-focus-effect {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-purple), var(--color-gold));
  transition: width 0.3s ease;
}

input:focus + .input-focus-effect {
  width: 100%;
}

/* Label icon styling */
.label-icon {
  display: inline-block;
  margin-right: 5px;
  font-size: 0.9rem;
}

/* Loading animation */
.loading-text {
  display: inline-block;
}

.dot-animation::after {
  content: '...';
  display: inline-block;
  width: 1em;
  text-align: left;
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

/* Button text animation */
.btn-text {
  position: relative;
  z-index: 1;
}

/* Hover effects for buttons */
.submit-btn:active,
.dev-login-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
</style>