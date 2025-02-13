import { ref } from 'vue'

export function useAuth() {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  if (token.value) {
    user.value = JSON.parse(localStorage.getItem('user') || '{}')
  }

  return { user, token }
} 
