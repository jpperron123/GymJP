import { ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export const useTrainingStore = defineStore('training', () => {
  const today = ref(
    new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  )

  const selectedDate = ref(
    new Date().toISOString().split('T')[0], // format YYYY-MM-DD
  )

  const setSelectedDate = (dateStr) => {
    selectedDate.value = dateStr
  }

  const defaultExercises = []

  const savedExercises = localStorage.getItem('exercises')
  const exercises = ref(savedExercises ? JSON.parse(savedExercises) : defaultExercises)

  const addExercise = (exercise) => {
    const newId = exercises.value.length ? Math.max(...exercises.value.map((e) => e.id)) + 1 : 1
    exercises.value.push({ id: newId, ...exercise })
  }

  const removeExercise = (id) => {
    exercises.value = exercises.value.filter((e) => e.id !== id)
  }

  const getWeekday = computed(() => {
    const date = parseISO(selectedDate.value)
    return format(date, 'eeee', { locale: fr }) // ex: "lundi"
  })

  const filteredExercises = computed(() => {
    return exercises.value.filter((e) => e.day === getWeekday.value.toLowerCase())
  })

  watch(
    exercises,
    (newValue) => {
      localStorage.setItem('exercises', JSON.stringify(newValue))
    },
    { deep: true },
  )

  const toggleCompleted = (id) => {
    const exercise = exercises.value.find((e) => e.id === id)
    if (exercise) {
      exercise.completed = !exercise.completed
    }
  }

  return {
    today,
    selectedDate,
    setSelectedDate,
    exercises,
    addExercise,
    removeExercise,
    filteredExercises,
    getWeekday,
    toggleCompleted,
  }
})
