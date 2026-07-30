import { HttpResponse, delay, http } from 'msw'
import type { Material, MaterialInput } from '@/features/materials/models/types'
import { db, nextId } from '../data/db'

export const materialsHandlers = [
  http.get('/api/materials', async ({ request }) => {
    await delay(400)
    const url = new URL(request.url)
    const classId = url.searchParams.get('classId')
    const subjectId = url.searchParams.get('subjectId')
    const teacherId = url.searchParams.get('teacherId')
    const search = (url.searchParams.get('search') ?? '').toLowerCase()

    let result = [...db.materials]
    if (classId) result = result.filter((item) => item.classId === classId)
    if (subjectId) result = result.filter((item) => item.subjectId === subjectId)
    if (teacherId) result = result.filter((item) => item.teacherId === teacherId)
    if (search) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search),
      )
    }
    result.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    return HttpResponse.json(result)
  }),

  http.get('/api/materials/:id', async ({ params }) => {
    await delay(250)
    const material = db.materials.find((item) => item.id === params.id)
    if (!material) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    return HttpResponse.json(material)
  }),

  http.post('/api/materials', async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as MaterialInput
    const created: Material = {
      ...body,
      id: nextId('m'),
      publishedAt: new Date().toISOString(),
      viewCount: 0,
    }
    db.materials.unshift(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('/api/materials/:id', async ({ params, request }) => {
    await delay(500)
    const body = (await request.json()) as Partial<MaterialInput>
    const index = db.materials.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.materials[index] = { ...db.materials[index], ...body }
    return HttpResponse.json(db.materials[index])
  }),

  http.delete('/api/materials/:id', async ({ params }) => {
    await delay(400)
    const index = db.materials.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.materials.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  http.post('/api/materials/:id/view', async ({ params }) => {
    await delay(150)
    const material = db.materials.find((item) => item.id === params.id)
    if (!material) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    material.viewCount += 1
    return HttpResponse.json(material)
  }),
]
