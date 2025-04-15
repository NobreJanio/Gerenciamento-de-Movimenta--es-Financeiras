import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<any | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  // Não precisamos mais configurar o axios aqui, pois isso é feito no serviço de API

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const response = await authService.login(email, password)

      token.value = response.data.token
      user.value = response.data.user
      if (token.value) localStorage.setItem('token', token.value)
      return true
    } catch (err: any) {
      if (err.response?.data?.errors) {
        // Tratamento para erros de validação específicos
        const validationErrors = err.response.data.errors
        const errorMessages = Object.values(validationErrors).flat()
        error.value = errorMessages.join('\n')
      } else {
        error.value = err.response?.data?.message || 'Erro ao fazer login'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(name: string, email: string, password: string, password_confirmation: string) {
    loading.value = true
    error.value = null

    try {
      const response = await authService.register(name, email, password, password_confirmation)

      token.value = response.data.token
      user.value = response.data.user
      if (token.value) localStorage.setItem('token', token.value)
      return true
    } catch (err: any) {
      if (err.response?.data?.errors) {
        // Tratamento para erros de validação específicos
        const validationErrors = err.response.data.errors
        const errorMessages = Object.values(validationErrors).flat()
        error.value = errorMessages.join('\n')
      } else {
        error.value = err.response?.data?.message || 'Erro ao registrar'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true

    try {
      if (token.value) {
        await authService.logout()
      }
    } catch (err) {
      // Mesmo com erro, vamos limpar os dados locais
      console.error('Erro ao fazer logout no servidor', err)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return

    loading.value = true
    try {
      const response = await authService.getUser()
      user.value = response.data
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Token inválido
        logout()
      }
      console.error('Erro ao buscar dados do usuário', err)
    } finally {
      loading.value = false
    }
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser
  }
})