import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../pages/Dashboard.vue';
import Auth from '../pages/Auth.vue';
import AuthCallback from '../pages/AuthCallback.vue';
import ProfilePage from '../pages/ProfilePage.vue';
import KanbanPage from '../pages/KanbanPage.vue';
import VerificationPage from '../pages/VerificationPage.vue';
import { supabase } from '../supabase';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/kanban',
    name: 'Kanban',
    component: KanbanPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth,
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback,
    meta: { requiresAuth: false }
  },
  {
    path: '/verify',
    name: 'Verification',
    component: VerificationPage,
    meta: { requiresAuth: false }
  },
  // Catch-all route for the auth callback to handle any variations
  {
    path: '/:catchAll(.*)',
    redirect: to => {
      console.log('Catch-all route triggered for:', to.path);
      // If it looks like an auth callback, redirect to our callback handler
      if (to.path.includes('/callback') || to.fullPath.includes('code=')) {
        return { path: '/auth/callback', query: to.query, hash: to.hash };
      }
      // Otherwise redirect to the auth page
      return { path: '/auth' };
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Check if the route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  // Check for development mode user first
  const devModeUser = localStorage.getItem('dev_mode_user');
  
  if (devModeUser) {
    console.log('Development mode user found in router guard');
    // In development mode, allow access to all routes
    if (to.path === '/auth') {
      // If trying to access auth page in dev mode, redirect to dashboard
      next('/');
    } else {
      next();
    }
    return;
  }
  
  // Get the current user from Supabase
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  
  if (requiresAuth && !user) {
    // If the route requires auth and the user is not logged in, redirect to auth page
    next('/auth');
  } else if (to.path === '/auth' && user) {
    // If the user is already logged in and tries to access the auth page, redirect to dashboard
    next('/');
  } else {
    // Otherwise proceed as normal
    next();
  }
});

export default router;