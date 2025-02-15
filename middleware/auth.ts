import { useAuthStore } from '@/store/modules/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Initialize the auth store (load token and user from localStorage)
  authStore.initializeAuth()

  const token = authStore.token // Now using the token from the store

  // If there's no token, redirect to the login page
if (!token && to.path !== '/') {
    return navigateTo('/')
  }
})
