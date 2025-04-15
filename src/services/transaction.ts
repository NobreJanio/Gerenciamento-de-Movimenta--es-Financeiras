import { api } from '../lib/axios'
import { TransactionFilters } from '../@types/transaction'

export async function exportToExcel(filters: TransactionFilters) {
  const params = new URLSearchParams()
  
  // Adiciona os filtros aos parâmetros apenas se estiverem definidos
  if (filters.type) params.append('type', filters.type)
  if (filters.category) params.append('category', filters.category)
  if (filters.startDate) params.append('startDate', filters.startDate)
  if (filters.endDate) params.append('endDate', filters.endDate)
  if (filters.minAmount) params.append('minAmount', filters.minAmount.toString())
  if (filters.maxAmount) params.append('maxAmount', filters.maxAmount.toString())

  return api.get(`/transactions/export/excel?${params.toString()}`, {
    responseType: 'arraybuffer',
    headers: {
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Type': 'application/json'
    }
  })
}

export async function exportToPDF(filters: TransactionFilters) {
  const params = new URLSearchParams()
  
  // Adiciona os filtros aos parâmetros apenas se estiverem definidos
  if (filters.type) params.append('type', filters.type)
  if (filters.category) params.append('category', filters.category)
  if (filters.startDate) params.append('startDate', filters.startDate)
  if (filters.endDate) params.append('endDate', filters.endDate)
  if (filters.minAmount) params.append('minAmount', filters.minAmount.toString())
  if (filters.maxAmount) params.append('maxAmount', filters.maxAmount.toString())

  return api.get(`/transactions/export/pdf?${params.toString()}`, {
    responseType: 'arraybuffer',
    headers: {
      'Accept': 'application/pdf',
      'Content-Type': 'application/json'
    }
  })
} 