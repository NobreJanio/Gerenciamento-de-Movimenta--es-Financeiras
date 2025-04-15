import { ref, watch } from 'vue'

export function useTheme() {
  const theme = ref(localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light')

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('darkMode', theme.value === 'dark' ? 'true' : 'false')
  }

  return {
    theme,
    toggleTheme
  }
} 