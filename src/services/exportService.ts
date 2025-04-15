import { api } from '../lib/axios'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { TransactionFilters, ExportableTransaction } from '../@types/transaction'

export class ExportService {
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  private static formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  private static async getTransactionsData(filters: TransactionFilters = {}) {
    try {
      const response = await api.get<ExportableTransaction[]>('/transactions', { params: filters })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar dados para exportação:', error)
      throw new Error('Falha ao obter dados para exportação')
    }
  }

  public static async exportToExcel(filters: TransactionFilters = {}) {
    try {
      const transactions = await this.getTransactionsData(filters)
      
      // Preparar dados para o Excel
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(transactions.map(t => ({
        Data: new Date(t.date).toLocaleDateString('pt-BR'),
        Tipo: t.type === 'income' ? 'Receita' : 'Despesa',
        Valor: this.formatCurrency(t.amount),
        Categoria: t.category?.name || '',
        Descrição: t.description
      })))

      // Configurar largura das colunas
      const columnWidths = [
        { wch: 12 }, // Data
        { wch: 10 }, // Tipo
        { wch: 15 }, // Valor
        { wch: 20 }, // Categoria
        { wch: 40 }  // Descrição
      ]
      worksheet['!cols'] = columnWidths

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações')

      // Gerar arquivo
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })

      // Salvar arquivo
      saveAs(blob, `transacoes_${this.formatDate(new Date())}.xlsx`)

      return true
    } catch (error) {
      console.error('Erro na exportação para Excel:', error)
      throw error
    }
  }

  public static async exportToPDF(filters: TransactionFilters = {}) {
    try {
      const transactions = await this.getTransactionsData(filters)
      
      // Criar o PDF
      const doc = new jsPDF()

      // Adicionar título
      doc.setFontSize(16)
      doc.text('Relatório de Movimentações Financeiras', 20, 20)

      // Adicionar data do relatório
      doc.setFontSize(12)
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30)

      // Calcular totais
      const totals = transactions.reduce((acc, t) => {
        if (t.type === 'income') {
          acc.income += t.amount
        } else {
          acc.expense += t.amount
        }
        return acc
      }, { income: 0, expense: 0 })

      // Adicionar resumo financeiro
      doc.text('Resumo:', 20, 40)
      doc.text(`Receitas: ${this.formatCurrency(totals.income)}`, 20, 48)
      doc.text(`Despesas: ${this.formatCurrency(totals.expense)}`, 20, 56)
      doc.text(`Saldo: ${this.formatCurrency(totals.income - totals.expense)}`, 20, 64)

      // Preparar dados para a tabela
      const tableData = transactions.map(t => [
        new Date(t.date).toLocaleDateString('pt-BR'),
        t.type === 'income' ? 'Receita' : 'Despesa',
        this.formatCurrency(t.amount),
        t.category?.name || '',
        t.description
      ])

      // Adicionar tabela
      doc.autoTable({
        head: [['Data', 'Tipo', 'Valor', 'Categoria', 'Descrição']],
        body: tableData,
        startY: 75,
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 25 },  // Data
          1: { cellWidth: 20 },  // Tipo
          2: { cellWidth: 30 },  // Valor
          3: { cellWidth: 35 },  // Categoria
          4: { cellWidth: 'auto' }  // Descrição
        }
      })

      // Salvar arquivo
      const pdfBlob = doc.output('blob')
      saveAs(pdfBlob, `transacoes_${this.formatDate(new Date())}.pdf`)

      return true
    } catch (error) {
      console.error('Erro na exportação para PDF:', error)
      throw error
    }
  }
} 