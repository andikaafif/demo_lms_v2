import { HttpResponse, delay, http } from 'msw'
import type { LoginCredentials, LoginResponse } from '@/features/auth/models/types'
import { db } from '../data/db'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    await delay(600)
    const body = (await request.json()) as LoginCredentials
    const account = db.accounts.find(
      (item) => item.username === body.username && item.password === body.password,
    )

    if (!account) {
      return HttpResponse.json(
        { message: 'invalidCredentials', code: 'AUTH_INVALID' },
        { status: 401 },
      )
    }

    const { password: _password, ...user } = account
    const payload: LoginResponse = {
      token: `demo-token.${account.id}.${Date.now()}`,
      user,
    }
    return HttpResponse.json(payload)
  }),

  http.post('/api/auth/logout', async () => {
    await delay(200)
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/auth/me', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const account = db.accounts.find((item) => item.id === userId)
    if (!account) {
      return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    }
    const { password: _password, ...user } = account
    return HttpResponse.json(user)
  }),
]
