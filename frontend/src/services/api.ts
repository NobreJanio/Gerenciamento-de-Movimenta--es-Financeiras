/**
 * Serviço de API
 * 
 * Este arquivo centraliza todas as chamadas à API da aplicação,
 * seguindo o princípio de Responsabilidade Única do Clean Code.
 * Separa a lógica de comunicação com o backend da lógica de gerenciamento de estado.
 */

import axios from 'axios'

// Configuração base do axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true, // Habilita o envio de cookies e credenciais
  timeout: 10000 // Timeout de 10 segundos para evitar requisições pendentes
})

// Interceptor para incluir o token em todas as requisições
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Erro na requisição:', error)
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  response => response,
  error => {
    // Informações detalhadas sobre o erro para debug
    console.error('Erro na resposta da API:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    })
    
    // Tratamento específico para erro 500
    if (error.response?.status === 500) {
      console.error('Erro interno do servidor. Verifique os logs do backend.')
    }
    
    return Promise.reject(error)
  }
)

// Serviços de autenticação
export const authService = {
  /**
   * Realiza login do usuário
   */
  login: async (email: string, password: string) => {
    try {
      return await api.post('/login', { email, password })
    } catch (error: any) {
      console.error('Erro detalhado no login:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Registra um novo usuário
   */
  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      return await api.post('/register', { name, email, password, password_confirmation })
    } catch (error: any) {
      console.error('Erro detalhado no registro:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Realiza logout do usuário
   */
  logout: async () => {
    try {
      return await api.post('/logout')
    } catch (error: any) {
      console.error('Erro detalhado no logout:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Obtém dados do usuário autenticado
   */
  getUser: async () => {
    try {
      return await api.get('/user')
    } catch (error: any) {
      console.error('Erro detalhado ao obter usuário:', error.response?.data || error.message)
      throw error
    }
  }
}

// Serviços de transações
export const transactionService = {
  /**
   * Obtém todas as transações
   */
  getAll: async () => {
    try {
      return await api.get('/transactions')
    } catch (error: any) {
      console.error('Erro ao obter transações:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Obtém uma transação específica
   */
  getById: async (id: number) => {
    try {
      return await api.get(`/transactions/${id}`)
    } catch (error: any) {
      console.error(`Erro ao obter transação ${id}:`, error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Cria uma nova transação
   */
  create: async (transaction: any) => {
    try {
      return await api.post('/transactions', transaction)
    } catch (error: any) {
      console.error('Erro ao criar transação:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Atualiza uma transação existente
   */
  update: async (id: number, transaction: any) => {
    try {
      return await api.put(`/transactions/${id}`, transaction)
    } catch (error: any) {
      console.error(`Erro ao atualizar transação ${id}:`, error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Exclui uma transação
   */
  delete: async (id: number) => {
    try {
      return await api.delete(`/transactions/${id}`)
    } catch (error: any) {
      console.error(`Erro ao excluir transação ${id}:`, error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Exporta transações para Excel
   * @param params Parâmetros de filtro opcionais
   */
  exportToExcel: async (params?: any) => {
    try {
      const response = await api.get('/transactions/export/excel', {
        responseType: 'blob',
        params: params
      })
      
      // Criar URL do blob e fazer download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return response
    } catch (error: any) {
      console.error('Erro ao exportar para Excel:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Exporta transações para PDF
   * @param params Parâmetros de filtro opcionais
   */
  exportToPDF: async (params?: any) => {
    try {
      const response = await api.get('/transactions/export/pdf', {
        responseType: 'blob',
        params: params
      })
      
      // Criar URL do blob e fazer download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return response
    } catch (error: any) {
      console.error('Erro ao exportar para PDF:', error.response?.data || error.message)
      throw error
    }
  }
}

// Serviços de categorias
export const categoryService = {
  /**
   * Obtém todas as categorias
   */
  getAll: async () => {
    try {
      return await api.get('/categories')
    } catch (error: any) {
      console.error('Erro ao obter categorias:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Obtém uma categoria específica
   */
  getById: async (id: number) => {
    try {
      return await api.get(`/categories/${id}`)
    } catch (error: any) {
      console.error(`Erro ao obter categoria ${id}:`, error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Cria uma nova categoria
   */
  create: async (category: any) => {
    try {
      return await api.post('/categories', category)
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Atualiza uma categoria existente
   */
  update: async (id: number, category: any) => {
    try {
      return await api.put(`/categories/${id}`, category)
    } catch (error: any) {
      console.error(`Erro ao atualizar categoria ${id}:`, error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Exclui uma categoria
   */
  delete: async (id: number) => {
    try {
      return await api.delete(`/categories/${id}`)
    } catch (error: any) {
      console.error(`Erro ao excluir categoria ${id}:`, error.response?.data || error.message)
      throw error
    }
  }
}

export default api