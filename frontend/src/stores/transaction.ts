import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { transactionService } from '../services/api'
import axios from 'axios'

interface Transaction {
  id: number
  date: string
  type: 'income' | 'expense'
  amount: number
  category_id: number
  description: string
  category?: {
    id: number
    name: string
    color: string
  }
}

interface TransactionFilters {
  type?: string
  category_id?: number
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?: string
}

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<TransactionFilters>({})

  // Transações filtradas
  const filteredTransactions = computed(() => {
    let result = [...transactions.value]

    if (filters.value.type) {
      result = result.filter(t => t.type === filters.value.type)
    }

    if (filters.value.category_id) {
      result = result.filter(t => t.category_id === filters.value.category_id)
    }

    if (filters.value.minAmount) {
      result = result.filter(t => t.amount >= filters.value.minAmount!)
    }

    if (filters.value.maxAmount) {
      result = result.filter(t => t.amount <= filters.value.maxAmount!)
    }

    if (filters.value.startDate) {
      result = result.filter(t => t.date >= filters.value.startDate!)
    }

    if (filters.value.endDate) {
      result = result.filter(t => t.date <= filters.value.endDate!)
    }

    return result
  })

  // Total de receitas
  const totalIncome = computed(() => {
    return filteredTransactions.value
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  })

  // Total de despesas
  const totalExpense = computed(() => {
    return filteredTransactions.value
      .filter(transaction => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  })

  // Saldo
  const balance = computed(() => {
    return totalIncome.value - totalExpense.value
  })

  // Buscar todas as transações
  async function fetchTransactions() {
    loading.value = true
    error.value = null

    try {
      const response = await transactionService.getAll()
      transactions.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao buscar transações'
      console.error('Erro ao buscar transações:', err)
    } finally {
      loading.value = false
    }
  }

  // Buscar uma transação específica
  async function fetchTransaction(id: number) {
    loading.value = true
    error.value = null

    try {
      const response = await transactionService.getById(id)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || `Erro ao buscar transação ${id}`
      console.error(`Erro ao buscar transação ${id}:`, err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Criar uma nova transação
  async function createTransaction(transaction: Omit<Transaction, 'id'>) {
    loading.value = true
    error.value = null

    try {
      const response = await transactionService.create(transaction)
      transactions.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao criar transação'
      console.error('Erro ao criar transação:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Atualizar uma transação existente
  async function updateTransaction(id: number, transaction: Partial<Omit<Transaction, 'id'>>) {
    loading.value = true
    error.value = null

    try {
      const response = await transactionService.update(id, transaction)
      const index = transactions.value.findIndex(t => t.id === id)
      if (index !== -1) {
        transactions.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || `Erro ao atualizar transação ${id}`
      console.error(`Erro ao atualizar transação ${id}:`, err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Excluir uma transação
  async function deleteTransaction(id: number) {
    loading.value = true
    error.value = null

    try {
      await transactionService.delete(id)
      transactions.value = transactions.value.filter(t => t.id !== id)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || `Erro ao excluir transação ${id}`
      console.error(`Erro ao excluir transação ${id}:`, err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Aplicar filtros
  function applyFilters(newFilters: TransactionFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  // Métodos de exportação
  async function exportToExcel() {
    const response = await transactionService.exportToExcel({
      type: filters.value.type,
      category_id: filters.value.category_id,
      startDate: filters.value.startDate,
      endDate: filters.value.endDate,
      minAmount: filters.value.minAmount,
      maxAmount: filters.value.maxAmount
    })
    return response
  }

  async function exportToPDF() {
    const response = await transactionService.exportToPDF({
      type: filters.value.type,
      category_id: filters.value.category_id,
      startDate: filters.value.startDate,
      endDate: filters.value.endDate,
      minAmount: filters.value.minAmount,
      maxAmount: filters.value.maxAmount
    })
    return response
  }

  return {
    transactions,
    filteredTransactions,
    loading,
    error,
    filters,
    totalIncome,
    totalExpense,
    balance,
    fetchTransactions,
    fetchTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    applyFilters,
    exportToExcel,
    exportToPDF
  }
})