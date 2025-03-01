<template>
  <div class="min-h-screen flex items-center justify-center bg-[#DCE1FF] transition-all duration-300">
    <div class="flex w-full max-w-4xl px-4">
      <!-- Left side - Branding -->
      <div
        class="w-0 sm:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-l-lg hidden sm:flex sm:flex-col sm:justify-center">
        <h1 class="text-white text-4xl font-bold mb-4">Admin Panel</h1>
        
      </div>

      <!-- Right side - Login Form -->
      <div class="w-full sm:w-1/2 p-1 bg-white dark:bg-gray-800 rounded-lg sm:rounded-l-none shadow-md relative">
        <LoaderComponent v-if="AuthStore.isLoading" :isLoading="true" />

        <div class="p-8">
          <h2 class="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
            {{ AuthStore.isLoading ? 'Logging In!' : 'Log In' }}
          </h2>
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <input v-model="phone" type="text" id="phone" placeholder="Phone Number" required 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                :disabled="AuthStore.isLoading" />
            </div>
            <div>
              <input v-model="password" type="password" id="password" placeholder="Password" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                :disabled="AuthStore.isLoading" />
            </div>
            <button type="submit"
              class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative overflow-hidden transition-all duration-300"
              :disabled="AuthStore.isLoading">
              <span class="relative" :class="{ invisible: AuthStore.isLoading }">Log In</span>
              <SpinnerLoader v-if="AuthStore.isLoading" />
            </button>

            <!-- Error message -->
            <div class="min-h-[24px] text-red-600 dark:text-red-400 text-sm text-center">
              {{ error }}
            </div>
          </form>
          
        </div>
      </div>
    </div>
    <BubbleLoading v-if="AuthStore.isLoading" class="hidden lg:block" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/modules/auth'
import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'

const phone = ref('')
const password = ref('12345678')
const error = ref<string | null>(null)
const AuthStore = useAuthStore()
const router = useRouter()

// Add middleware check on component mount
onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    router.push('/dashboard')
  }
})

const handleLogin = async () => {
  try {
    error.value = null
    await AuthStore.login({ 
      phone: String(phone.value), 
      password: password.value 
    })

    // Store token after successful login
    const token = AuthStore.getToken
    if (token) {
      localStorage.setItem('token', token)
      await router.push('/dashboard')
    } else {
      throw new Error('No token received')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed'
    console.error('Error logging in:', err)
  }
}

// Clean up on component unmount
onUnmounted(() => {
  error.value = null
  phone.value = ''
  password.value = ''
})

const handleGoogleLogin = () => {
  console.log('Google login clicked')
}

const handleFacebookLogin = () => {
  console.log('Facebook login clicked')
}

</script>

<style scoped>
body {
  overflow: hidden;
}

.animate-pulse {
  display: flex;
  gap: 1rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }
}
</style>



