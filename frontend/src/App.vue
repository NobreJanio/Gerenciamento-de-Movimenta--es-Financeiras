<template>
  <v-app :theme="theme">
    <v-app-bar color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Gerenciamento Financeiro</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
      <v-btn icon v-if="isAuthenticated" @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <NavigationDrawer v-model="drawer" />

    <v-main>
      <v-container fluid>
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" :key="$route.path" />
          </keep-alive>
        </router-view>
      </v-container>

      <!-- Snackbar para mensagens de feedback -->
      <v-snackbar v-model="snackbar.visible" :color="snackbar.color" :timeout="snackbar.timeout">
        {{ snackbar.text }}
        <template v-slot:actions>
          <v-btn variant="text" icon="mdi-close" @click="snackbar.visible = false"></v-btn>
        </template>
      </v-snackbar>
    </v-main>

    <v-footer color="primary" dark app>
      <span class="text-center w-100">&copy; {{ new Date().getFullYear() }} - Gerenciamento de Movimentações
        Financeiras</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useSnackbar } from './composables/useSnackbar'
import { useTheme } from './composables/useTheme'
import NavigationDrawer from './components/NavigationDrawer.vue'

export default defineComponent({
  name: 'App',
  components: {
    NavigationDrawer
  },
  setup() {
    const drawer = ref(false)
    const router = useRouter()
    const authStore = useAuthStore()
    const { snackbar } = useSnackbar()
    const { theme, toggleTheme } = useTheme()

    // Fechar o drawer quando a rota mudar
    watch(() => router.currentRoute.value, () => {
      drawer.value = false
    }, { immediate: true })

    const isAuthenticated = computed(() => authStore.isAuthenticated)

    const logout = async () => {
      await authStore.logout()
      router.push('/login')
    }

    // Redirecionar para login se não estiver autenticado
    watch(
      () => authStore.isAuthenticated,
      (isAuthenticated) => {
        if (!isAuthenticated && router.currentRoute.value.meta.requiresAuth) {
          router.push('/login')
        }
      },
      { immediate: true }
    )

    return {
      drawer,
      theme,
      isAuthenticated,
      toggleTheme,
      logout,
      snackbar
    }
  }
})
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
}
</style>