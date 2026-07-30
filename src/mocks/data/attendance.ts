import type { AttendanceEntry, AttendanceSession, AttendanceStatus } from '@/features/attendance/models/types'
import { recentWeekdayKeys } from './dateHelpers'
import { students } from './users'

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

const dayKeys = recentWeekdayKeys(10)
const subjectRotation = ['s-mtk', 's-ipas', 's-bind', 's-bing', 's-pjok']
const teacherBySubject: Record<string, string> = {
  's-mtk': 't-1',
  's-ipas': 't-1',
  's-bind': 't-2',
  's-bing': 't-2',
  's-pjok': 't-3',
}

export const attendanceSessions: AttendanceSession[] = dayKeys.map((date, dayIndex) => {
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
    date,
    entries,
    recordedAt: `${date}T08:15:00.000Z`,
  }
})
