import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import apiService from './services/api'
import { apiServiceKey } from './services/api.inject'

// import.meta.env.VITE_API_URL
const api = apiService('')

createApp(App).provide(apiServiceKey, api).use(router).mount('#app')
