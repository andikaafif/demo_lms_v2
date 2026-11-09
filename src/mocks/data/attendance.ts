import type { AttendanceEntry, AttendanceSession, AttendanceStatus } from '@/features/attendance/models/types'
import { dateKeyFromNow, recentWeekdayKeys } from './dateHelpers'
import { students } from './users'

const ACTIVE_YEAR = 'ay-2025-2026'
const ACTIVE_PERIOD = 'ap-2025-2026-odd'

const class5eStudents = students.filter((student) => student.classId === 'c-5e')

const noteByStatus: Record<AttendanceStatus, string> = {
  present: '',
  sick: 'Surat keterangan sakit dari orang tua',
  permission: 'Izin acara keluarga',
  absent: 'Tanpa keterangan',
}

/** Deterministic pseudo-random so the demo data is stable within a session. */
function pick(dayIndex: number, studentIndex: number): AttendanceStatus {
  const seed = (dayIndex * 7 + studentIndex * 5 + 3) % 29
  if (seed === 4 || seed === 21) return 'sick'
  if (seed === 11) return 'permission'
  if (seed === 18) return 'absent'
  return 'present'
}

const today = dateKeyFromNow(0)
const dayKeys = recentWeekdayKeys(10).filter((key) => key !== today)
const subjectRotation = ['s-mtk', 's-ipas', 's-bind', 's-bing', 's-pjok']
const teacherBySubject: Record<string, string> = {
  's-mtk': 't-1',
  's-ipas': 't-1',
  's-bind': 't-2',
  's-bing': 't-2',
  's-pjok': 't-3',
}
const timeBySubject: Record<string, { startTime: string; endTime: string }> = {
  's-mtk': { startTime: '07:30', endTime: '09:00' },
  's-ipas': { startTime: '09:30', endTime: '11:00' },
  's-bind': { startTime: '07:30', endTime: '09:00' },
  's-bing': { startTime: '10:00', endTime: '11:00' },
  's-pjok': { startTime: '07:00', endTime: '08:30' },
}

const historicalSessions: AttendanceSession[] = dayKeys.map((date, dayIndex) => {
  const subjectId = subjectRotation[dayIndex % subjectRotation.length]
  const entries: AttendanceEntry[] = class5eStudents.map((student, studentIndex) => {
    const status = pick(dayIndex, studentIndex)
    return { studentId: student.id, status, note: noteByStatus[status] }
  })
  return {
    id: `att-${date}-${subjectId}`,
    classId: 'c-5e',
    subjectId,
    teacherId: teacherBySubject[subjectId],
    academicYearId: ACTIVE_YEAR,
    periodId: ACTIVE_PERIOD,
    date,
    meeting: dayIndex + 1,
    startTime: timeBySubject[subjectId].startTime,
    endTime: timeBySubject[subjectId].endTime,
    entries,
    recordedAt: `${date}T08:15:00.000Z`,
    submitted: true,
    audit: [],
  }
})

/** Today's sessions so the admin monitoring screen has live data. */
const todayPlan = [
  { subjectId: 's-mtk', teacherId: 't-1', startTime: '07:30', endTime: '09:00', submitted: true },
  { subjectId: 's-ipas', teacherId: 't-1', startTime: '09:30', endTime: '11:00', submitted: false },
  { subjectId: 's-bind', teacherId: 't-2', startTime: '07:30', endTime: '09:00', submitted: true },
  { subjectId: 's-pjok', teacherId: 't-3', startTime: '07:00', endTime: '08:30', submitted: false },
]

const todaySessions: AttendanceSession[] = todayPlan.map((plan, index) => {
  const entries: AttendanceEntry[] = class5eStudents.map((student, studentIndex) => {
    const status = pick(index + 20, studentIndex)
    return { studentId: student.id, status, note: noteByStatus[status] }
  })
  return {
    id: `att-${today}-${plan.subjectId}`,
    classId: 'c-5e',
    subjectId: plan.subjectId,
    teacherId: plan.teacherId,
    academicYearId: ACTIVE_YEAR,
    periodId: ACTIVE_PERIOD,
    date: today,
    meeting: 9 + index,
    startTime: plan.startTime,
    endTime: plan.endTime,
    entries,
    recordedAt: `${today}T08:15:00.000Z`,
    submitted: plan.submitted,
    audit: [],
  }
})

export const attendanceSessions: AttendanceSession[] = [...historicalSessions, ...todaySessions]
