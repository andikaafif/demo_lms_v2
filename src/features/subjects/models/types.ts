export interface Subject {
  id: string
  name: string
  code: string
  color: string
  description: string
  weeklyHours: number
}

/** Assignment of a subject to a class, taught by a teacher. */
export interface SubjectAssignment {
  id: string
  subjectId: string
  classId: string
  teacherId: string
  schedule: string
  academicYearId: string
  periodId: string
  /** Day of week (0 = Sunday) used by the schedule module. */
  dayOfWeek: number
  startTime: string
  endTime: string
  meeting: number
}

export type SubjectInput = Omit<Subject, 'id'>
export type SubjectAssignmentInput = Omit<SubjectAssignment, 'id'>
