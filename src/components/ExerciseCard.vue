<template>
  <div
    class="flex flex-col sm:flex-row items-start justify-between bg-white shadow-md rounded-xl p-4 border hover:shadow-lg transition">
    <!-- Image -->
    <div class="w-full sm:w-1/5 flex-shrink-0 mb-4 sm:mb-0">
      <div class="w-full h-28 sm:h-24 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
        Image
      </div>
    </div>

    <!-- Infos + actions -->
    <div class="flex-1 sm:ml-4 w-full">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center w-full gap-4">
        <div class="flex-1">
          <h3 :class="[
            'text-lg font-semibold break-words text-gray-800'
          ]">
            {{ exercise.name }}
          </h3>
          <p class="text-sm text-gray-500 mt-1">
            {{ exercise.type }} – {{ exercise.weight }} lbs | {{ exercise.reps }} reps x
            {{ exercise.sets }} sets
          </p>

          <!-- Champ poids visible tout le temps -->
          <div class="mt-2 flex items-center gap-2">
            <input v-model.number="enteredWeight" @input="saveWeight" type="number" min="0"
              class="w-24 p-1 border rounded text-sm" placeholder="Poids (lbs)" />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-2 sm:items-end items-start">
          <Button :variant="exercise.completed ? 'secondary' : 'success'" :disabled="false"
            @click="trainingStore.toggleCompleted(exercise.id)" class="cursor-pointer w-full sm:w-auto">
            {{ exercise.completed ? 'Non complété' : 'Complété ✅' }}
          </Button>

          <Button variant="danger" @click="trainingStore.removeExercise(exercise.id)"
            class="cursor-pointer w-full sm:w-auto">
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTrainingStore } from '@/stores/trainingStore'
import Button from './Button.vue'

const props = defineProps({
  exercise: {
    type: Object,
    required: true
  }
})

const trainingStore = useTrainingStore()

const enteredWeight = ref(props.exercise.actualWeight ?? '')

watch(
  () => props.exercise.actualWeight,
  (newVal) => {
    enteredWeight.value = newVal ?? ''
  }
)

const saveWeight = () => {
  trainingStore.updateWeight(props.exercise.id, enteredWeight.value)
}
</script>
