import { HttpResponse, delay, http } from 'msw'
import type {
  AttendanceAuditEntry,
  AttendanceMonitorRow,
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

/** A session can be overridden once its lesson slot has ended. */
function lessonEnded(session: AttendanceSession): boolean {
  const end = new Date(`${session.date}T${session.endTime}:00`)
  if (Number.isNaN(end.getTime())) return true
  return Date.now() >= end.getTime()
}

function toMonitorRow(session: AttendanceSession): AttendanceMonitorRow {
  const schoolClass = db.classes.find((item) => item.id === session.classId)
  const subject = db.subjects.find((item) => item.id === session.subjectId)
  const teacher = db.teachers.find((item) => item.id === session.teacherId)
  const summary = summarize([session])
  return {
    sessionId: session.id,
    classId: session.classId,
    className: schoolClass?.name ?? '-',
    subjectId: session.subjectId,
    subjectName: subject?.name ?? '-',
    teacherId: session.teacherId,
    teacherName: teacher?.name ?? '-',
    date: session.date,
    meeting: session.meeting,
    startTime: session.startTime,
    endTime: session.endTime,
    submitted: session.submitted,
    canOverride: lessonEnded(session),
    present: summary.present,
    sick: summary.sick,
    permission: summary.permission,
    absent: summary.absent,
    total: summary.total,
  }
}

export const attendanceHandlers = [
  http.get('/api/attendance', async ({ request }) => {
    await delay(400)
    const url = new URL(request.url)
    const classId = url.searchParams.get('classId')
    const subjectId = url.searchParams.get('subjectId')
    const date = url.searchParams.get('date')
    const academicYearId = url.searchParams.get('academicYearId')
    const periodId = url.searchParams.get('periodId')
    let result = [...db.attendanceSessions]
    if (classId) result = result.filter((item) => item.classId === classId)
    if (subjectId) result = result.filter((item) => item.subjectId === subjectId)
    if (date) result = result.filter((item) => item.date === date)
    if (academicYearId) result = result.filter((item) => item.academicYearId === academicYearId)
    if (periodId) result = result.filter((item) => item.periodId === periodId)
    result.sort((a, b) => b.date.localeCompare(a.date))
    return HttpResponse.json(
      result.map((session) => ({ ...session, canOverride: lessonEnded(session) })),
    )
  }),

  http.get('/api/attendance/monitor', async ({ request }) => {
    await delay(400)
    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    const classId = url.searchParams.get('classId')
    const subjectId = url.searchParams.get('subjectId')
    const academicYearId = url.searchParams.get('academicYearId')
    const periodId = url.searchParams.get('periodId')
    const search = (url.searchParams.get('search') ?? '').toLowerCase()

    let result = [...db.attendanceSessions]
    if (date) result = result.filter((item) => item.date === date)
    if (classId) result = result.filter((item) => item.classId === classId)
    if (subjectId) result = result.filter((item) => item.subjectId === subjectId)
    if (academicYearId) result = result.filter((item) => item.academicYearId === academicYearId)
    if (periodId) result = result.filter((item) => item.periodId === periodId)

    let rows = result.map(toMonitorRow)
    if (search) {
      rows = rows.filter(
        (row) =>
          row.className.toLowerCase().includes(search) ||
          row.subjectName.toLowerCase().includes(search) ||
          row.teacherName.toLowerCase().includes(search),
      )
    }
    rows.sort((a, b) => a.startTime.localeCompare(b.startTime))
    return HttpResponse.json(rows)
  }),

  http.get('/api/attendance/summary', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const classId = url.searchParams.get('classId')
    const studentId = url.searchParams.get('studentId')
    const academicYearId = url.searchParams.get('academicYearId')
    const periodId = url.searchParams.get('periodId')
    let sessions = [...db.attendanceSessions]
    if (classId) sessions = sessions.filter((item) => item.classId === classId)
    if (academicYearId) sessions = sessions.filter((item) => item.academicYearId === academicYearId)
    if (periodId) sessions = sessions.filter((item) => item.periodId === periodId)
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
      submitted: true,
      audit: existingIndex === -1 ? [] : db.attendanceSessions[existingIndex].audit,
    }
    if (existingIndex === -1) {
      db.attendanceSessions.push(record)
    } else {
      db.attendanceSessions[existingIndex] = record
    }
    return HttpResponse.json(record, { status: existingIndex === -1 ? 201 : 200 })
  }),

  http.put('/api/attendance/:id/override', async ({ params, request }) => {
    await delay(500)
    const body = (await request.json()) as {
      entries: { studentId: string; status: AttendanceStatus; note: string }[]
      reason: string
      updatedBy: string
      updatedByName: string
    }
    const session = db.attendanceSessions.find((item) => item.id === params.id)
    if (!session) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    if (!lessonEnded(session)) {
      return HttpResponse.json({ message: 'overrideNotAllowed' }, { status: 409 })
    }

    const audit: AttendanceAuditEntry[] = []
    body.entries.forEach((next) => {
      const previous = session.entries.find((entry) => entry.studentId === next.studentId)
      if (previous && previous.status !== next.status) {
        audit.push({
          id: nextId('aud'),
          studentId: next.studentId,
          oldStatus: previous.status,
          newStatus: next.status,
          reason: body.reason,
          updatedBy: body.updatedBy,
          updatedByName: body.updatedByName,
          updatedAt: new Date().toISOString(),
        })
      }
    })

    session.entries = body.entries
    session.audit = [...session.audit, ...audit]
    session.submitted = true
    return HttpResponse.json(session)
  }),

  http.delete('/api/attendance/:id', async ({ params }) => {
    await delay(350)
    const index = db.attendanceSessions.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.attendanceSessions.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),
]
