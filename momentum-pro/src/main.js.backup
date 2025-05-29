import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'
import router from './router'
import './style.css'
import App from './App.vue'
import { usePreferencesStore } from './store/preferences'

const pinia = createPinia()
pinia.use(piniaPersist)

const app = createApp(App)
app.use(pinia)
app.use(router)

// Initialize app
app.mount('#app')

// Initialize theme after app is mounted
const preferencesStore = usePreferencesStore()
preferencesStore.initTheme()
