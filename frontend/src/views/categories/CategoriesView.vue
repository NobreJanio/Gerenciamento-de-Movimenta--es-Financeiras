<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span>Gerenciamento de Categorias</span>
            <v-btn color="primary" @click="openDialog()">
              <v-icon start>mdi-plus</v-icon>
              Nova Categoria
            </v-btn>
          </v-card-title>

          <v-card-text>
            <!-- Filtros -->
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-select v-model="filters.type" label="Filtrar por tipo" :items="typeOptions" variant="outlined"
                  density="compact" hide-details class="mb-4" />
              </v-col>
            </v-row>

            <!-- Tabela de categorias -->
            <v-data-table :headers="headers" :items="filteredCategories" :loading="categoryStore.loading"
              :items-per-page="10" class="elevation-1">
              <!-- Mensagem quando não há dados -->
              <template v-slot:no-data>
                <div class="text-center pa-5">
                  <p v-if="categoryStore.loading">Carregando categorias...</p>
                  <p v-else>Nenhuma categoria encontrada. Crie uma nova categoria clicando no botão acima.</p>
                </div>
              </template>

              <!-- Coluna de tipo -->
              <template v-slot:item.type="{ item }">
                <v-chip :color="getTypeColor(item.type)" text-color="white" size="small">
                  {{ getTypeLabel(item.type) }}
                </v-chip>
              </template>

              <!-- Coluna de cor -->
              <template v-slot:item.color="{ item }">
                <v-avatar :color="item.color" size="24" class="mr-2"></v-avatar>
                {{ item.color }}
              </template>

              <!-- Coluna de ações -->
              <template v-slot:item.actions="{ item }">
                <v-btn icon variant="text" size="small" color="primary" @click="openDialog(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="small" color="error" @click="confirmDelete(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal de criação/edição -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span>{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-form ref="form" v-model="valid">
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="editedItem.name" label="Nome da categoria"
                    :rules="[v => !!v || 'Nome é obrigatório']" required></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select v-model="editedItem.type" label="Tipo" :items="typeOptions"
                    :rules="[v => !!v || 'Tipo é obrigatório']" required></v-select>
                </v-col>
                <v-col cols="12">
                  <v-color-picker v-model="editedItem.color" mode="hex" hide-inputs show-swatches
                    swatches-max-height="150px"></v-color-picker>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" variant="text" @click="save" :disabled="!valid">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmação de exclusão -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Tem certeza que deseja excluir esta categoria?</v-card-title>
        <v-card-text>
          Esta ação não pode ser desfeita. Todas as transações associadas a esta categoria ficarão sem categoria.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="text" @click="deleteItem">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensagens -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" icon="mdi-close" @click="snackbar.show = false"></v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCategoryStore } from '../../stores/category'
import { Category } from '../../types'

// Store de categorias
const categoryStore = useCategoryStore()

// Estado do formulário
const form = ref(null)
const valid = ref(false)
const dialog = ref(false)
const deleteDialog = ref(false)
const itemToDelete = ref<Category | null>(null)

// Estado do snackbar
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Filtros
const filters = ref({
  type: 'all'
})

// Opções de tipo
const typeOptions = [
  { title: 'Todos', value: 'all' },
  { title: 'Receita', value: 'income' },
  { title: 'Despesa', value: 'expense' },
  { title: 'Ambos', value: 'both' }
]

// Item sendo editado
const defaultItem: Category = {
  id: 0,
  name: '',
  color: '#1976D2',
  type: 'expense'
}
const editedItem = ref<Category>({ ...defaultItem })

// Cabeçalhos da tabela
const headers = [
  { title: 'Nome', key: 'name', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Cor', key: 'color', sortable: false },
  { title: 'Ações', key: 'actions', sortable: false }
]

// Categorias filtradas
const filteredCategories = computed(() => {
  // Garantir que categoryStore.categories seja sempre um array
  const categoriesArray = Array.isArray(categoryStore.categories) ? categoryStore.categories : []

  // Log para debug
  console.log('Filtrando categorias:', categoriesArray)

  // Verificar se o array está vazio
  if (categoriesArray.length === 0) {
    return []
  }

  if (filters.value.type === 'all') {
    return categoriesArray
  }
  return categoriesArray.filter(category => category.type === filters.value.type)
})

// Observar mudanças no array de categorias para debug
watch(() => categoryStore.categories, (newCategories) => {
  console.log('Categorias atualizadas:', newCategories)
}, { deep: true })

// Título do formulário
const formTitle = computed(() => {
  return editedItem.value.id === 0 ? 'Nova Categoria' : 'Editar Categoria'
})

// Carregar categorias ao montar o componente
onMounted(async () => {
  await categoryStore.fetchCategories()
})

// Funções
function getTypeLabel(type: string) {
  switch (type) {
    case 'income': return 'Receita'
    case 'expense': return 'Despesa'
    case 'both': return 'Ambos'
    default: return type
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'income': return 'success'
    case 'expense': return 'error'
    case 'both': return 'info'
    default: return 'grey'
  }
}

function openDialog(item: Category | null = null) {
  if (item) {
    editedItem.value = { ...item }
  } else {
    editedItem.value = { ...defaultItem }
  }
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  // Resetar o formulário
  if (form.value && 'reset' in form.value) {
    (form.value as any)?.reset?.()
  }
  // Aguardar a animação do diálogo fechar
  setTimeout(() => {
    editedItem.value = { ...defaultItem }
  }, 300)
}

async function save() {
  if (!valid.value) return

  try {
    if (editedItem.value.id === 0) {
      // Criar nova categoria
      const { id, ...categoryData } = editedItem.value
      const newCategory = await categoryStore.createCategory(categoryData)

      if (newCategory) {
        showSnackbar('Categoria criada com sucesso!', 'success')
        closeDialog()
      } else {
        showSnackbar(categoryStore.error || 'Erro ao criar categoria', 'error')
      }
    } else {
      // Atualizar categoria existente
      const { id, ...categoryData } = editedItem.value
      const updatedCategory = await categoryStore.updateCategory(id, categoryData)

      if (updatedCategory) {
        showSnackbar('Categoria atualizada com sucesso!', 'success')
        closeDialog()
      } else {
        showSnackbar(categoryStore.error || 'Erro ao atualizar categoria', 'error')
      }
    }
  } catch (error: any) {
    console.error('Erro ao salvar categoria:', error)
    showSnackbar(error.response?.data?.message || 'Erro ao salvar categoria', 'error')
  }
}

function confirmDelete(item: Category) {
  itemToDelete.value = item
  deleteDialog.value = true
}

async function deleteItem() {
  if (!itemToDelete.value) return

  try {
    const success = await categoryStore.deleteCategory(itemToDelete.value.id)

    if (success) {
      showSnackbar('Categoria excluída com sucesso!', 'success')
    } else {
      showSnackbar(categoryStore.error || 'Erro ao excluir categoria', 'error')
    }
  } catch (error: any) {
    console.error('Erro ao excluir categoria:', error)
    showSnackbar(error.response?.data?.message || 'Erro ao excluir categoria', 'error')
  } finally {
    deleteDialog.value = false
    itemToDelete.value = null
  }
}

function showSnackbar(text: string, color: 'success' | 'error' | 'info' = 'success') {
  snackbar.value = {
    show: true,
    text,
    color
  }

  // Log para debug
  console.log(`Snackbar: ${text} (${color})`)
}
</script>