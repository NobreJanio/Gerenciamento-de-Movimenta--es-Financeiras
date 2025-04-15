<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Movimentações Financeiras</h1>
      <div class="d-flex">
        <v-btn color="success" class="mr-2" @click="handleExportToExcel" :loading="isExporting === 'excel'">
          <v-icon start>mdi-file-excel</v-icon>
          Excel
        </v-btn>
        <v-btn color="error" class="mr-2" @click="handleExportToPDF" :loading="isExporting === 'pdf'">
          <v-icon start>mdi-file-pdf-box</v-icon>
          PDF
        </v-btn>
        <v-btn color="primary" @click="openDialog()">
          <v-icon start>mdi-plus</v-icon>
          Nova Movimentação
        </v-btn>
      </div>
    </div>

    <!-- Filtros -->
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
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabela de Transações -->
    <v-data-table :headers="headers" :items="transactionStore.filteredTransactions" :loading="transactionStore.loading"
      :items-per-page="10" :footer-props="{
        'items-per-page-options': [5, 10, 15, 20],
        'items-per-page-text': 'Itens por página',
        'show-current-page': true,
        'show-first-last-page': true
      }" class="elevation-1">
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
        <v-chip v-if="item.category && typeof item.category === 'object' && item.category.name && item.category.color"
          :color="item.category.color" text-color="white" size="small">
          {{ item.category.name }}
        </v-chip>
        <span v-else>-</span>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon size="small" class="mr-2" @click="openDialog(item)">
          mdi-pencil
        </v-icon>
        <v-icon size="small" @click="confirmDelete(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>

    <!-- Diálogo para adicionar/editar transação -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEditing ? 'Editar' : 'Nova' }} Movimentação</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="editedItem.description" label="Descrição *"
                    :rules="[rules.required]"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select v-model="editedItem.type" label="Tipo *" :items="[
                    { title: 'Receita', value: 'income' },
                    { title: 'Despesa', value: 'expense' }
                  ]" item-title="title" item-value="value" :rules="[rules.required]"></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field v-model.number="editedItem.amount" label="Valor *" type="number" prefix="R$"
                    :rules="[rules.required, rules.positive]"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select v-model="editedItem.category_id" label="Categoria *" :items="filteredCategories"
                    item-title="text" item-value="value" :rules="[rules.required]"></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="editedItem.date" label="Data *" type="date"
                    :rules="[rules.required]"></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" variant="text" @click="closeDialog">
            Cancelar
          </v-btn>
          <v-btn color="blue darken-1" variant="text" @click="saveTransaction" :loading="saving" :disabled="!valid">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmação para exclusão -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Confirmar exclusão</v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir esta movimentação?
          <br>
          <strong>{{ deleteItem?.description }}</strong> - R$ {{ formatCurrency(deleteItem?.amount || 0) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteDialog = false">
            Cancelar
          </v-btn>
          <v-btn color="error" text @click="deleteTransaction">
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useTransactionStore } from '../../stores/transaction'
import { useCategoryStore } from '../../stores/category'
import { formatCurrency, formatDate, formatTransactionType, getTypeColor } from '../../utils/formatters'
import { Transaction, DataTableItem, TransactionFilters } from '../../types'
import { useSnackbar } from '../../composables/useSnackbar'
import { transactionService } from '../../services/api'

export default defineComponent({
  name: 'TransactionsView',
  setup() {
    // Stores
    const transactionStore = useTransactionStore()
    const categoryStore = useCategoryStore()
    const { showSnackbar } = useSnackbar()

    // Estado do formulário
    const form = ref<any>(null)
    const valid = ref(false)
    const dialog = ref(false)
    const deleteDialog = ref(false)
    const isEditing = ref(false)
    const deleteItem = ref<any>(null)
    const saving = ref(false)

    // Filtros
    const filters = ref<TransactionFilters>({
      type: '' as '',
      category_id: undefined,
      minAmount: undefined,
      maxAmount: undefined
    })

    // Item sendo editado
    const defaultItem: Partial<Transaction> = {
      id: 0,
      date: new Date().toISOString().substr(0, 10),
      type: 'expense',
      amount: 0,
      category_id: 0, // Inicializado com 0 em vez de undefined
      description: ''
    }
    const editedItem = ref<Partial<Transaction>>({ ...defaultItem })

    // Cabeçalhos da tabela
    const headers = [
      { title: 'Data', key: 'date', sortable: true },
      { title: 'Tipo', key: 'type', sortable: true },
      { title: 'Valor', key: 'amount', sortable: true },
      { title: 'Categoria', key: 'category', sortable: false },
      { title: 'Descrição', key: 'description', sortable: true },
      { title: 'Ações', key: 'actions', sortable: false }
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

    // Categorias filtradas por tipo para o formulário
    const filteredCategories = computed(() => {
      return categoryStore.categories
        .filter(category =>
          category.type === 'both' ||
          category.type === editedItem.value.type
        )
        .map(category => ({
          text: category.name,
          value: category.id
        }))
    })

    // Utilizando as funções de formatação do utilitário

    const applyFilters = () => {
      transactionStore.applyFilters({
        type: filters.value.type,
        category_id: filters.value.category_id,
        minAmount: filters.value.minAmount,
        maxAmount: filters.value.maxAmount
      })
    }

    const openDialog = (item?: any) => {
      if (item) {
        editedItem.value = { ...item }
        isEditing.value = true
      } else {
        editedItem.value = { ...defaultItem }
        isEditing.value = false
      }
      dialog.value = true
    }

    const closeDialog = () => {
      dialog.value = false
      form.value?.reset()
      setTimeout(() => {
        editedItem.value = { ...defaultItem }
      }, 300)
    }

    const saveTransaction = async () => {
      if (!form.value.validate()) return

      saving.value = true
      try {
        if (isEditing.value) {
          await transactionStore.updateTransaction(editedItem.value.id!, {
            date: editedItem.value.date!,
            type: editedItem.value.type!,
            amount: editedItem.value.amount!,
            category_id: editedItem.value.category_id || 0,
            description: editedItem.value.description!
          })
          showSnackbar('Transação atualizada com sucesso!', 'success')
        } else {
          await transactionStore.createTransaction({
            date: editedItem.value.date!,
            type: editedItem.value.type!,
            amount: editedItem.value.amount!,
            category_id: editedItem.value.category_id || 0,
            description: editedItem.value.description!
          })
          showSnackbar('Transação criada com sucesso!', 'success')
        }
        // Forçar atualização da lista de transações para garantir que as mudanças sejam exibidas
        await transactionStore.fetchTransactions()
        closeDialog()
      } catch (error) {
        console.error('Erro ao salvar transação:', error)
        showSnackbar('Erro ao salvar transação', 'error')
      } finally {
        saving.value = false
      }
    }

    const confirmDelete = (item: any) => {
      deleteItem.value = item
      deleteDialog.value = true
    }

    const deleteTransaction = async () => {
      if (deleteItem.value) {
        try {
          console.log('Tentando excluir transação:', deleteItem.value.id)
          const success = await transactionStore.deleteTransaction(deleteItem.value.id)
          if (success) {
            showSnackbar('Transação excluída com sucesso!', 'success')
            // Forçar atualização da lista de transações
            await transactionStore.fetchTransactions()
          } else {
            showSnackbar('Erro ao excluir transação', 'error')
          }
        } catch (error: any) {
          console.error('Erro ao excluir transação:', error)
          showSnackbar(error.message || 'Erro ao excluir transação', 'error')
        } finally {
          deleteDialog.value = false
        }
      }
    }

    // Regras de validação
    const rules = {
      required: (v: any) => !!v || 'Campo obrigatório',
      positive: (v: number) => v > 0 || 'O valor deve ser maior que zero'
    }

    // Estado de exportação
    const isExporting = ref<'excel' | 'pdf' | null>(null)

    // Função para exportar para Excel
    const handleExportToExcel = async () => {
      try {
        isExporting.value = 'excel'
        const response = await transactionStore.exportToExcel()

        // Criar URL do blob e fazer download
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.xlsx`)
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
    const handleExportToPDF = async () => {
      try {
        isExporting.value = 'pdf'
        const response = await transactionStore.exportToPDF()

        // Criar URL do blob e fazer download
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.pdf`)
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
    })

    // Observar mudanças no tipo da transação para resetar categoria se incompatível
    watch(() => editedItem.value.type, (newType) => {
      const currentCategory = categoryStore.categories.find(
        c => c.id === editedItem.value.category_id
      )

      if (currentCategory &&
        currentCategory.type !== 'both' &&
        currentCategory.type !== newType) {
        editedItem.value.category_id = undefined
      }
    })

    return {
      transactionStore,
      categoryStore,
      headers,
      dialog,
      deleteDialog,
      isEditing,
      editedItem,
      deleteItem,
      valid,
      form,
      filters,
      categoryOptions,
      filteredCategories,
      rules,
      formatDate,
      formatCurrency,
      openDialog,
      closeDialog,
      saveTransaction,
      confirmDelete,
      deleteTransaction,
      applyFilters,
      handleExportToExcel,
      handleExportToPDF,
      saving,
      isExporting
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