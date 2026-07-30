import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { useAuthStore } from '@/store/authStore'
import { useSnackbarStore } from '@/store/snackbarStore'
import { demoCredentials } from '@/mocks/data/users'
import type { LoginCredentials } from '../models/types'

export const loginSchema = z.object({
  username: z.string().min(1, 'auth.usernameRequired').min(3, 'auth.usernameMin'),
  password: z.string().min(1, 'auth.passwordRequired').min(6, 'auth.passwordMin'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

interface AuthViewModel {
  form: UseFormReturn<LoginFormValues>
  isLoading: boolean
  error: string | null
  demoAccounts: typeof demoCredentials
  submit: (values: LoginFormValues) => Promise<void>
  fillDemoAccount: (credentials: LoginCredentials) => void
  clearError: () => void
}

export function useAuthViewModel(): AuthViewModel {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)
  const notify = useSnackbarStore((state) => state.notify)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
    mode: 'onTouched',
  })

  const submit = useCallback(
    async (values: LoginFormValues) => {
      try {
        await login(values)
        notify(t('auth.loginSuccess'), 'success')
        navigate('/dashboard', { replace: true })
      } catch {
        // Error state is surfaced through the auth store.
      }
    },
    [login, navigate, notify, t],
  )

  const fillDemoAccount = useCallback(
    (credentials: LoginCredentials) => {
      clearError()
      form.setValue('username', credentials.username, { shouldValidate: true })
      form.setValue('password', credentials.password, { shouldValidate: true })
    },
    [clearError, form],
  )

  return {
    form,
    isLoading,
    error,
    demoAccounts: demoCredentials,
    submit,
    fillDemoAccount,
    clearError,
  }
}
