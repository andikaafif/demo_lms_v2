export type AttendanceStatus = 'present' | 'sick' | 'permission' | 'absent'

export interface AttendanceEntry {
  studentId: string
  status: AttendanceStatus
  note: string
}

export interface AttendanceSession {
  id: string
  classId: string
  subjectId: string
  teacherId: string
  date: string
  entries: AttendanceEntry[]
  recordedAt: string
}

export type AttendanceSessionInput = Omit<AttendanceSession, 'id' | 'recordedAt'>

export interface AttendanceSummary {
  present: number
  sick: number
  permission: number
  absent: number
  total: number
  presentRate: number
}
