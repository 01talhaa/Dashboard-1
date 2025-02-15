// middleware/auth.global.js
import { useAuthStore } from '@/store/modules/auth'
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip on server side
  if (process.server) return

  const authStore = useAuthStore()
  
    // Initialize the auth store (load token and user from localStorage)
    authStore.initializeAuth()

  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  // Define protected routes
  const protectedRoutes = [
    '/dashboard', 
    '/profile', 
    '/settings',
    '/billing',
    '/customers',
    '/luckyspin'
  ]

  // Check if route requires auth
  const requiresAuth = protectedRoutes.includes(to.path)

   
  // Redirect logic
//   if (!isAuthenticated && requiresAuth) {
//     return navigateTo('/login')
//   }


  // Prevent authenticated users from accessing login
  if (isAuthenticated && to.path === '/login') {
    return navigateTo('/dashboard')
  }
});
