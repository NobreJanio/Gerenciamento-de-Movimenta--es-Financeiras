<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4" class="text-center">
        <v-card class="elevation-12">
          <v-card-title class="text-h4 justify-center">
            404
          </v-card-title>
          <v-card-subtitle class="text-h5 mt-2">
            Página não encontrada
          </v-card-subtitle>
          <v-card-text>
            <p>A página que você está procurando não existe ou foi movida.</p>
          </v-card-text>
          <v-card-actions class="justify-center pb-6">
            <v-btn color="primary" to="/" text>
              <v-icon left>mdi-home</v-icon>
              Voltar para a página inicial
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NotFoundView'
})
</script>