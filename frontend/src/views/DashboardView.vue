<template>
  <div>
    <h1 class="text-h4 mb-4">Dashboard</h1>

    <v-row>
      <v-col cols="12" md="4">
        <v-card class="mb-4" height="100%">
          <v-card-title class="primary white--text">Resumo</v-card-title>
          <v-card-text class="pt-4">
            <v-list-item>
              <template v-slot:default>
                <v-list-item-title class="text-h6">Receitas</v-list-item-title>
                <v-list-item-subtitle class="text-h5 text-success">
                  R$ {{ formatCurrency(transactionStore.totalIncome) }}
                </v-list-item-subtitle>
              </template>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item>
              <template v-slot:default>
                <v-list-item-title class="text-h6">Despesas</v-list-item-title>
                <v-list-item-subtitle class="text-h5 text-error">
                  R$ {{ formatCurrency(transactionStore.totalExpense) }}
                </v-list-item-subtitle>
              </template>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item>
              <template v-slot:default>
                <v-list-item-title class="text-h6">Saldo</v-list-item-title>
                <v-list-item-subtitle
                  class="text-h5"
                  :class="transactionStore.balance >= 0 ? 'text-success' : 'text-error'"
                >
                  R$ {{ formatCurrency(transactionStore.balance) }}
                </v-list-item-subtitle>
              </template>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card class="mb-4" height="100%">
          <v-card-title class="primary white--text">Distribuição de Receitas e Despesas</v-card-title>
          <v-card-text>
            <div class="chart-container">
              <PieChart
                v-if="chartData.labels.length > 0"
                :data="chartData"
                :options="{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }"
              />
              <div v-else class="text-center pa-5">
                <v-progress-circular v-if="transactionStore.loading" indeterminate color="primary"></v-progress-circular>
                <p v-else>Nenhuma transação encontrada para exibir o gráfico.</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mb-4">
      <v-card-title class="primary white--text">Transações Mensais</v-card-title>
      <v-card-text>
        <div class="chart-container">
          <BarChart
            v-if="monthlyChartData.labels.length > 0"
            :data="monthlyChartData"
            :options="{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top'
                },
                title: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }"
          />
          <div v-else class="text-center pa-5">
            <v-progress-circular v-if="transactionStore.loading" indeterminate color="primary"></v-progress-circular>
            <p v-else>Nenhuma transação encontrada para exibir o gráfico.</p>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title class="primary white--text">Últimas Transações</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="recentTransactions"
          :loading="transactionStore.loading"
          :items-per-page="5"
          hide-default-footer
          class="elevation-0"
        >
          <template v-slot:[`item.date`]="{ item }">
            {{ formatDate(item.date) }}
          </template>
          <template v-slot:[`item.type`]="{ item }">
            <v-chip
              :color="item.type === 'income' ? 'success' : 'error'"
              text-color="white"
              size="small"
            >
              {{ item.type === 'income' ? 'Receita' : 'Despesa' }}
            </v-chip>
          </template>
          <template v-slot:[`item.amount`]="{ item }">
            R$ {{ formatCurrency(item.amount) }}
          </template>
          <template v-slot:[`item.category`]="{ item }">
            <v-chip
              :color="item.category?.color || '#999'"
              text-color="white"
              size="small"
            >
              {{ item.category?.name || 'Sem categoria' }}
            </v-chip>
          </template>
        </v-data-table>
        <div class="text-center mt-3">
          <v-btn color="primary" variant="text" to="/transactions">
            Ver todas as transações
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useTransactionStore } from '../stores/transaction'
import { useCategoryStore } from '../stores/category'
import { Pie as PieChart, Bar as BarChart } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { formatCurrency, formatDate, getMonthKey } from '../utils/formatters'
import { Transaction, DataTableItem } from '../types'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

export default defineComponent({
  name: 'DashboardView',
  components: {
    PieChart,
    BarChart
  },
  setup() {
    const transactionStore = useTransactionStore()
    const categoryStore = useCategoryStore()

    const headers = [
      { text: 'Data', value: 'date', sortable: true },
      { text: 'Tipo', value: 'type', sortable: true },
      { text: 'Valor', value: 'amount', sortable: true },
      { text: 'Categoria', value: 'category', sortable: false },
      { text: 'Descrição', value: 'description', sortable: false }
    ]

    // Utilizando as funções de formatação do utilitário

    // Últimas 5 transações
    const recentTransactions = computed(() => {
      return [...transactionStore.transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    })

    // Dados para o gráfico de pizza
    const chartData = computed(() => {
      return {
        labels: ['Receitas', 'Despesas'],
        datasets: [
          {
            backgroundColor: ['#4CAF50', '#FF5252'],
            data: [transactionStore.totalIncome, transactionStore.totalExpense]
          }
        ]
      }
    })

    // Opções para o gráfico de pizza
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }

    // Função para agrupar transações por mês
    const groupTransactionsByMonth = () => {
      const months: Record<string, { income: number; expense: number }> = {}
      const now = new Date()
      const currentYear = now.getFullYear()

      // Inicializar os últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const month = new Date(currentYear, now.getMonth() - i, 1)
        const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
        months[monthKey] = { income: 0, expense: 0 }
      }

      // Agrupar transações
      transactionStore.transactions.forEach(transaction => {
        const date = new Date(transaction.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (months[monthKey]) {
          if (transaction.type === 'income') {
            months[monthKey].income += transaction.amount
          } else {
            months[monthKey].expense += transaction.amount
          }
        }
      })

      return months
    }

    // Dados para o gráfico de barras mensal
    const monthlyChartData = computed(() => {
      const months = groupTransactionsByMonth()
      const labels = Object.keys(months).map(key => {
        const [year, month] = key.split('-')
        return `${month}/${year}`
      })

      return {
        labels,
        datasets: [
          {
            label: 'Receitas',
            backgroundColor: '#4CAF50',
            data: Object.values(months).map(m => m.income)
          },
          {
            label: 'Despesas',
            backgroundColor: '#FF5252',
            data: Object.values(months).map(m => m.expense)
          }
        ]
      }
    })

    // Opções para o gráfico de barras
    const barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }

    onMounted(async () => {
      await Promise.all([
        transactionStore.fetchTransactions(),
        categoryStore.fetchCategories()
      ])
    })

    return {
      transactionStore,
      headers,
      formatCurrency,
      formatDate,
      recentTransactions,
      chartData,
      chartOptions,
      monthlyChartData,
      barChartOptions
    }
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>