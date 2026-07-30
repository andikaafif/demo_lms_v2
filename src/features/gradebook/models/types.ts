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
