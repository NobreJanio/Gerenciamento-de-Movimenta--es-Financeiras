import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/RegisterView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('../views/transactions/TransactionsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/categories/CategoriesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/reports/ReportsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (!requiresAuth && authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router