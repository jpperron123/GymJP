<template>
  <div :class="[
    'flex flex-col sm:flex-row items-start justify-between shadow-md rounded-xl p-4 border hover:shadow-lg transition overflow-hidden',
    completed ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200'
  ]">

    <!-- Image -->
    <div class="w-full sm:w-1/5 flex-shrink-0 mb-4 sm:mb-0">
      <div class="w-full h-28 sm:h-24 rounded-lg flex items-center justify-center overflow-hidden">
        <img :src="resolveAsset(exercise.asset_id)" alt="Exercise image" class="w-full h-full object-contain" />
      </div>
    </div>

    

    <!-- Infos + actions -->
    <div class="flex-1 sm:ml-4 w-full">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center w-full gap-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold break-words text-gray-800">
            {{ exercise.name }}
          </h3>
          <p class="text-sm text-gray-500 mt-1">
            {{ displaySets }} sets × {{ displayReps }} reps
          </p>

          <!-- Editable weight input -->
          <div v-if="logId" class="mt-2 flex items-center gap-2">
            <label for="weightInput" class="text-sm text-gray-600">Poids :</label>
            <input id="weightInput" type="number" min="0" v-model.number="editableWeight" @blur="saveWeight"
              :disabled="completed" class="w-24 p-1 border rounded text-sm bg-white disabled:bg-gray-100"
              placeholder="Poids (lbs)" />
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:items-end items-start">
          <Button v-if="hasCompletion" :variant="completed ? 'success' : 'secondary'" @click="toggleCompleted"
            class="cursor-pointer w-full sm:w-auto">
            {{ completed ? 'Complété' : 'Non complété' }}
          </Button>

          <Button variant="danger" @click="removeItem" class="cursor-pointer w-full sm:w-auto">
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTrainingStore } from '@/stores/trainingStore'
import Button from './Button.vue'
import assets from '@/mock-data/asset.json'

const props = defineProps({
  exercise: {
    type: Object,
    required: true
  },
  reps: Number,
  weight: Number,
  sets: Number,
  completed: Boolean,
  logId: String
})

const trainingStore = useTrainingStore()

const hasCompletion = computed(() => props.completed !== undefined)

const displayReps = computed(() => props.reps ?? props.exercise.reps ?? '?')
const displayWeight = computed(() => props.weight ?? props.exercise.weight ?? '?')
const displaySets = computed(() => props.sets ?? props.exercise.sets ?? '?')

const resolveAsset = (assetId) => {
  const asset = assets.find(a => a.id === assetId)
  return asset ? new URL(`../assets/exercice/${asset.url}`, import.meta.url).href : ''
}

const toggleCompleted = () => {
  const log = trainingStore.setlogs.find(l => l.id === props.logId)
  if (log) log.completed = !log.completed
}

const removeItem = () => {
  if (props.logId) {
    trainingStore.setlogs = trainingStore.setlogs.filter(log => log.id !== props.logId)
  } else {
    trainingStore.removeExercise(props.exercise.id)
  }
}

// ➕ Partie pour modifier le poids à la volée
const editableWeight = ref(props.weight ?? 0)

watch(() => props.weight, (newWeight) => {
  editableWeight.value = newWeight ?? 0
})

const saveWeight = () => {
  const log = trainingStore.setlogs.find(l => l.id === props.logId)
  if (log) log.weight = editableWeight.value
}
</script>
