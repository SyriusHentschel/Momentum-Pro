// Script to completely clean up service workers and caches
(async function cleanupServiceWorkersAndCaches() {
  console.log('Starting service worker and cache cleanup...');
  
  // 1. Unregister all service workers
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length === 0) {
        console.log('No service workers registered');
      } else {
        console.log(`Found ${registrations.length} service worker(s) to unregister`);
        
        for (let registration of registrations) {
          console.log('Unregistering service worker with scope:', registration.scope);
          const success = await registration.unregister();
          console.log('Service worker unregistered:', success);
        }
      }
    } catch (error) {
      console.error('Error unregistering service workers:', error);
    }
  }
  
  // 2. Clear all caches
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      console.log(`Found ${cacheNames.length} cache(s) to delete`);
      
      for (let cacheName of cacheNames) {
        console.log('Deleting cache:', cacheName);
        await caches.delete(cacheName);
        console.log('Cache deleted:', cacheName);
      }
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }
  
  // 3. Clear localStorage and sessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Local and session storage cleared');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
  
  console.log('Service worker and cache cleanup completed');
  console.log('Please close all browser tabs and reopen the application');
  
  // Reload button removed
})();