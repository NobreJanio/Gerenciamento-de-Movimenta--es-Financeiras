<template>
    <v-navigation-drawer v-model="drawer" temporary>
        <v-list>
            <v-list-item v-if="isAuthenticated" :to="'/dashboard'" :active="$route.path === '/dashboard'">
                <template v-slot:prepend>
                    <v-icon>mdi-view-dashboard</v-icon>
                </template>
                <v-list-item-title>Dashboard</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="isAuthenticated" :to="'/transactions'" :active="$route.path === '/transactions'">
                <template v-slot:prepend>
                    <v-icon>mdi-swap-horizontal</v-icon>
                </template>
                <v-list-item-title>Movimentações</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="isAuthenticated" :to="'/categories'" :active="$route.path === '/categories'">
                <template v-slot:prepend>
                    <v-icon>mdi-tag-multiple</v-icon>
                </template>
                <v-list-item-title>Categorias</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="isAuthenticated" :to="'/reports'" :active="$route.path === '/reports'">
                <template v-slot:prepend>
                    <v-icon>mdi-chart-bar</v-icon>
                </template>
                <v-list-item-title>Relatórios</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="!isAuthenticated" :to="'/login'" :active="$route.path === '/login'">
                <template v-slot:prepend>
                    <v-icon>mdi-login</v-icon>
                </template>
                <v-list-item-title>Login</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="!isAuthenticated" :to="'/register'" :active="$route.path === '/register'">
                <template v-slot:prepend>
                    <v-icon>mdi-account-plus</v-icon>
                </template>
                <v-list-item-title>Registrar</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default defineComponent({
    name: 'NavigationDrawer',
    props: {
        modelValue: {
            type: Boolean,
            required: true
        }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const route = useRoute()
        const authStore = useAuthStore()

        const drawer = computed({
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value)
        })

        const isAuthenticated = computed(() => authStore.isAuthenticated)

        return {
            drawer,
            isAuthenticated,
            route
        }
    }
})
</script>