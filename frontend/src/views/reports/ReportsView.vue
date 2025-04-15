<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <h1 class="text-h4">Relatórios</h1>
          <div>
            <v-btn color="success" class="mr-2" @click="handleExportToExcel" :loading="isExporting === 'excel'">
              <v-icon start>mdi-file-excel</v-icon>
              Excel
            </v-btn>
            <v-btn color="error" @click="handleExportToPDF" :loading="isExporting === 'pdf'">
              <v-icon start>mdi-file-pdf-box</v-icon>
              PDF
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-card class="mb-4">
      <v-card-title class="primary white--text">
        <v-icon start color="white">mdi-filter</v-icon>
        Filtros
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-select v-model="filters.type" label="Tipo" :items="[
              { title: 'Todos', value: '' },
              { title: 'Receitas', value: 'income' },
              { title: 'Despesas', value: 'expense' }
            ]" item-title="title" item-value="value" clearable @update:model-value="applyFilters"></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select v-model="filters.category_id" label="Categoria" :items="categoryOptions" item-title="text"
              item-value="value" clearable @update:model-value="applyFilters"></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model.number="filters.minAmount" label="Valor Mínimo" type="number" prefix="R$"
              @update:model-value="applyFilters"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model.number="filters.maxAmount" label="Valor Máximo" type="number" prefix="R$"
              @update:model-value="applyFilters"></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-menu v-model="startDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
              max-width="290px" min-width="auto">
              <template v-slot:activator="{ props }">
                <v-text-field v-model="filters.startDate" label="Data Inicial" readonly v-bind="props" clearable
                  @click:clear="filters.startDate = ''"></v-text-field>
              </template>
              <v-date-picker v-model="filters.startDate"
                @update:model-value="startDateMenu = false; applyFilters()"></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-menu v-model="endDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
              max-width="290px" min-width="auto">
              <template v-slot:activator="{ props }">
                <v-text-field v-model="filters.endDate" label="Data Final" readonly v-bind="props" clearable
                  @click:clear="filters.endDate = ''"></v-text-field>
              </template>
              <v-date-picker v-model="filters.endDate"
                @update:model-value="endDateMenu = false; applyFilters()"></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-title class="primary white--text">
            <v-icon start color="white">mdi-chart-pie</v-icon>
            Distribuição por Categoria
          </v-card-title>
          <v-card-text>
            <div class="chart-container">
              <PieChart v-if="categoryChartData.labels.length > 0" :data="categoryChartData" :options="{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context: any) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: R$ ${formatCurrency(value)} (${percentage}%)`;
                      }
                    }
                  }
                }
              }" />
              <div v-else class="text-center pa-5">
                <v-progress-circular v-if="transactionStore.loading" indeterminate
                  color="primary"></v-progress-circular>
                <p v-else>Nenhuma transação encontrada para exibir o gráfico.</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-title class="primary white--text">
            <v-icon start color="white">mdi-chart-timeline-variant</v-icon>
            Evolução Mensal
          </v-card-title>
          <v-card-text>
            <div class="chart-container">
              <LineChart v-if="monthlyChartData.labels.length > 0" :data="monthlyChartData"
                :options="lineChartOptions" />
              <div v-else class="text-center pa-5">
                <v-progress-circular v-if="transactionStore.loading" indeterminate
                  color="primary"></v-progress-circular>
                <p v-else>Nenhuma transação encontrada para exibir o gráfico.</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title class="primary white--text d-flex justify-space-between align-center">
        <div>
          <v-icon start color="white">mdi-table</v-icon>
          Resumo de Transações
        </div>
      </v-card-title>
      <v-card-text>
        <v-data-table :headers="headers" :items="transactionStore.filteredTransactions"
          :loading="transactionStore.loading" :items-per-page="10" class="elevation-1">
          <template v-slot:[`item.date`]="{ item }">
            {{ formatDate(item.date) }}
          </template>
          <template v-slot:[`item.type`]="{ item }">
            <v-chip :color="item.type === 'income' ? 'success' : 'error'" text-color="white" size="small">
              {{ item.type === 'income' ? 'Receita' : 'Despesa' }}
            </v-chip>
          </template>
          <template v-slot:[`item.amount`]="{ item }">
            <span :class="item.type === 'income' ? 'success--text' : 'error--text'">
              R$ {{ formatCurrency(item.amount) }}
            </span>
          </template>
          <template v-slot:[`item.category`]="{ item }">
            <v-chip v-if="item.category && typeof item.category === 'object'" :color="item.category.color"
              text-color="white" size="small">
              {{ item.category.name }}
            </v-chip>
            <span v-else>-</span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Snackbar para mensagens -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" icon="mdi-close" @click="snackbar.show = false"></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '../../stores/transaction'
import { useCategoryStore } from '../../stores/category'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js'
import { Pie as PieChart, Line as LineChart } from 'vue-chartjs'
import { transactionService } from '../../services/api'
import { useSnackbar } from '../../composables/useSnackbar'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
)
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
// Registrando o plugin autoTable para o jsPDF
// Estendendo o tipo jsPDF para incluir o método autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}
import * as XLSX from 'xlsx'
import { formatCurrency, formatDate, getMonthKey, formatMonthYear, formatTransactionType, getTypeColor } from '../../utils/formatters'
import { Transaction, DataTableItem } from '../../types'

// Interface para os filtros
interface TransactionFilters {
  type: string;
  category_id?: number;
  startDate: string;
  endDate: string;
  minAmount: number | null;
  maxAmount: number | null;
}

export default defineComponent({
  name: 'ReportsView',
  components: {
    PieChart,
    LineChart
  },
  setup() {
    // Stores
    const transactionStore = useTransactionStore()
    const categoryStore = useCategoryStore()
    const { showSnackbar } = useSnackbar()

    // Estado dos filtros
    const filters = ref({
      type: '',
      category_id: undefined as number | undefined,
      startDate: '',
      endDate: '',
      minAmount: null as number | null,
      maxAmount: null as number | null
    })

    // Estado dos menus de data
    const startDateMenu = ref(false)
    const endDateMenu = ref(false)

    // Cabeçalhos da tabela
    const headers = [
      { title: 'Data', key: 'date', sortable: true },
      { title: 'Tipo', key: 'type', sortable: true },
      { title: 'Valor', key: 'amount', sortable: true },
      { title: 'Categoria', key: 'category', sortable: false },
      { title: 'Descrição', key: 'description', sortable: true }
    ]

    // Opções de categorias para o select
    const categoryOptions = computed(() => {
      return [
        { text: 'Todas', value: undefined },
        ...categoryStore.categories.map(category => ({
          text: category.name,
          value: category.id
        }))
      ]
    })

    /**
     * Dados para o gráfico de categorias
     * Agrupa as transações por categoria e calcula o total por categoria
     */
    const categoryChartData = computed(() => {
      const { categoryCounts, categoryColors } = calculateCategoryTotals()

      const labels = Object.keys(categoryCounts)
      const data = Object.values(categoryCounts)
      const backgroundColor = labels.map(label => categoryColors[label])

      return {
        labels,
        datasets: [
          {
            data,
            backgroundColor
          }
        ]
      }
    })

    /**
     * Calcula os totais por categoria
     * @returns Objeto com os totais e cores por categoria
     */
    const calculateCategoryTotals = () => {
      const categoryCounts: Record<string, number> = {}
      const categoryColors: Record<string, string> = {}

      transactionStore.filteredTransactions.forEach(transaction => {
        if (transaction.category) {
          const categoryName = transaction.category.name
          if (!categoryCounts[categoryName]) {
            categoryCounts[categoryName] = 0
            categoryColors[categoryName] = transaction.category.color
          }
          categoryCounts[categoryName] += transaction.amount
        }
      })

      return { categoryCounts, categoryColors }
    }

    /**
     * Dados para o gráfico mensal
     * Agrupa as transações por mês e calcula os totais de receitas e despesas
     */
    const monthlyChartData = computed(() => {
      const { months, sortedMonths } = initializeMonthlyData()

      // Agrupar transações por mês
      aggregateTransactionsByMonth(months)

      // Preparar dados para o gráfico
      const labels = formatMonthLabels(sortedMonths)
      const { incomeData, expenseData } = extractMonthlyData(months, sortedMonths)

      return createMonthlyChartDataset(labels, incomeData, expenseData)
    })

    /**
     * Inicializa os dados dos últimos 12 meses
     * @returns Objeto com os meses inicializados e a lista ordenada
     */
    const initializeMonthlyData = () => {
      const months: Record<string, { income: number; expense: number }> = {}
      const sortedMonths: string[] = []

      // Inicializar os últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = getMonthKey(date)

        months[monthKey] = { income: 0, expense: 0 }
        sortedMonths.push(monthKey)
      }

      return { months, sortedMonths }
    }

    /**
     * Agrega as transações por mês
     * @param months Objeto com os meses inicializados
     */
    const aggregateTransactionsByMonth = (months: Record<string, { income: number; expense: number }>) => {
      transactionStore.filteredTransactions.forEach(transaction => {
        const date = new Date(transaction.date)
        const monthKey = getMonthKey(date)

        if (months[monthKey]) {
          if (transaction.type === 'income') {
            months[monthKey].income += transaction.amount
          } else {
            months[monthKey].expense += transaction.amount
          }
        }
      })
    }

    /**
     * Formata as etiquetas dos meses para o gráfico
     * @param sortedMonths Lista ordenada de chaves de meses
     * @returns Lista de etiquetas formatadas
     */
    const formatMonthLabels = (sortedMonths: string[]) => {
      return sortedMonths.map(key => {
        const [year, month] = key.split('-')
        return formatMonthYear(new Date(parseInt(year), parseInt(month) - 1).toISOString())
      })
    }

    /**
     * Extrai os dados de receitas e despesas por mês
     * @param months Objeto com os dados dos meses
     * @param sortedMonths Lista ordenada de chaves de meses
     * @returns Objeto com os dados de receitas e despesas
     */
    const extractMonthlyData = (months: Record<string, { income: number; expense: number }>, sortedMonths: string[]) => {
      const incomeData = sortedMonths.map(key => months[key].income)
      const expenseData = sortedMonths.map(key => months[key].expense)
      return { incomeData, expenseData }
    }

    /**
     * Cria o conjunto de dados para o gráfico mensal
     * @param labels Etiquetas dos meses
     * @param incomeData Dados de receitas
     * @param expenseData Dados de despesas
     * @returns Objeto com os dados formatados para o gráfico
     */
    const createMonthlyChartDataset = (labels: string[], incomeData: number[], expenseData: number[]) => {
      return {
        labels,
        datasets: [
          {
            label: 'Receitas',
            data: incomeData,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            tension: 0.1
          },
          {
            label: 'Despesas',
            data: expenseData,
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.2)',
            tension: 0.1
          }
        ]
      }
    }

    /**
     * Configurações para os gráficos
     */
    // Opções para o gráfico de pizza (categorias)
    const pieChartOptions = createPieChartOptions()

    // Opções para o gráfico de linha (evolução mensal)
    const lineChartOptions = createLineChartOptions()

    /**
     * Cria as opções para o gráfico de pizza
     * @returns Configurações do gráfico de pizza
     */
    function createPieChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || ''
                const value = context.raw || 0
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                const percentage = Math.round((value / total) * 100)
                return `${label}: R$ ${formatCurrency(value)} (${percentage}%)`
              }
            }
          }
        }
      }
    }

    /**
     * Cria as opções para o gráfico de linha
     * @returns Configurações do gráfico de linha
     */
    function createLineChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || ''
                const value = context.raw || 0
                return `${label}: R$ ${formatCurrency(value)}`
              }
            }
          }
        }
      }
    }

    // Métodos
    // Utilizando as funções de formatação do utils/formatters.ts

    const applyFilters = () => {
      transactionStore.filters = {
        type: filters.value.type as '' | 'income' | 'expense' | undefined,
        category_id: filters.value.category_id,
        startDate: filters.value.startDate,
        endDate: filters.value.endDate,
        minAmount: filters.value.minAmount || undefined,
        maxAmount: filters.value.maxAmount || undefined
      }
    }

    /**
     * Exporta os dados para PDF
     * Cria um documento PDF com título, resumo financeiro e tabela de transações
     */
    const exportToPDF = async () => {
      try {
        // Verificar se há transações para exportar
        if (transactionStore.filteredTransactions.length === 0) {
          alert('Não há transações para exportar com os filtros atuais.')
          return false
        }

        // Construir parâmetros de filtro para a API
        const params: Record<string, any> = {}
        if (filters.value.type) params.type = filters.value.type
        if (filters.value.category_id) params.category_id = filters.value.category_id
        if (filters.value.minAmount) params.min_amount = filters.value.minAmount
        if (filters.value.maxAmount) params.max_amount = filters.value.maxAmount
        if (filters.value.startDate) params.start_date = filters.value.startDate
        if (filters.value.endDate) params.end_date = filters.value.endDate

        // Usar o serviço de API para exportar
        const response = await transactionService.exportToPDF(params)
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `relatorio-financeiro_${new Date().toISOString().split('T')[0]}.pdf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        console.log('PDF gerado com sucesso')
        return true
      } catch (error) {
        console.error('Erro ao gerar PDF:', error)
        alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.')
        return false
      }
    }

    /**
     * Adiciona o cabeçalho ao documento PDF
     */
    const addReportHeader = (doc: jsPDF, pageWidth: number) => {
      // Título
      doc.setFontSize(18)
      doc.text('Relatório de Movimentações Financeiras', pageWidth / 2, 15, { align: 'center' })

      // Subtítulo com data
      doc.setFontSize(12)
      const today = new Date().toLocaleDateString('pt-BR')
      doc.text(`Gerado em: ${today}`, pageWidth / 2, 25, { align: 'center' })
    }

    /**
     * Adiciona o resumo financeiro ao documento PDF
     */
    const addFinancialSummary = (doc: jsPDF) => {
      doc.setFontSize(14)
      doc.text('Resumo Financeiro', 14, 40)

      doc.setFontSize(12)
      doc.text(`Receitas: R$ ${formatCurrency(transactionStore.totalIncome)}`, 20, 50)
      doc.text(`Despesas: R$ ${formatCurrency(transactionStore.totalExpense)}`, 20, 60)
      doc.text(`Saldo: R$ ${formatCurrency(transactionStore.balance)}`, 20, 70)
    }

    /**
     * Adiciona a tabela de transações ao documento PDF
     */
    const addTransactionsTable = (doc: jsPDF) => {
      doc.setFontSize(14)
      doc.text('Transações', 14, 90)

      // Verificar se há transações para exibir
      if (transactionStore.filteredTransactions.length === 0) {
        doc.setFontSize(12)
        doc.text('Nenhuma transação encontrada com os filtros atuais.', 20, 100)
        return
      }

      // Cabeçalhos da tabela
      const tableHeaders = ['Data', 'Tipo', 'Valor', 'Categoria', 'Descrição']
      const tableData = transactionStore.filteredTransactions.map(t => [
        formatDate(t.date),
        formatTransactionType(t.type),
        `R$ ${formatCurrency(t.amount)}`,
        t.category?.name || '-',
        t.description || ''
      ])

      // Adicionar tabela
      doc.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: 95,
        headStyles: { fillColor: [25, 118, 210] },
        styles: { overflow: 'linebreak' },
        columnStyles: { 4: { cellWidth: 'auto' } }
      })
    }

    /**
     * Exporta os dados para Excel
     * Usa a API do backend para gerar o Excel
     */
    const exportToExcel = async () => {
      try {
        // Verificar se há transações para exportar
        if (transactionStore.filteredTransactions.length === 0) {
          alert('Não há transações para exportar com os filtros atuais.')
          return false
        }

        // Construir parâmetros de filtro para a API
        const params: Record<string, any> = {}
        if (filters.value.type) params.type = filters.value.type
        if (filters.value.category_id) params.category_id = filters.value.category_id
        if (filters.value.minAmount) params.min_amount = filters.value.minAmount
        if (filters.value.maxAmount) params.max_amount = filters.value.maxAmount
        if (filters.value.startDate) params.start_date = filters.value.startDate
        if (filters.value.endDate) params.end_date = filters.value.endDate

        // Usar o serviço de API para exportar
        const response = await transactionService.exportToExcel(params)
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `relatorio-financeiro_${new Date().toISOString().split('T')[0]}.xlsx`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        console.log('Excel gerado com sucesso')
        return true
      } catch (error) {
        console.error('Erro ao gerar Excel:', error)
        alert('Ocorreu um erro ao gerar o Excel. Por favor, tente novamente.')
        return false
      }
    }

    /**
     * Prepara os dados para exportação em Excel
     * @returns Array de objetos com os dados formatados
     */
    const prepareExcelData = () => {
      return transactionStore.filteredTransactions.map(t => ({
        'Data': formatDate(t.date),
        'Tipo': formatTransactionType(t.type),
        'Valor': `R$ ${formatCurrency(t.amount)}`,
        'Categoria': t.category?.name || '-',
        'Descrição': t.description || ''
      }))
    }

    /**
     * Cria e salva o arquivo Excel
     * @param data Dados a serem incluídos na planilha
     */
    const createAndSaveExcelWorkbook = (data: any[]) => {
      try {
        // Criar workbook e worksheet
        const workbook = XLSX.utils.book_new()

        // Criar worksheet para os dados das transações
        const worksheet = XLSX.utils.json_to_sheet(data)

        // Adicionar worksheet ao workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações')

        // Criar worksheet para o resumo financeiro
        const summaryWS = XLSX.utils.aoa_to_sheet([
          ['Resumo Financeiro'],
          [''],
          ['Receitas:', `R$ ${formatCurrency(transactionStore.totalIncome)}`],
          ['Despesas:', `R$ ${formatCurrency(transactionStore.totalExpense)}`],
          ['Saldo:', `R$ ${formatCurrency(transactionStore.balance)}`]
        ])

        // Adicionar worksheet de resumo ao workbook
        XLSX.utils.book_append_sheet(workbook, summaryWS, 'Resumo')

        // Salvar arquivo
        XLSX.writeFile(workbook, 'relatorio-financeiro.xlsx')

        console.log('Arquivo Excel criado com sucesso')
      } catch (error) {
        console.error('Erro ao criar arquivo Excel:', error)
        throw error
      }
    }

    // Estado de exportação
    const isExporting = ref<'excel' | 'pdf' | null>(null)

    // Estado do snackbar
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success' as const
    })

    // Função para exportar para Excel
    async function handleExportToExcel() {
      try {
        isExporting.value = 'excel'
        const response = await transactionStore.exportToExcel()
        
        // Criar URL do blob e fazer download
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `relatorio-financeiro_${new Date().toISOString().split('T')[0]}.xlsx`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        showSnackbar('Relatório Excel gerado com sucesso!', 'success')
      } catch (error: any) {
        console.error('Erro ao exportar para Excel:', error)
        showSnackbar(error.response?.data?.message || 'Erro ao gerar relatório Excel', 'error')
      } finally {
        isExporting.value = null
      }
    }

    // Função para exportar para PDF
    async function handleExportToPDF() {
      try {
        isExporting.value = 'pdf'
        const response = await transactionStore.exportToPDF()
        
        // Criar URL do blob e fazer download
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `relatorio-financeiro_${new Date().toISOString().split('T')[0]}.pdf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        showSnackbar('Relatório PDF gerado com sucesso!', 'success')
      } catch (error: any) {
        console.error('Erro ao exportar para PDF:', error)
        showSnackbar(error.response?.data?.message || 'Erro ao gerar relatório PDF', 'error')
      } finally {
        isExporting.value = null
      }
    }

    // Carregar dados ao montar o componente
    onMounted(async () => {
      await Promise.all([
        transactionStore.fetchTransactions(),
        categoryStore.fetchCategories()
      ])
      // Aplica os filtros iniciais (se houver) para carregar os gráficos corretos
      applyFilters()
    })

    return {
      transactionStore,
      categoryStore,
      filters,
      startDateMenu,
      endDateMenu,
      headers,
      categoryOptions,
      categoryChartData,
      monthlyChartData,
      pieChartOptions,
      lineChartOptions,
      formatDate,
      formatCurrency,
      applyFilters,
      exportToPDF,
      exportToExcel,
      isExporting,
      snackbar
    }
  }
})
</script>

<style scoped>
.chart-container {
  height: 300px;
  position: relative;
}
</style>