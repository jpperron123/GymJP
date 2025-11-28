<template>
  <div class="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
    <div class="flex flex-col items-center gap-3 mb-6 text-center">
      <img src="@/assets/logo.png" alt="Logo Gym JP" class="w-20 h-auto" />
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Connexion</h1>
        <p class="text-gray-600">Connectez-vous pour suivre vos entraînements en cours.</p>
      </div>
    </div>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="athlete@gym.jp"
          class="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          required
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          class="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          required
        />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <Button
        type="submit"
        class="w-full cursor-pointer"
        :disabled="loading"
      >
        <span v-if="loading">Connexion en cours…</span>
        <span v-else>Se connecter</span>
      </Button>
    </form>

    <p class="text-xs text-gray-500 mt-6 text-center">
      Astuce : n'importe quel email/mot de passe fonctionne pour cette démo.
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Button from './Button.vue'

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['submit'])

const email = ref('')
const password = ref('')

const submitForm = () => {
  emit('submit', {
    email: email.value,
    password: password.value,
  })
}
</script>
