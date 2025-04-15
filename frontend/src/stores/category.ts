import { defineStore } from 'pinia'
import { ref } from 'vue'
import { categoryService } from '../services/api'

interface Category {
  id: number
  name: string
  color: string
  type: 'income' | 'expense' | 'both'
}

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Buscar todas as categorias
  async function fetchCategories() {
    loading.value = true
    error.value = null

    try {
      const response = await categoryService.getAll()
      categories.value = Array.isArray(response.data) ? response.data : []
    } catch (err: any) {
      categories.value = []
      error.value = err.response?.data?.message || 'Erro ao buscar categorias'
      console.error('Erro ao buscar categorias:', err)
    } finally {
      loading.value = false
    }
  }

  // Buscar uma categoria específica
  async function fetchCategory(id: number) {
    loading.value = true
    error.value = null

    try {
      const response = await categoryService.getById(id)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || `Erro ao buscar categoria ${id}`
      console.error(`Erro ao buscar categoria ${id}:`, err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Criar uma nova categoria
  async function createCategory(category: Omit<Category, 'id'>) {
    loading.value = true
    error.value = null

    try {
      const response = await categoryService.create(category)
      categories.value = [...categories.value, response.data]
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar categoria'
      console.error('Erro ao criar categoria:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Atualizar uma categoria existente
  async function updateCategory(id: number, category: Partial<Category>) {
    loading.value = true
    error.value = null

    try {
      const response = await categoryService.update(id, category)
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao atualizar categoria'
      console.error('Erro ao atualizar categoria:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Excluir uma categoria
  async function deleteCategory(id: number) {
    loading.value = true
    error.value = null

    try {
      await categoryService.delete(id)
      categories.value = categories.value.filter(c => c.id !== id)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao excluir categoria'
      console.error('Erro ao excluir categoria:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory
  }
})