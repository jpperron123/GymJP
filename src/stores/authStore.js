import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { Preferences } from '@capacitor/preferences'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticating = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => Boolean(user.value))

  const restoreSession = async () => {
    try {
      const storedUser = await Preferences.get({ key: 'authUser' })
      user.value = storedUser.value ? JSON.parse(storedUser.value) : null
    } catch (err) {
      console.error('Erreur de restauration de session', err)
      user.value = null
    }
  }

  const login = async ({ email, password }) => {
    if (isAuthenticating.value) return false

    error.value = ''

    if (!email || !password) {
      error.value = 'Veuillez renseigner un email et un mot de passe.'
      return false
    }

    isAuthenticating.value = true

    try {
      const normalizedEmail = email.trim().toLowerCase()
      user.value = {
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0] || 'Athlete',
      }

      await Preferences.set({ key: 'authUser', value: JSON.stringify(user.value) })
      return true
    } catch (err) {
      console.error('Erreur de connexion', err)
      error.value = "Impossible d'établir la connexion."
      user.value = null
      return false
    } finally {
      isAuthenticating.value = false
    }
  }

  const logout = async () => {
    user.value = null
    await Preferences.remove({ key: 'authUser' })
  }

  return {
    user,
    error,
    isAuthenticated,
    isAuthenticating,
    login,
    logout,
    restoreSession,
  }
})
