import { HttpResponse, delay, http } from 'msw'
import type { SchoolClass, SchoolClassInput } from '@/features/classes/models/types'
import { db, nextId } from '../data/db'

export const classesHandlers = [
  http.get('/api/classes', async ({ request }) => {
    await delay(350)
    const url = new URL(request.url)
    const teacherId = url.searchParams.get('teacherId')
    const academicYearId = url.searchParams.get('academicYearId')
    const periodId = url.searchParams.get('periodId')
    let result = db.classes
    if (academicYearId) result = result.filter((item) => item.academicYearId === academicYearId)
    if (periodId) result = result.filter((item) => item.periodId === periodId)
    if (teacherId) {
      const taughtClassIds = new Set(
        db.subjectAssignments
          .filter((item) => item.teacherId === teacherId)
          .map((item) => item.classId),
      )
      result = result.filter(
        (item) => item.homeroomTeacherId === teacherId || taughtClassIds.has(item.id),
      )
    }
    return HttpResponse.json(result)
  }),

  http.get('/api/classes/:id', async ({ params }) => {
    await delay(300)
    const schoolClass = db.classes.find((item) => item.id === params.id)
    if (!schoolClass) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    return HttpResponse.json(schoolClass)
  }),

  http.post('/api/classes', async ({ request }) => {
    await delay(450)
    const body = (await request.json()) as SchoolClassInput
    const created: SchoolClass = { ...body, id: nextId('c') }
    db.classes.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('/api/classes/:id', async ({ params, request }) => {
    await delay(450)
    const body = (await request.json()) as Partial<SchoolClassInput>
    const index = db.classes.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.classes[index] = { ...db.classes[index], ...body }
    if (body.homeroomTeacherId !== undefined) {
      db.teachers.forEach((teacher) => {
        if (teacher.homeroomClassId === params.id) teacher.homeroomClassId = null
        if (teacher.id === body.homeroomTeacherId) teacher.homeroomClassId = String(params.id)
      })
    }
    return HttpResponse.json(db.classes[index])
  }),

  http.delete('/api/classes/:id', async ({ params }) => {
    await delay(400)
    const index = db.classes.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.classes.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  http.post('/api/classes/:id/enroll', async ({ params, request }) => {
    await delay(450)
    const body = (await request.json()) as { studentIds: string[] }
    const schoolClass = db.classes.find((item) => item.id === params.id)
    if (!schoolClass) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    body.studentIds.forEach((studentId) => {
      const student = db.students.find((item) => item.id === studentId)
      if (!student) return
      db.classes.forEach((item) => {
        item.studentIds = item.studentIds.filter((id) => id !== studentId)
      })
      schoolClass.studentIds.push(studentId)
      student.classId = schoolClass.id
    })
    return HttpResponse.json(schoolClass)
  }),

  http.delete('/api/classes/:id/enroll/:studentId', async ({ params }) => {
    await delay(350)
    const schoolClass = db.classes.find((item) => item.id === params.id)
    if (!schoolClass) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    schoolClass.studentIds = schoolClass.studentIds.filter((id) => id !== params.studentId)
    return HttpResponse.json(schoolClass)
  }),
]
