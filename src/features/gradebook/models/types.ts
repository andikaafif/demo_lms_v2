export interface GradeItem {
  assignmentId: string
  assignmentTitle: string
  subjectId: string
  maxScore: number
  score: number | null
  gradedAt: string | null
}

export interface StudentGradeRow {
  studentId: string
  studentName: string
  nis: string
  items: GradeItem[]
  average: number | null
  teacherNote: string
}

export interface Gradebook {
  classId: string
  subjectId: string | null
  rows: StudentGradeRow[]
  classAverage: number | null
}

export type AttitudeGrade = 'A' | 'B' | 'C' | 'D'

export interface AttitudeGradeRow {
  studentId: string
  studentName: string
  nis: string
  grade: AttitudeGrade
  note: string
}

export interface AttitudeGradebook {
  classId: string
  academicYearId: string
  periodId: string
  rows: AttitudeGradeRow[]
}

/** Subject-matrix recap used by the admin grade report. */
export interface SubjectRecapRow {
  studentId: string
  studentName: string
  nis: string
  scores: Record<string, number | null>
  average: number | null
}

export interface SubjectRecap {
  classId: string
  academicYearId: string
  periodId: string
  subjects: { id: string; name: string; color: string }[]
  rows: SubjectRecapRow[]
  classAverage: number | null
}
