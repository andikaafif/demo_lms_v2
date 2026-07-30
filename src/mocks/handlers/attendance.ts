import { HttpResponse, delay, http } from 'msw'
import type {
  AttendanceSession,
  AttendanceSessionInput,
  AttendanceStatus,
  AttendanceSummary,
} from '@/features/attendance/models/types'
import { db, nextId } from '../data/db'

function summarize(sessions: AttendanceSession[], studentId?: string): AttendanceSummary {
  const counters: Record<AttendanceStatus, number> = {
    present: 0,
    sick: 0,
    permission: 0,
    absent: 0,
  }
  sessions.forEach((session) => {
    session.entries
      .filter((entry) => (studentId ? entry.studentId === studentId : true))
      .forEach((entry) => {
        counters[entry.status] += 1
      })
  })
  const total = counters.present + counters.sick + counters.permission + counters.absent
  return {
    ...counters,
    total,
    presentRate: total === 0 ? 0 : Math.round((counters.present / total) * 100),
  }
}

export const attendanceHandlers = [
  http.get('/api/attendance', async ({ request }) => {
    await delay(400)
    const url = new URL(request.url)
    const classId = url.searchParams.get('classId')
    const subjectId = url.searchParams.get('subjectId')
    const date = url.searchParams.get('date')
    let result = [...db.attendanceSessions]
    if (classId) result = result.filter((item) => item.classId === classId)
    if (subjectId) result = result.filter((item) => item.subjectId === subjectId)
    if (date) result = result.filter((item) => item.date === date)
    result.sort((a, b) => b.date.localeCompare(a.date))
    return HttpResponse.json(result)
  }),

  http.get('/api/attendance/summary', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const classId = url.searchParams.get('classId')
    const studentId = url.searchParams.get('studentId')
    let sessions = [...db.attendanceSessions]
    if (classId) sessions = sessions.filter((item) => item.classId === classId)
    return HttpResponse.json(summarize(sessions, studentId ?? undefined))
  }),

  http.post('/api/attendance', async ({ request }) => {
    await delay(550)
    const body = (await request.json()) as AttendanceSessionInput
    const existingIndex = db.attendanceSessions.findIndex(
      (item) =>
        item.classId === body.classId && item.subjectId === body.subjectId && item.date === body.date,
    )
    const record: AttendanceSession = {
      ...body,
      id: existingIndex === -1 ? nextId('att') : db.attendanceSessions[existingIndex].id,
      recordedAt: new Date().toISOString(),
    }
    if (existingIndex === -1) {
      db.attendanceSessions.push(record)
    } else {
      db.attendanceSessions[existingIndex] = record
    }
    return HttpResponse.json(record, { status: existingIndex === -1 ? 201 : 200 })
  }),

  http.delete('/api/attendance/:id', async ({ params }) => {
    await delay(350)
    const index = db.attendanceSessions.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.attendanceSessions.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),
]
