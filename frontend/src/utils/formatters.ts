/**
 * Utilitários para formatação de dados
 * 
 * Este arquivo centraliza funções de formatação comuns utilizadas em toda a aplicação,
 * seguindo o princípio DRY (Don't Repeat Yourself) do Clean Code.
 */

/**
 * Formata um valor numérico para o formato de moeda brasileira
 * @param value - Valor a ser formatado
 * @returns String formatada (ex: 1.234,56)
 */
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Formata uma string de data para o formato brasileiro
 * @param dateString - String de data (formato ISO ou similar)
 * @returns Data formatada (ex: 31/12/2023)
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

/**
 * Formata uma data para exibição em formato de mês e ano
 * @param dateString - String de data (formato ISO ou similar)
 * @returns Mês e ano formatados (ex: jan/2023)
 */
export const formatMonthYear = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

/**
 * Gera uma chave de mês no formato YYYY-MM a partir de uma data
 * @param date - Objeto Date
 * @returns String no formato YYYY-MM
 */
export const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Converte um tipo de transação para texto legível
 * @param type - Tipo de transação ('income' ou 'expense')
 * @returns Texto formatado ('Receita' ou 'Despesa')
 */
export const formatTransactionType = (type: string): string => {
  return type === 'income' ? 'Receita' : 'Despesa'
}

/**
 * Obtém a cor associada ao tipo de transação
 * @param type - Tipo de transação ('income', 'expense' ou 'both')
 * @returns Cor correspondente
 */
export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'income':
      return 'success'
    case 'expense':
      return 'error'
    case 'both':
      return 'info'
    default:
      return 'grey'
  }
}

/**
 * Converte um tipo de categoria para texto legível
 * @param type - Tipo de categoria ('income', 'expense' ou 'both')
 * @returns Texto formatado
 */
export const getTypeText = (type: string): string => {
  switch (type) {
    case 'income':
      return 'Receita'
    case 'expense':
      return 'Despesa'
    case 'both':
      return 'Ambos'
    default:
      return type
  }
}