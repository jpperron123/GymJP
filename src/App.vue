<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="w-full bg-red-500 text-white py-4 shadow-md flex items-center justify-center gap-4">
      <img src="@/assets/logo.png" alt="Mascotte Gym JP" class="w-20 h-auto" />
      <h1 class="text-3xl font-extrabold tracking-wide">Programme d'entraînement</h1>
    </header>

    <!-- Sélecteur de jours -->
    <div class="flex flex-wrap justify-center gap-2 mt-6 px-4">
      <div v-for="date in weekDates" :key="date.key" @click="trainingStore.setSelectedDate(date.fullDate)"
        class="cursor-pointer px-4 py-2 rounded-full border transition-all duration-200 text-sm sm:text-base" :class="trainingStore.selectedDate === date.fullDate
          ? 'bg-red-700 text-white border-red-700 shadow-md'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'">
        {{ date.label }}
      </div>
    </div>

    <!-- Liste des exercices -->
    <div class="max-w-4xl mx-auto space-y-4 px-4 mt-6">
      <ExerciseCard
        v-for="log in trainingStore.setlogs.filter(l => l.workout_id === `wk-${trainingStore.selectedDate}`)"
        :key="log.id" :exercise="trainingStore.allExercises.find(e => e.id === log.exercise_id)" :reps="log.reps"
        :weight="log.weight" />
    </div>

    <!-- Bouton Ajouter -->
    <div class="flex justify-center mt-10 mb-10 px-4">
      <Button class="cursor-pointer" @click="showModal = true">
        + Ajouter un exercice
      </Button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div class="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl border border-red-700">
        <h2 class="text-2xl font-bold mb-4 text-red-700">Nouvel exercice</h2>

        <label class="block mb-2 text-sm text-gray-700">Choisir un exercice :</label>
        <select v-model="selectedExerciseId" class="w-full p-2 border border-gray-300 rounded mb-4">
          <option disabled value="">-- Choisir un exercice --</option>
          <option v-for="ex in trainingStore.allExercises" :key="ex.id" :value="ex.id">
            {{ ex.name }}
          </option>
        </select>

        <div class="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" class="cursor-pointer" @click="showModal = false">
            Annuler
          </Button>
          <Button variant="success" class="cursor-pointer" @click="saveExercise" :disabled="!selectedExerciseId">
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>

    <footer class="w-full bg-gray-100 border-t py-4 text-center text-sm text-gray-600 mt-auto">
      © 2025 – Créé par
      <a href="https://github.com/Verdungo" target="_blank" rel="noopener"
        class="text-red-600 hover:underline font-medium">
        @Verdungo
      </a>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTrainingStore } from '@/stores/trainingStore'
import { format, startOfWeek, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'

import ExerciseCard from './components/ExerciseCard.vue'
import Button from './components/Button.vue'

const trainingStore = useTrainingStore()
const showModal = ref(false)
const selectedExerciseId = ref('') // <- nouvelle ref

const weekDates = computed(() => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i)
    return {
      key: i,
      fullDate: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE dd', { locale: fr })
    }
  })
})

const saveExercise = () => {
  if (!selectedExerciseId.value) return

  trainingStore.addSetLog({
    exercise_id: selectedExerciseId.value,
    reps: 10,
    weight: 0,
    workout_date: trainingStore.selectedDate
  })

  selectedExerciseId.value = ''
  showModal.value = false
}
</script>
