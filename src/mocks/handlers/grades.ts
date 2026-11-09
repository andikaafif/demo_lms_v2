import { HttpResponse, delay, http } from 'msw'
import type {
  AttitudeGrade,
  AttitudeGradebook,
  GradeItem,
  Gradebook,
  StudentGradeRow,
  SubjectRecap,
  SubjectRecapRow,
} from '@/features/gradebook/models/types'
import { db } from '../data/db'

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round((values.reduce((total, value) => total + value, 0) / values.length) * 10) / 10
}

export const gradesHandlers = [
  http.get('/api/grades', async ({ request }) => {
    await delay(450)
    const url = new URL(request.url)
    const classId = url.searchParams.get('classId')
    const subjectId = url.searchParams.get('subjectId')
    const studentId = url.searchParams.get('studentId')
    const academicYearId = url.searchParams.get('academicYearId')
    const periodId = url.searchParams.get('periodId')

    if (!classId) {
      return HttpResponse.json({ message: 'classIdRequired' }, { status: 400 })
    }

    const schoolClass = db.classes.find((item) => item.id === classId)
    if (!schoolClass) return HttpResponse.json({ message: 'notFound' }, { status: 404 })

    const relevantAssignments = db.assignments
      .filter((item) => item.classId === classId && item.published)
      .filter((item) => (subjectId ? item.subjectId === subjectId : true))
      .filter((item) => (academicYearId ? item.academicYearId === academicYearId : true))
      .filter((item) => (periodId ? item.periodId === periodId : true))
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
      return {
        studentId: id,
        studentName: student?.name ?? '-',
        nis: student?.nis ?? '-',
        items,
        average: average(scored.map((item) => item.score ?? 0)),
        teacherNote: db.teacherNotes[id] ?? '',
      }
    })

    const payload: Gradebook = {
      classId,
      subjectId: subjectId ?? null,
      rows,
      classAverage: average(
        rows.map((row) => row.average).filter((value): value is number => value !== null),
      ),
    }
    return HttpResponse.json(payload)
  }),

  http.get('/api/grades/recap', async ({ request }) => {
    await delay(450)
    const url = new URL(request.url)
    const classId = url.searchParams.get('classId')
    const academicYearId = url.searchParams.get('academicYearId')
    const periodId = url.searchParams.get('periodId')
    if (!classId) return HttpResponse.json({ message: 'classIdRequired' }, { status: 400 })

    const schoolClass = db.classes.find((item) => item.id === classId)
    if (!schoolClass) return HttpResponse.json({ message: 'notFound' }, { status: 404 })

    const relevantAssignments = db.assignments
      .filter((item) => item.classId === classId && item.published)
      .filter((item) => (academicYearId ? item.academicYearId === academicYearId : true))
      .filter((item) => (periodId ? item.periodId === periodId : true))

    const subjectIds = Array.from(new Set(relevantAssignments.map((item) => item.subjectId)))
    const recapSubjects = subjectIds
      .map((id) => db.subjects.find((item) => item.id === id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({ id: item.id, name: item.name, color: item.color }))

    const rows: SubjectRecapRow[] = schoolClass.studentIds.map((studentId) => {
      const student = db.students.find((item) => item.id === studentId)
      const scores: Record<string, number | null> = {}
      recapSubjects.forEach((subject) => {
        const subjectAssignments = relevantAssignments.filter(
          (item) => item.subjectId === subject.id,
        )
        const graded = subjectAssignments
          .map(
            (assignment) =>
              db.submissions.find(
                (item) => item.assignmentId === assignment.id && item.studentId === studentId,
              )?.score ?? null,
          )
          .filter((value): value is number => value !== null)
        scores[subject.id] = average(graded)
      })
      return {
        studentId,
        studentName: student?.name ?? '-',
        nis: student?.nis ?? '-',
        scores,
        average: average(
          Object.values(scores).filter((value): value is number => value !== null),
        ),
      }
    })

    const payload: SubjectRecap = {
      classId,
      academicYearId: academicYearId ?? '',
      periodId: periodId ?? '',
      subjects: recapSubjects,
      rows,
      classAverage: average(
        rows.map((row) => row.average).filter((value): value is number => value !== null),
      ),
    }
    return HttpResponse.json(payload)
  }),

  http.get('/api/grades/attitude', async ({ request }) => {
    await delay(350)
    const url = new URL(request.url)
    const classId = url.searchParams.get('classId')
    const academicYearId = url.searchParams.get('academicYearId')
    const periodId = url.searchParams.get('periodId')
    if (!classId) return HttpResponse.json({ message: 'classIdRequired' }, { status: 400 })
    const schoolClass = db.classes.find((item) => item.id === classId)
    if (!schoolClass) return HttpResponse.json({ message: 'notFound' }, { status: 404 })

    const rows = schoolClass.studentIds.map((studentId) => {
      const student = db.students.find((item) => item.id === studentId)
      const existing = db.attitudeGrades.find((item) => item.studentId === studentId)
      return (
        existing ?? {
          studentId,
          studentName: student?.name ?? '-',
          nis: student?.nis ?? '-',
          grade: 'B' as AttitudeGrade,
          note: '',
        }
      )
    })

    const payload: AttitudeGradebook = {
      classId,
      academicYearId: academicYearId ?? '',
      periodId: periodId ?? '',
      rows,
    }
    return HttpResponse.json(payload)
  }),

  http.put('/api/grades/attitude/:studentId', async ({ params, request }) => {
    await delay(400)
    const body = (await request.json()) as { grade: AttitudeGrade; note: string }
    const index = db.attitudeGrades.findIndex((item) => item.studentId === params.studentId)
    if (index === -1) {
      const student = db.students.find((item) => item.id === params.studentId)
      db.attitudeGrades.push({
        studentId: String(params.studentId),
        studentName: student?.name ?? '-',
        nis: student?.nis ?? '-',
        grade: body.grade,
        note: body.note,
      })
    } else {
      db.attitudeGrades[index] = {
        ...db.attitudeGrades[index],
        grade: body.grade,
        note: body.note,
      }
    }
    return HttpResponse.json({ success: true })
  }),

  http.put('/api/grades/notes/:studentId', async ({ params, request }) => {
    await delay(400)
    const body = (await request.json()) as { note: string }
    db.teacherNotes[String(params.studentId)] = body.note
    return HttpResponse.json({ studentId: params.studentId, note: body.note })
  }),
]
