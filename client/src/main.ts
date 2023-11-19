import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import apiService from './services/api'
import storeService from './services/store'
import { apiServiceKey, storeServiceKey } from './services/inject'

// import.meta.env.VITE_API_URL
const api = apiService('')
const store = storeService()

createApp(App)
  .provide(apiServiceKey, api)
  .provide(storeServiceKey, store)
  .use(router)
  .use(VueVirtualScroller)
  .mount('#app')
