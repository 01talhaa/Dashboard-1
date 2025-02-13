<template>
  <div class="min-h-screen flex items-center justify-center bg-[#DCE1FF] transition-all duration-300">
    <div class="flex w-full max-w-4xl px-4">
      <!-- Left side - Branding -->
      <div
        class="w-0 sm:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-l-lg hidden sm:flex sm:flex-col sm:justify-center">
        <h1 class="text-white text-4xl font-bold mb-4">Your E-commerce</h1>
        <p class="text-white text-xl">Shop with us and discover amazing deals!</p>
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

          <!-- New Go to Dashboard Button 
          <button
            @click="handleLogin"
            class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 relative overflow-hidden transition-all duration-300 mt-4"
          >
            Go to Dashboard
          </button>-->

          <!-- Social Login Buttons -->
          <div class="mt-6 space-y-4">
            <button @click="handleGoogleLogin"
              class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 group">
              <svg class="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24"
                fill="currentColor">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              Sign in with Google
            </button>
            <button @click="handleFacebookLogin"
              class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 group">
              <svg class="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" fill="currentColor"
                viewBox="0 0 24 24">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Sign in with Facebook
            </button>
          </div>

          <div class="mt-6 text-center">
            <NuxtLink to="/register" class="text-blue-600 dark:text-blue-400 hover:underline">
              Create new account
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    <BubbleLoading v-if="AuthStore.isLoading" class="hidden lg:block" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/modules/auth'



const phone = ref('')
const password = ref('12345678')
const error = ref<string | null>(null)
const AuthStore = useAuthStore()
const router = useRouter()


const handleLogin = async () => {
  try {
    // Call the login action from the store
    await AuthStore.login({ phone: String(phone.value), password: password.value })
  

    // After successful login, navigate to the dashboard
    await router.push('/dashboard')
  } catch (err) {
    error.value = 'Login failed'
    console.error('Error logging in:', err)
  }
}





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
