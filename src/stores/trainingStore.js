import { ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'
import { format, parseISO, subWeeks } from 'date-fns'
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
  const addSetLog = ({ exercise_id, reps, sets, weight, workout_date }) => {
    let workout = workouts.value.find((w) => w.date === workout_date)

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
      sets,
      weight,
      completed: false,
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

  const copyPreviousWeekDayLog = (dayDate) => {
    const currentDate = parseISO(dayDate)
    const previousDate = subWeeks(currentDate, 1)
    const prevWorkoutId = `wk-${format(previousDate, 'yyyy-MM-dd')}`
    const currentWorkoutId = `wk-${format(currentDate, 'yyyy-MM-dd')}`

    // ❌ Ne rien faire si la journée actuelle a déjà des logs
    const existingLogs = setlogs.value.filter((l) => l.workout_id === currentWorkoutId)
    if (existingLogs.length > 0) return

    const prevLogs = setlogs.value.filter((l) => l.workout_id === prevWorkoutId)
    if (!prevLogs.length) return

    let workout = workouts.value.find((w) => w.id === currentWorkoutId)
    if (!workout) {
      workout = { id: currentWorkoutId, date: format(currentDate, 'yyyy-MM-dd') }
      workouts.value.push(workout)
    }

    prevLogs.forEach((oldLog, index) => {
      const suggestedWeight = oldLog.completed
        ? roundToNearestFive(oldLog.weight * 1.05)
        : oldLog.weight

      setlogs.value.push({
        id: `log-${crypto.randomUUID()}`,
        workout_id: currentWorkoutId,
        exercise_id: oldLog.exercise_id,
        reps: oldLog.reps,
        sets: oldLog.sets,
        weight: suggestedWeight,
        completed: false,
        order: index + 1,
      })
    })
  }

  const roundToNearestFive = (num) => {
    return Math.round(num / 5) * 5
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
    copyPreviousWeekDayLog,
  }
})
