import { ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'
import { format, parseISO, subWeeks } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Capacitor } from '@capacitor/core'
import exerciseList from '@/mock-data/exercise.json'

let Storage = null

async function setupStorage() {
  if (Capacitor.isNativePlatform()) {
    const storageModule = await import('@capacitor/storage')
    Storage = storageModule.Storage
  }
}

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

  const allExercises = ref(exerciseList)
  const exercises = ref([])
  const workouts = ref([])
  const setlogs = ref([])
  const isReady = ref(false)

  const loadData = async () => {
    try {
      await setupStorage()
      if (!Storage) {
        isReady.value = true
        return
      }

      const ex = await Storage.get({ key: 'exercises' })
      const logs = await Storage.get({ key: 'setlogs' })
      const wks = await Storage.get({ key: 'workouts' })

      exercises.value = ex.value ? JSON.parse(ex.value) : []
      setlogs.value = logs.value ? JSON.parse(logs.value) : []
      workouts.value = wks.value ? JSON.parse(wks.value) : []
    } catch (err) {
      console.error('Erreur de chargement Capacitor Storage', err)
    } finally {
      isReady.value = true
    }
  }

  if (Storage) {
    watch(
      exercises,
      (val) => {
        Storage.set({ key: 'exercises', value: JSON.stringify(val) })
      },
      { deep: true },
    )

    watch(
      setlogs,
      (val) => {
        Storage.set({ key: 'setlogs', value: JSON.stringify(val) })
      },
      { deep: true },
    )

    watch(
      workouts,
      (val) => {
        Storage.set({ key: 'workouts', value: JSON.stringify(val) })
      },
      { deep: true },
    )
  }

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

  const updateWeight = (id, weightUsed) => {
    const exercise = exercises.value.find((e) => e.id === id)
    if (exercise) {
      exercise.actualWeight = weightUsed
    }
  }

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

  const getWeekday = computed(() => {
    const date = parseISO(selectedDate.value)
    return format(date, 'eeee', { locale: fr })
  })

  const filteredExercises = computed(() => {
    return exercises.value.filter((e) => e.day === getWeekday.value.toLowerCase())
  })

  const copyPreviousWeekDayLog = (dayDate) => {
    const currentDate = parseISO(dayDate)
    const previousDate = subWeeks(currentDate, 1)
    const prevWorkoutId = `wk-${format(previousDate, 'yyyy-MM-dd')}`
    const currentWorkoutId = `wk-${format(currentDate, 'yyyy-MM-dd')}`

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
    isReady,
    loadData,
  }
})
