<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="w-full bg-red-500 text-white shadow-md flex items-center justify-center gap-4">
      <img src="@/assets/logo.png" alt="Mascotte Gym JP" class="w-20 h-auto" />
      <!-- <h1 class="text-3xl font-extrabold tracking-wide">Programme d'entraînement</h1> -->
    </header>

    <div class="flex justify-center gap-4 items-center mt-4 px-4">
      <Button @click="goToPreviousWeek">← Semaine précédente</Button>
      <span class="font-semibold text-lg">{{ formatWeekRange(currentWeekStart) }}</span>
      <Button @click="goToNextWeek">Semaine suivante →</Button>
    </div>

    <!-- Sélecteur de jours -->
    <div class="flex flex-wrap justify-center gap-2 mt-6 px-4">
      <div v-for="date in weekDates" :key="date.key" @click="trainingStore.setSelectedDate(date.fullDate)"
        class="cursor-pointer px-4 py-2 rounded-full border transition-all duration-200 text-sm sm:text-base" :class="trainingStore.selectedDate === date.fullDate
          ? 'bg-red-700 text-white border-red-700 shadow-md'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'">
        {{ date.label }}
      </div>
    </div>

    <!-- Affiche le bouton SEULEMENT si aucun exercice n'est prévu pour la journée -->
    <div v-if="!hasExercisesToday" class="flex justify-center mt-4">
      <Button variant="secondary" class="cursor-pointer" @click="copyPreviousWeekDay" :disabled="isCopying">
        Copier la journée de la semaine passée
      </Button>
    </div>

    <!-- Liste des exercices -->
    <div class="w-full max-w-4xl mx-auto px-4 mt-6 space-y-4">
      <ExerciseCard
        v-for="log in trainingStore.setlogs.filter(l => l.workout_id === `wk-${trainingStore.selectedDate}`)"
        :key="log.id" :exercise="trainingStore.allExercises.find(e => e.id === log.exercise_id)" :reps="log.reps"
        :weight="log.weight" :sets="log.sets" :completed="log.completed" :log-id="log.id" />
    </div>

    <!-- Bouton Ajouter -->
    <div class="flex justify-center mt-10 mb-10 px-4">
      <Button class="cursor-pointer" @click="showModal = true">
        + Ajouter un exercice
      </Button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div
        class="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl border border-red-700 transform transition-all duration-300 scale-95 opacity-0"
        :class="{ 'scale-100 opacity-100': showModal }">
        <h2 class="text-2xl font-bold mb-4 text-red-700">Nouvel exercice</h2>

        <!-- Sélection d'exercice avec chevron custom bien centré -->
        <div class="mb-4">
          <label class="block mb-2 text-sm text-gray-700">Choisir un exercice :</label>

          <div class="relative">
            <select v-model="selectedExerciseId"
              class="w-full appearance-none px-3 py-2 pr-10 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400 transition">
              <option disabled value="">-- Choisir un exercice --</option>
              <option v-for="ex in sortedExercises" :key="ex.id" :value="ex.id">
                {{ ex.name }}
              </option>
            </select>

            <!-- Chevron placé correctement -->
            <div class="pointer-events-none absolute right-3 top-0 bottom-0 flex items-center">
              <svg class="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Reps & Sets -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Reps</label>
            <input v-model.number="selectedReps" type="number" min="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400 transition" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">Sets</label>
            <input v-model.number="selectedSets" type="number" min="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400 transition" />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2">
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
import {
  startOfWeek,
  addDays,
  subWeeks,
  addWeeks,
  format,
  parseISO
} from 'date-fns'
import { fr } from 'date-fns/locale'

import ExerciseCard from './components/ExerciseCard.vue'
import Button from './components/Button.vue'

const trainingStore = useTrainingStore()

const sortedExercises = computed(() => {
  return [...trainingStore.allExercises].sort((a, b) =>
    a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
  )
})

const showModal = ref(false)
const selectedExerciseId = ref('')
const selectedReps = ref(10)
const selectedSets = ref(3)
const hasExercisesToday = computed(() => {
  return trainingStore.setlogs.some(log => log.workout_id === `wk-${trainingStore.selectedDate}`)
})
const isCopying = ref(false)

// ✅ Nouvelle semaine dynamique
const currentWeekStart = ref(startOfWeek(new Date(), { weekStartsOn: 0 }))

const goToPreviousWeek = () => {
  currentWeekStart.value = subWeeks(currentWeekStart.value, 1)
}
const goToNextWeek = () => {
  currentWeekStart.value = addWeeks(currentWeekStart.value, 1)
}

// ✅ Labels de la semaine sélectionnée
const formatWeekRange = (start) => {
  const end = addDays(start, 6)
  return `${format(start, 'dd MMM', { locale: fr })} – ${format(end, 'dd MMM', { locale: fr })}`
}

// ✅ Calcul des 7 jours de la semaine
const weekDates = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart.value, i)
    return {
      key: i,
      fullDate: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE dd', { locale: fr })
    }
  })
})

// ✅ Copier la journée précédente (même jour, semaine précédente)
const copyPreviousWeekDay = () => {
  if (isCopying.value) return

  isCopying.value = true
  trainingStore.copyPreviousWeekDayLog(trainingStore.selectedDate)

  setTimeout(() => {
    isCopying.value = false
  }, 500) // délai léger pour éviter double clic (ajustable)
}

// ✅ Ajouter un exercice planifié
const saveExercise = () => {
  if (!selectedExerciseId.value) return

  trainingStore.addSetLog({
    exercise_id: selectedExerciseId.value,
    reps: selectedReps.value,
    sets: selectedSets.value,
    weight: 0,
    workout_date: trainingStore.selectedDate
  })

  selectedExerciseId.value = ''
  selectedReps.value = 10
  selectedSets.value = 3
  showModal.value = false
}
</script>
