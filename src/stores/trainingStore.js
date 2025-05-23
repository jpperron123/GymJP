import { ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import exerciseList from '@/mock-data/exercise.json'
import workoutList from '@/mock-data/workout.json'
import setLogList from '@/mock-data/setlog.json'

export const useTrainingStore = defineStore('training', () => {
  const today = ref(
    new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  )

  const selectedDate = ref(new Date().toISOString().split('T')[0])

  const setSelectedDate = (dateStr) => {
    selectedDate.value = dateStr
  }

  // Exercices disponibles (issus du JSON)
  const allExercises = ref(exerciseList)

  // Séances (workouts) et logs (setlogs)
  const workouts = ref(workoutList)
  const setlogs = ref(setLogList)

  // Ajout d'un SetLog à une séance
  const addSetLog = ({ exercise_id, reps, weight, workout_date }) => {
    let workout = workouts.value.find((w) => w.date === workout_date)

    // Créer la séance si elle n'existe pas
    if (!workout) {
      workout = {
        id: `wk-${workout_date}`,
        date: workout_date,
      }
      workouts.value.push(workout)
    }

    const newLog = {
      id: `log-${crypto.randomUUID()}`,
      exercise_id,
      workout_id: workout.id,
      reps,
      weight,
      order: setlogs.value.filter((l) => l.workout_id === workout.id).length + 1,
    }

    setlogs.value.push(newLog)
  }

  // Ancienne logique conservée si utile localement
  const defaultExercises = []

  const savedExercises = localStorage.getItem('exercises')
  const exercises = ref(savedExercises ? JSON.parse(savedExercises) : defaultExercises)

  const addExercise = (exercise) => {
    const newId = exercises.value.length ? Math.max(...exercises.value.map((e) => e.id)) + 1 : 1

    exercises.value.push({
      id: newId,
      ...exercise,
      completed: false,
      actualWeight: null,
    })
  }

  const removeExercise = (id) => {
    exercises.value = exercises.value.filter((e) => e.id !== id)
  }

  const completeExercise = (id, weightUsed) => {
    const exercise = exercises.value.find((e) => e.id === id)
    if (exercise) {
      exercise.actualWeight = weightUsed
      exercise.completed = true
    }
  }

  const toggleCompleted = (id) => {
    const exercise = exercises.value.find((e) => e.id === id)
    if (exercise) {
      exercise.completed = !exercise.completed
    }
  }

  const getWeekday = computed(() => {
    const date = parseISO(selectedDate.value)
    return format(date, 'eeee', { locale: fr })
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

  const updateWeight = (id, weightUsed) => {
    const exercise = exercises.value.find((e) => e.id === id)
    if (exercise) {
      exercise.actualWeight = weightUsed
    }
  }

  return {
    today,
    selectedDate,
    setSelectedDate,
    exercises,
    addExercise,
    removeExercise,
    completeExercise,
    toggleCompleted,
    updateWeight,
    filteredExercises,
    getWeekday,
    allExercises,
    workouts,
    setlogs,
    addSetLog,
  }
})
