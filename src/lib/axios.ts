import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
})

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  async (config) => {
    // Garantir que temos um token CSRF
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true
      })
    } catch (error) {
      console.error('Erro ao obter CSRF token:', error)
    }

    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (error.response?.status === 419) {
      // Token CSRF expirado, tentar renovar
      try {
        await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
          withCredentials: true
        })
        // Tentar a requisição original novamente
        return api.request(error.config)
      } catch (retryError) {
        console.error('Erro ao renovar CSRF token:', retryError)
        return Promise.reject(retryError)
      }
    }
    return Promise.reject(error)
  }
)

