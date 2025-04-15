<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-alert v-if="authStore.error" type="error" class="mb-4">
              {{ authStore.error }}
            </v-alert>
            <v-form @submit.prevent="login" ref="form">
              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="mdi-email"
                type="email"
                :rules="[rules.required, rules.email]"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Senha"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                :rules="[rules.required, rules.min]"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="login" :loading="authStore.loading">
              Entrar
            </v-btn>
          </v-card-actions>
          <v-card-text class="text-center">
            Não tem uma conta? <router-link to="/register">Registre-se</router-link>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

export default defineComponent({
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const email = ref('')
    const password = ref('')
    const form = ref<any>(null)

    const rules = {
      required: (v: string) => !!v || 'Campo obrigatório',
      email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail inválido',
      min: (v: string) => v.length >= 8 || 'Mínimo de 8 caracteres'
    }

    const login = async () => {
      if (!form.value.validate()) return

      const success = await authStore.login(email.value, password.value)
      if (success) {
        router.push('/dashboard')
      }
    }

    return {
      email,
      password,
      authStore,
      login,
      form,
      rules
    }
  }
})
</script>