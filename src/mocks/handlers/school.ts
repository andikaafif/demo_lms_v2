import { HttpResponse, delay, http } from 'msw'
import type { SchoolProfile } from '@/features/school-profile/models/types'
import { db } from '../data/db'

export const schoolHandlers = [
  http.get('/api/school', async () => {
    await delay(350)
    return HttpResponse.json(db.school)
  }),

  http.put('/api/school', async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as Partial<SchoolProfile>
    db.school = { ...db.school, ...body, id: db.school.id }
    return HttpResponse.json(db.school)
  }),
]
