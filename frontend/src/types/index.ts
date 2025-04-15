/**
 * Tipos e interfaces utilizados em toda a aplicação
 */

// Interface para transações
export interface Transaction {
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

// Interface para categorias
export interface Category {
  id: number
  name: string
  color: string
  type: 'income' | 'expense' | 'both'
}

// Interface para filtros de transações
export interface TransactionFilters {
  type?: 'income' | 'expense' | ''
  minAmount?: number
  maxAmount?: number
  category_id?: number
  startDate?: string
  endDate?: string
}

// Interface para itens da tabela v-data-table
export interface DataTableItem<T> {
  columns: Record<string, any>
  index: number
  isExpanded: boolean
  isSelected: boolean
  item: T
  raw: T
  selectable: boolean
}