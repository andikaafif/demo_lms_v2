import { HttpResponse, delay, http } from 'msw'
import type { Announcement, AnnouncementInput } from '@/features/announcements/models/types'
import { db, nextId } from '../data/db'

const audienceFor: Record<string, string[]> = {
  admin: ['all', 'teachers', 'students', 'parents'],
  teacher: ['all', 'teachers'],
  student: ['all', 'students'],
  parent: ['all', 'parents'],
}

export const announcementsHandlers = [
  http.get('/api/announcements', async ({ request }) => {
    await delay(350)
    const url = new URL(request.url)
    const role = url.searchParams.get('role')
    let result = [...db.announcements]
    if (role && audienceFor[role]) {
      result = result.filter((item) => audienceFor[role].includes(item.audience))
    }
    result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.publishedAt.localeCompare(a.publishedAt)
    })
    return HttpResponse.json(result)
  }),

  http.get('/api/announcements/:id', async ({ params }) => {
    await delay(250)
    const announcement = db.announcements.find((item) => item.id === params.id)
    if (!announcement) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    return HttpResponse.json(announcement)
  }),

  http.post('/api/announcements', async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as AnnouncementInput
    const author = db.accounts.find((item) => item.id === body.authorId)
    const created: Announcement = {
      ...body,
      id: nextId('an'),
      authorName: author?.name ?? 'Administrator',
      publishedAt: new Date().toISOString(),
    }
    db.announcements.unshift(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('/api/announcements/:id', async ({ params, request }) => {
    await delay(500)
    const body = (await request.json()) as Partial<AnnouncementInput>
    const index = db.announcements.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.announcements[index] = { ...db.announcements[index], ...body }
    return HttpResponse.json(db.announcements[index])
  }),

  http.delete('/api/announcements/:id', async ({ params }) => {
    await delay(400)
    const index = db.announcements.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.announcements.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),
]
