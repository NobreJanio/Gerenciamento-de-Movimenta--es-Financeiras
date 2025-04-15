<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Registrar</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-alert v-if="authStore.error" type="error" class="mb-4">
              {{ authStore.error }}
            </v-alert>
            <v-form @submit.prevent="register" ref="form">
              <v-text-field
                v-model="name"
                label="Nome"
                name="name"
                prepend-icon="mdi-account"
                type="text"
                :rules="[rules.required]"
              ></v-text-field>

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

              <v-text-field
                v-model="passwordConfirmation"
                label="Confirmar Senha"
                name="password_confirmation"
                prepend-icon="mdi-lock-check"
                type="password"
                :rules="[rules.required, rules.match]"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="register" :loading="authStore.loading">
              Registrar
            </v-btn>
          </v-card-actions>
          <v-card-text class="text-center">
            Já tem uma conta? <router-link to="/login">Faça login</router-link>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

export default defineComponent({
  name: 'RegisterView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const name = ref('')
    const email = ref('')
    const password = ref('')
    const passwordConfirmation = ref('')
    const form = ref<any>(null)

    const rules = {
      required: (v: string) => !!v || 'Campo obrigatório',
      email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail inválido',
      min: (v: string) => v.length >= 8 || 'Mínimo de 8 caracteres',
      match: (v: string) => v === password.value || 'As senhas não coincidem'
    }

    const register = async () => {
      if (!form.value.validate()) return

      const success = await authStore.register(
        name.value,
        email.value,
        password.value,
        passwordConfirmation.value
      )

      if (success) {
        router.push('/dashboard')
      }
    }

    return {
      name,
      email,
      password,
      passwordConfirmation,
      authStore,
      register,
      form,
      rules
    }
  }
})
</script>