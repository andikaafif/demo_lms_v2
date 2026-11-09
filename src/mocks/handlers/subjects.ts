import { HttpResponse, delay, http } from 'msw'
import type {
  Subject,
  SubjectAssignment,
  SubjectAssignmentInput,
  SubjectInput,
} from '@/features/subjects/models/types'
import { db, nextId } from '../data/db'

export const subjectsHandlers = [
  http.get('/api/subjects', async () => {
    await delay(300)
    return HttpResponse.json(db.subjects)
  }),

  http.post('/api/subjects', async ({ request }) => {
    await delay(450)
    const body = (await request.json()) as SubjectInput
    const created: Subject = { ...body, id: nextId('s') }
    db.subjects.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('/api/subjects/:id', async ({ params, request }) => {
    await delay(450)
    const body = (await request.json()) as Partial<SubjectInput>
    const index = db.subjects.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.subjects[index] = { ...db.subjects[index], ...body }
    return HttpResponse.json(db.subjects[index])
  }),

  http.delete('/api/subjects/:id', async ({ params }) => {
    await delay(400)
    const index = db.subjects.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.subjects.splice(index, 1)
    db.subjectAssignments = db.subjectAssignments.filter((item) => item.subjectId !== params.id)
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/subject-assignments', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const teacherId = url.searchParams.get('teacherId')
    const classId = url.searchParams.get('classId')
    const academicYearId = url.searchParams.get('academicYearId')
    const periodId = url.searchParams.get('periodId')
    let result = db.subjectAssignments
    if (teacherId) result = result.filter((item) => item.teacherId === teacherId)
    if (classId) result = result.filter((item) => item.classId === classId)
    if (academicYearId) result = result.filter((item) => item.academicYearId === academicYearId)
    if (periodId) result = result.filter((item) => item.periodId === periodId)
    return HttpResponse.json(result)
  }),

  http.post('/api/subject-assignments', async ({ request }) => {
    await delay(450)
    const body = (await request.json()) as SubjectAssignmentInput
    const created: SubjectAssignment = { ...body, id: nextId('sa') }
    db.subjectAssignments.push(created)
    const teacher = db.teachers.find((item) => item.id === created.teacherId)
    if (teacher && !teacher.subjectIds.includes(created.subjectId)) {
      teacher.subjectIds.push(created.subjectId)
    }
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('/api/subject-assignments/:id', async ({ params, request }) => {
    await delay(450)
    const body = (await request.json()) as Partial<SubjectAssignmentInput>
    const index = db.subjectAssignments.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.subjectAssignments[index] = { ...db.subjectAssignments[index], ...body }
    return HttpResponse.json(db.subjectAssignments[index])
  }),

  http.delete('/api/subject-assignments/:id', async ({ params }) => {
    await delay(400)
    const index = db.subjectAssignments.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.subjectAssignments.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),
]
