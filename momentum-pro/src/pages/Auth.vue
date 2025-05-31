<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="app-title gradient-text purple-gold">Momentum Pro</h1>
      
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
      
      <!-- Social Login Options -->
      <div class="social-login">
        <div class="divider">
          <span>OR</span>
        </div>
        <button 
          @click.prevent="handleGoogleSignIn" 
          class="google-btn" 
          :disabled="googleLoading || githubLoading"
          aria-label="Sign in with Google"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            class="google-icon"
            v-if="!googleLoading"
          >
          <span v-if="googleLoading" class="loading-text">
            <span class="dot-animation">Connecting to Google</span>
          </span>
          <span v-else class="google-text">Continue with Google</span>
        </button>
        
        <button 
          @click.prevent="handleGithubSignIn" 
          class="github-btn" 
          :disabled="googleLoading || githubLoading"
          aria-label="Sign in with GitHub"
        >
          <img 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgMGMtNi42MjYgMC0xMiA1LjM3My0xMiAxMiAwIDUuMzAyIDMuNDM4IDkuOCA4LjIwNyAxMS4zODcuNTk5LjExMS43OTMtLjI2MS43OTMtLjU3N3YtMi4yMzRjLTMuMzM4LjcyNi00LjAzMy0xLjQxNi00LjAzMy0xLjQxNi0uNTQ2LTEuMzg3LTEuMzMzLTEuNzU2LTEuMzMzLTEuNzU2LTEuMDg5LS43NDUuMDgzLS43MjkuMDgzLS43MjkgMS4yMDUuMDg0IDEuODM5IDEuMjM3IDEuODM5IDEuMjM3IDEuMDcgMS44MzQgMi44MDcgMS4zMDQgMy40OTIuOTk3LjEwNy0uNzc1LjQxOC0xLjMwNS43NjItMS42MDQtMi42NjUtLjMwNS01LjQ2Ny0xLjMzNC01LjQ2Ny01LjkzMSAwLTEuMzExLjQ2OS0yLjM4MSAxLjIzNi0zLjIyMS0uMTI0LS4zMDMtLjUzNS0xLjUyNC4xMTctMy4xNzYgMCAwIDEuMDA4LS4zMjIgMy4zMDEgMS4yMy45NTctLjI2NiAxLjk4My0uMzk5IDMuMDAzLS40MDQgMS4wMi4wMDUgMi4wNDcuMTM4IDMuMDA2LjQwNCAyLjI5MS0xLjU1MiAzLjI5Ny0xLjIzIDMuMjk3LTEuMjMuNjUzIDEuNjUzLjI0MiAyLjg3NC4xMTggMy4xNzYuNzcuODQgMS4yMzUgMS45MTEgMS4yMzUgMy4yMjEgMCA0LjYwOS0yLjgwNyA1LjYyNC01LjQ3OSA1LjkyMS40My4zNzIuODIzIDEuMTAyLjgyMyAyLjIyMnYzLjI5M2MwIC4zMTkuMTkyLjY5NC44MDEuNTc2IDQuNzY1LTEuNTg5IDguMTk5LTYuMDg2IDguMTk5LTExLjM4NiAwLTYuNjI3LTUuMzczLTEyLTEyLTEyeiIvPjwvc3ZnPg==" 
            alt="GitHub" 
            class="github-icon"
            v-if="!githubLoading"
          >
          <span v-if="githubLoading" class="loading-text">
            <span class="dot-animation">Connecting to GitHub</span>
          </span>
          <span v-else class="github-text">Continue with GitHub</span>
        </button>
      </div>

      <div class="toggle-auth">
        <p>
          {{ isLogin ? "Need an account?" : "Already have an account?" }}
          <a href="#" @click.prevent="toggleAuth">
            {{ isLogin ? 'Create one now' : 'Login here' }}
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
import { useToastStore } from '../store/toast';

const router = useRouter();
const userStore = useUserStore();
const toastStore = useToastStore();

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const googleLoading = ref(false);
const githubLoading = ref(false);

const toggleAuth = () => {
  isLogin.value = !isLogin.value;
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

const handleGoogleSignIn = async () => {
  if (googleLoading.value) return; // Prevent multiple clicks
  
  googleLoading.value = true;
  
  try {
    console.log('Starting Google sign-in process...');
    const { data, error } = await userStore.signInWithGoogle();
    
    if (error) {
      throw error;
    }
    
    // Check if we have a URL to redirect to
    if (data && data.url) {
      console.log('Redirecting to Google URL:', data.url);
      toastStore.info('Redirecting to Google for authentication...');
      
      // Force redirect using window.location
      setTimeout(() => {
        window.location.href = data.url;
      }, 500);
    } else {
      console.error('No redirect URL returned from Google sign-in');
      toastStore.error('Failed to get Google authentication URL');
      googleLoading.value = false;
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    toastStore.error(error.message || 'An error occurred during Google authentication');
    googleLoading.value = false; // Reset loading state on error
  }
};

const handleGithubSignIn = async () => {
  if (githubLoading.value) return; // Prevent multiple clicks
  
  githubLoading.value = true;
  
  try {
    console.log('Starting GitHub sign-in process...');
    const { data, error } = await userStore.signInWithGithub();
    
    if (error) {
      throw error;
    }
    
    // Check if we have a URL to redirect to
    if (data && data.url) {
      console.log('Redirecting to GitHub URL:', data.url);
      toastStore.info('Redirecting to GitHub for authentication...');
      
      // Force redirect using window.location
      window.location.href = data.url;
    } else {
      console.error('No redirect URL returned from GitHub sign-in');
      toastStore.error('Failed to get GitHub authentication URL');
      githubLoading.value = false;
    }
  } catch (error) {
    console.error('GitHub sign-in error:', error);
    toastStore.error(error.message || 'An error occurred during GitHub authentication');
    githubLoading.value = false; // Reset loading state on error
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
  
  /* Use CSS variables for transitions to maintain consistency */
  --auth-transition-fast: 0.2s ease;
  --auth-transition-medium: 0.3s ease;
  --auth-transition-slow: 0.5s ease;
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
  position: relative;
  /* Filter for glow effect */
  filter: drop-shadow(0 0 6px rgba(var(--color-purple-rgb, 138, 43, 226), 0.3));
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
  transition: all var(--auth-transition-medium);
}

input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-light-gray);
  border-radius: 4px;
  font-size: 1rem;
  color: var(--color-text-primary);
  background-color: var(--color-bg-tertiary);
  transition: all var(--auth-transition-medium);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

input:focus {
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-accent-primary-rgb, 138, 43, 226), 0.2), inset 0 1px 3px rgba(0, 0, 0, 0.1);
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
  transition: all var(--auth-transition-medium);
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(var(--color-accent-primary-rgb, 138, 43, 226), 0.3);
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
  transition: all var(--auth-transition-slow);
}

.submit-btn:hover {
  background-color: var(--color-purple-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(var(--color-accent-primary-rgb, 138, 43, 226), 0.4);
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
  transition: all var(--auth-transition-medium);
}

.toggle-auth a:hover {
  color: var(--color-accent-secondary);
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}



/* Social login styles */
.social-login {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin-bottom: 1.2rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--color-light-gray);
}

.divider span {
  padding: 0 10px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 1px;
}

.google-btn, .github-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d0d0d0; /* Darker border for better definition */
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 600; /* Bolder text */
  cursor: pointer;
  transition: all var(--auth-transition-medium);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); /* Slightly stronger shadow */
}

.google-btn {
  background-color: #ffffff; /* Pure white background */
  color: #8a2be2; /* Deep purple color */
}

.github-btn {
  background-color: #24292e; /* GitHub dark color */
  color: white;
}

.google-btn:hover, .github-btn:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.google-btn:hover {
  background-color: #f8f8f8;
}

.github-btn:hover {
  background-color: #2f363d;
}

.google-btn:disabled, .github-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.google-icon, .github-icon {
  width: 18px;
  height: 18px;
  margin-right: 10px;
}

.github-icon {
  filter: brightness(0) invert(1);
  width: 24px;
  height: 24px;
}

.google-text, .github-text {
  font-weight: 600; /* Bold text */
  font-size: 1.05rem; /* Larger font */
  letter-spacing: 0.3px; /* Slightly increased letter spacing for better readability */
}

.google-text {
  color: #8a2be2; /* Deep purple color */
}

/* Loading animation */
.loading-text {
  display: inline-block;
}

.dot-animation::after {
  content: '...';
  display: inline-block;
  animation: dots 1.5s infinite;
  width: 24px;
  text-align: left;
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

/* Input focus effect */
.input-wrapper {
  position: relative;
}

.input-focus-effect {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-purple), var(--color-gold));
  transition: all 0.3s;
  transform: translateX(-50%);
}

.input-wrapper input:focus + .input-focus-effect {
  width: 100%;
}

/* Label icon */
.label-icon {
  display: inline-block;
  margin-right: 5px;
  font-size: 0.9rem;
}

/* Fade-in animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>