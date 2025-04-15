import { ref } from 'vue'

interface SnackbarOptions {
  text: string
  color: string
  timeout?: number
  visible: boolean
}

// Singleton pattern para garantir que o mesmo snackbar seja usado em toda a aplicação
const snackbar = ref<SnackbarOptions>({
  text: '',
  color: 'success',
  timeout: 3000,
  visible: false
})

export function useSnackbar() {
  /**
   * Exibe uma mensagem no snackbar
   * @param text - Texto a ser exibido
   * @param color - Cor do snackbar (success, error, info, warning)
   * @param timeout - Tempo em ms que o snackbar ficará visível
   */
  const showSnackbar = (text: string, color: string = 'success', timeout: number = 3000) => {
    snackbar.value = {
      text,
      color,
      timeout,
      visible: true
    }
  }

  /**
   * Esconde o snackbar
   */
  const hideSnackbar = () => {
    snackbar.value.visible = false
  }

  return {
    snackbar,
    showSnackbar,
    hideSnackbar
  }
}