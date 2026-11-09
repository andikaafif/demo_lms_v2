import { HttpResponse, delay, http } from 'msw'
import type {
  Assignment,
  AssignmentInput,
  AssignmentWithStats,
  GradeSubmissionInput,
  SubmitAssignmentInput,
} from '@/features/assignments/models/types'
import { db, nextId } from '../data/db'

function withStats(assignment: Assignment): AssignmentWithStats {
  const schoolClass = db.classes.find((item) => item.id === assignment.classId)
  const totalStudents = schoolClass?.studentIds.length ?? 0
  const related = db.submissions.filter((item) => item.assignmentId === assignment.id)
  return {
    ...assignment,
    totalStudents,
    submittedCount: related.filter((item) => item.status !== 'pending').length,
    gradedCount: related.filter((item) => item.status === 'graded').length,
  }
}

export const assignmentsHandlers = [
  http.get('/api/assignments', async ({ request }) => {
    await delay(400)
    const url = new URL(request.url)
    const classId = url.searchParams.get('classId')
    const subjectId = url.searchParams.get('subjectId')
    const teacherId = url.searchParams.get('teacherId')
    const academicYearId = url.searchParams.get('academicYearId')
    const periodId = url.searchParams.get('periodId')
    const includeDrafts = url.searchParams.get('includeDrafts') === 'true'

    let result = [...db.assignments]
    if (classId) result = result.filter((item) => item.classId === classId)
    if (subjectId) result = result.filter((item) => item.subjectId === subjectId)
    if (teacherId) result = result.filter((item) => item.teacherId === teacherId)
    if (academicYearId) result = result.filter((item) => item.academicYearId === academicYearId)
    if (periodId) result = result.filter((item) => item.periodId === periodId)
    if (!includeDrafts) result = result.filter((item) => item.published)

    result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return HttpResponse.json(result.map(withStats))
  }),

  http.get('/api/assignments/:id', async ({ params }) => {
    await delay(250)
    const assignment = db.assignments.find((item) => item.id === params.id)
    if (!assignment) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    return HttpResponse.json(withStats(assignment))
  }),

  http.post('/api/assignments', async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as AssignmentInput
    const created: Assignment = {
      ...body,
      id: nextId('a'),
      createdAt: new Date().toISOString(),
    }
    db.assignments.unshift(created)
    const schoolClass = db.classes.find((item) => item.id === created.classId)
    schoolClass?.studentIds.forEach((studentId) => {
      db.submissions.push({
        id: nextId('sub'),
        assignmentId: created.id,
        studentId,
        status: 'pending',
        textAnswer: '',
        files: [],
        submittedAt: null,
        score: null,
        feedback: '',
        gradedAt: null,
        answers: {},
      })
    })
    return HttpResponse.json(withStats(created), { status: 201 })
  }),

  http.put('/api/assignments/:id', async ({ params, request }) => {
    await delay(500)
    const body = (await request.json()) as Partial<AssignmentInput>
    const index = db.assignments.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.assignments[index] = { ...db.assignments[index], ...body }
    return HttpResponse.json(withStats(db.assignments[index]))
  }),

  http.delete('/api/assignments/:id', async ({ params }) => {
    await delay(400)
    const index = db.assignments.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.assignments.splice(index, 1)
    db.submissions = db.submissions.filter((item) => item.assignmentId !== params.id)
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/submissions', async ({ request }) => {
    await delay(350)
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    const assignmentId = url.searchParams.get('assignmentId')
    let result = db.submissions
    if (studentId) result = result.filter((item) => item.studentId === studentId)
    if (assignmentId) result = result.filter((item) => item.assignmentId === assignmentId)
    return HttpResponse.json(result)
  }),

  http.post('/api/assignments/:id/submit', async ({ params, request }) => {
    await delay(500)
    const body = (await request.json()) as SubmitAssignmentInput
    const assignment = db.assignments.find((item) => item.id === params.id)
    if (!assignment) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    const index = db.submissions.findIndex(
      (item) => item.assignmentId === params.id && item.studentId === body.studentId,
    )
    const late = new Date(assignment.dueDate).getTime() < Date.now()
    const record = {
      id: index === -1 ? nextId('sub') : db.submissions[index].id,
      assignmentId: String(params.id),
      studentId: body.studentId,
      status: late ? ('late' as const) : ('submitted' as const),
      textAnswer: body.textAnswer,
      files: body.files,
      submittedAt: new Date().toISOString(),
      score: null,
      feedback: '',
      gradedAt: null,
      answers: body.answers ?? {},
    }
    if (index === -1) db.submissions.push(record)
    else db.submissions[index] = record
    return HttpResponse.json(record)
  }),

  http.put('/api/submissions/:id/grade', async ({ params, request }) => {
    await delay(450)
    const body = (await request.json()) as GradeSubmissionInput
    const index = db.submissions.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.submissions[index] = {
      ...db.submissions[index],
      score: body.score,
      feedback: body.feedback,
      status: 'graded',
      gradedAt: new Date().toISOString(),
    }
    return HttpResponse.json(db.submissions[index])
  }),
]
