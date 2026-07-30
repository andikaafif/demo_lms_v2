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

    let result = [...db.assignments]
    if (classId) result = result.filter((item) => item.classId === classId)
    if (subjectId) result = result.filter((item) => item.subjectId === subjectId)
    if (teacherId) result = result.filter((item) => item.teacherId === teacherId)
    result.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
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
    const created: Assignment = { ...body, id: nextId('a'), createdAt: new Date().toISOString() }
    db.assignments.push(created)
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
    const assignmentId = url.searchParams.get('assignmentId')
    const studentId = url.searchParams.get('studentId')
    let result = [...db.submissions]
    if (assignmentId) result = result.filter((item) => item.assignmentId === assignmentId)
    if (studentId) result = result.filter((item) => item.studentId === studentId)
    return HttpResponse.json(result)
  }),

  http.post('/api/assignments/:id/submit', async ({ params, request }) => {
    await delay(600)
    const body = (await request.json()) as SubmitAssignmentInput
    const assignment = db.assignments.find((item) => item.id === params.id)
    if (!assignment) return HttpResponse.json({ message: 'notFound' }, { status: 404 })

    const now = new Date()
    const isLate = now.getTime() > new Date(assignment.dueDate).getTime()
    let submission = db.submissions.find(
      (item) => item.assignmentId === params.id && item.studentId === body.studentId,
    )
    if (!submission) {
      submission = {
        id: nextId('sub'),
        assignmentId: String(params.id),
        studentId: body.studentId,
        status: 'pending',
        textAnswer: '',
        files: [],
        submittedAt: null,
        score: null,
        feedback: '',
        gradedAt: null,
      }
      db.submissions.push(submission)
    }
    submission.textAnswer = body.textAnswer
    submission.files = body.files
    submission.submittedAt = now.toISOString()
    submission.status = isLate ? 'late' : 'submitted'
    return HttpResponse.json(submission)
  }),

  http.put('/api/submissions/:id/grade', async ({ params, request }) => {
    await delay(500)
    const body = (await request.json()) as GradeSubmissionInput
    const submission = db.submissions.find((item) => item.id === params.id)
    if (!submission) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    submission.score = body.score
    submission.feedback = body.feedback
    submission.status = 'graded'
    submission.gradedAt = new Date().toISOString()
    return HttpResponse.json(submission)
  }),
]
