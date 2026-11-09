export type AttendanceStatus = 'present' | 'sick' | 'permission' | 'absent'

export interface AttendanceEntry {
  studentId: string
  status: AttendanceStatus
  note: string
}

export interface AttendanceAuditEntry {
  id: string
  studentId: string
  oldStatus: AttendanceStatus
  newStatus: AttendanceStatus
  reason: string
  updatedBy: string
  updatedByName: string
  updatedAt: string
}

export interface AttendanceSession {
  id: string
  classId: string
  subjectId: string
  teacherId: string
  academicYearId: string
  periodId: string
  date: string
  /** Meeting number for the subject in this period. */
  meeting: number
  startTime: string
  endTime: string
  entries: AttendanceEntry[]
  recordedAt: string
  submitted: boolean
  /** True once the lesson slot has ended, enabling admin override. */
  canOverride?: boolean
  audit: AttendanceAuditEntry[]
}

export type AttendanceSessionInput = Omit<
  AttendanceSession,
  'id' | 'recordedAt' | 'submitted' | 'audit'
>

export interface AttendanceSummary {
  present: number
  sick: number
  permission: number
  absent: number
  total: number
  presentRate: number
}

/** Row shown in the admin attendance monitoring table. */
export interface AttendanceMonitorRow {
  sessionId: string
  classId: string
  className: string
  subjectId: string
  subjectName: string
  teacherId: string
  teacherName: string
  date: string
  meeting: number
  startTime: string
  endTime: string
  submitted: boolean
  canOverride: boolean
  present: number
  sick: number
  permission: number
  absent: number
  total: number
}
