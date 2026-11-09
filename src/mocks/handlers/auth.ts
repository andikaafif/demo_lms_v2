import { HttpResponse, delay, http } from 'msw'
import type { AuthUser, LoginCredentials, LoginResponse } from '@/features/auth/models/types'
import { db } from '../data/db'

function toAuthUser(accountId: string): AuthUser | null {
  const account = db.accounts.find((item) => item.id === accountId)
  if (!account) return null
  const user: AuthUser = { ...account }
  delete (user as { password?: string }).password
  if (user.role === 'teacher' && user.teacherId) {
    const teacher = db.teachers.find((item) => item.id === user.teacherId)
    return { ...user, homeroomClassId: teacher?.homeroomClassId ?? null }
  }
  return user
}

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

    const user = toAuthUser(account.id)
    if (!user) {
      return HttpResponse.json({ message: 'invalidCredentials' }, { status: 401 })
    }
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
    if (!userId) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    const user = toAuthUser(userId)
    if (!user) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    return HttpResponse.json(user)
  }),
]
