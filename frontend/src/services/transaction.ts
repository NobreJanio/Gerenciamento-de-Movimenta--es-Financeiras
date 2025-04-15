import { api } from '../lib/axios'
import { TransactionFilters } from '../@types/transaction'

export async function exportToExcel(filters: TransactionFilters) {
  return api.get('/transactions/export/excel', {
    params: filters,
    responseType: 'blob',
    headers: {
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  })
}

export async function exportToPDF(filters: TransactionFilters) {
  return api.get('/transactions/export/pdf', {
    params: filters,
    responseType: 'blob',
    headers: {
      'Accept': 'application/pdf'
    }
  })
} 