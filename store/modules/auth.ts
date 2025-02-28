import { defineStore } from 'pinia'
import axios from 'axios' // Import axios
import { useRouter } from 'vue-router' // If you're using vue-router

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    loading: false, // Use "loading" instead of "isLoading" for consistency
  }),

  actions: {
    // Initialize Auth from localStorage
    initializeAuth() {
      if (typeof window !== 'undefined') {
        console.log('Initializing Auth Store...')
        this.token = localStorage.getItem('token')

        const userData = localStorage.getItem('user')
        if (userData && userData !== 'undefined') {
          try {
            this.user = JSON.parse(userData)
          } catch (error) {
            console.error('Error parsing user data from localStorage:', error)
            this.user = null
          }
        } else {
          this.user = null
        }

        console.log('Token:', localStorage.getItem('token'))
        console.log('User:', this.user)
    
      }
    },

    // Handle login
    async login({ phone, password }: { phone: string; password: string }) {
      this.loading = true
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, { phone, password })

        console.log('API Response:', response)

        // Save token & user info in state and localStorage after successful login
        if (response.data.success) {
          this.token = response.data.data.access_token
          this.user = response.data.data.user

          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
          console.log('Token saved to localStorage:', this.token);
        }

        console.log('Login successful!')
        console.log(this.token)

        // Redirect to the dashboard after login (use the proper method for routing)
        navigateTo('/dashboard');// This is how you'd do it with vue-router

      } catch (error) {
        console.error('Login failed:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }

      this.token = null
      this.user = null

      // Redirect back to the login page if logged out
      const router = useRouter()
      router.push('/') // This is how you'd do it with vue-router
    },
  },
})
