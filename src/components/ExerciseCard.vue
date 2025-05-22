<template>
  <div
    class="flex flex-col sm:flex-row items-center sm:items-start justify-between bg-white shadow-md rounded-xl p-4 border hover:shadow-lg transition">
    <!-- Zone image (placeholder) -->
    <div class="w-full sm:w-1/5 flex-shrink-0 mb-4 sm:mb-0">
      <div class="w-full h-28 sm:h-24 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
        Image
      </div>
    </div>

    <!-- Infos + actions -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center w-full sm:ml-4 gap-4">
      <div class="flex-1">
        <h3 :class="[
          'text-lg font-semibold break-words',
          exercise.completed ? 'line-through text-gray-400' : 'text-gray-800'
        ]">
          {{ exercise.name }}
        </h3>
        <p class="text-sm text-gray-500 mt-1">
          {{ exercise.type }} – {{ exercise.weight }} lbs | {{ exercise.reps }} reps x
          {{ exercise.sets }} sets
        </p>
      </div>

      <div class="flex flex-wrap gap-2 justify-end">
        <Button :variant="exercise.completed ? 'success' : 'secondary'"
          @click="trainingStore.toggleCompleted(exercise.id)" class="cursor-pointer">
          {{ exercise.completed ? 'Fait ✅' : 'Compléter' }}
        </Button>

        <Button variant="danger" @click="trainingStore.removeExercise(exercise.id)" class="cursor-pointer">
          Supprimer
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTrainingStore } from '@/stores/trainingStore'
import Button from './Button.vue'

const props = defineProps({
  exercise: {
    type: Object,
    required: true
  }
})

const trainingStore = useTrainingStore()
</script>
