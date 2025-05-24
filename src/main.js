import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { useTrainingStore } from '@/stores/trainingStore'
import '@/assets/base.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const trainingStore = useTrainingStore()

// ⏳ On attend que les données soient chargées
trainingStore.loadData().then(() => {
  app.mount('#app')
})
