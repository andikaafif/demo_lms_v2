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
}

export type SubjectInput = Omit<Subject, 'id'>
export type SubjectAssignmentInput = Omit<SubjectAssignment, 'id'>
