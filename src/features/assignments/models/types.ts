export type SubmissionStatus = 'pending' | 'submitted' | 'graded' | 'late'

export interface SubmissionFile {
  id: string
  name: string
  sizeKb: number
  url: string
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  status: SubmissionStatus
  textAnswer: string
  files: SubmissionFile[]
  submittedAt: string | null
  score: number | null
  feedback: string
  gradedAt: string | null
  /** Answers keyed by dynamic field id. */
  answers: Record<string, string | string[]>
}

export type AssignmentFieldType =
  | 'shortAnswer'
  | 'longAnswer'
  | 'multipleChoice'
  | 'checkbox'
  | 'dropdown'
  | 'fileUpload'
  | 'date'
  | 'number'

export interface AssignmentField {
  id: string
  type: AssignmentFieldType
  label: string
  required: boolean
  options: string[]
}

export interface Assignment {
  id: string
  title: string
  description: string
  subjectId: string
  classId: string
  teacherId: string
  academicYearId: string
  periodId: string
  meeting: number
  maxScore: number
  dueDate: string
  createdAt: string
  allowFileUpload: boolean
  allowTextAnswer: boolean
  published: boolean
  fields: AssignmentField[]
}

export interface AssignmentWithStats extends Assignment {
  totalStudents: number
  submittedCount: number
  gradedCount: number
}

export type AssignmentInput = Omit<Assignment, 'id' | 'createdAt'>

export interface GradeSubmissionInput {
  score: number
  feedback: string
}

export interface SubmitAssignmentInput {
  studentId: string
  textAnswer: string
  files: SubmissionFile[]
  answers?: Record<string, string | string[]>
}
