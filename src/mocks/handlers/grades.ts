import { HttpResponse, delay, http } from 'msw'
import type { GradeItem, Gradebook, StudentGradeRow } from '@/features/gradebook/models/types'
import { db } from '../data/db'

export const gradesHandlers = [
  http.get('/api/grades', async ({ request }) => {
    await delay(450)
    const url = new URL(request.url)
    const classId = url.searchParams.get('classId')
    const subjectId = url.searchParams.get('subjectId')
    const studentId = url.searchParams.get('studentId')

    if (!classId) {
      return HttpResponse.json({ message: 'classIdRequired' }, { status: 400 })
    }

    const schoolClass = db.classes.find((item) => item.id === classId)
    if (!schoolClass) return HttpResponse.json({ message: 'notFound' }, { status: 404 })

    const relevantAssignments = db.assignments
      .filter((item) => item.classId === classId)
      .filter((item) => (subjectId ? item.subjectId === subjectId : true))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

    const studentIds = studentId
      ? schoolClass.studentIds.filter((id) => id === studentId)
      : schoolClass.studentIds

    const rows: StudentGradeRow[] = studentIds.map((id) => {
      const student = db.students.find((item) => item.id === id)
      const items: GradeItem[] = relevantAssignments.map((assignment) => {
        const submission = db.submissions.find(
          (item) => item.assignmentId === assignment.id && item.studentId === id,
        )
        return {
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          subjectId: assignment.subjectId,
          maxScore: assignment.maxScore,
          score: submission?.status === 'graded' ? submission.score : null,
          gradedAt: submission?.gradedAt ?? null,
        }
      })
      const scored = items.filter((item) => item.score !== null)
      const average =
        scored.length === 0
          ? null
          : Math.round(
              (scored.reduce((total, item) => total + (item.score ?? 0), 0) / scored.length) * 10,
            ) / 10
      return {
        studentId: id,
        studentName: student?.name ?? '-',
        nis: student?.nis ?? '-',
        items,
        average,
        teacherNote: db.teacherNotes[id] ?? '',
      }
    })

    const averages = rows.map((row) => row.average).filter((value): value is number => value !== null)
    const classAverage =
      averages.length === 0
        ? null
        : Math.round((averages.reduce((total, value) => total + value, 0) / averages.length) * 10) / 10

    const payload: Gradebook = { classId, subjectId: subjectId ?? null, rows, classAverage }
    return HttpResponse.json(payload)
  }),

  http.put('/api/grades/notes/:studentId', async ({ params, request }) => {
    await delay(400)
    const body = (await request.json()) as { note: string }
    db.teacherNotes[String(params.studentId)] = body.note
    return HttpResponse.json({ studentId: params.studentId, note: body.note })
  }),
]
