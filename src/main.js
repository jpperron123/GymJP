import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { useTrainingStore } from '@/stores/trainingStore'
import { useAuthStore } from '@/stores/authStore'
import '@/assets/base.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const trainingStore = useTrainingStore()
const authStore = useAuthStore()

Promise.all([authStore.restoreSession(), trainingStore.loadData()]).then(() => {
  app.mount('#app')
})
