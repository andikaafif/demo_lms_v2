import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, LoginCredentials, LoginResponse } from '@/features/auth/models/types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<AuthUser>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          })

          if (!response.ok) {
            const payload = (await response.json().catch(() => ({}))) as { message?: string }
            const code = payload.message === 'invalidCredentials' ? 'invalidCredentials' : 'generic'
            set({ isLoading: false, error: code })
            throw new Error(code)
          }

          const data = (await response.json()) as LoginResponse
          set({ user: data.user, token: data.token, isLoading: false, error: null })
          return data.user
        } catch (error) {
          const message = error instanceof Error ? error.message : 'generic'
          set({ isLoading: false, error: message === 'invalidCredentials' ? message : 'generic' })
          throw error
        }
      },

      logout: () => {
        void fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
        set({ user: null, token: null, error: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'edulite-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
)
