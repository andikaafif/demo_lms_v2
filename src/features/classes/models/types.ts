export type ClassStatus = 'active' | 'archived'

export interface SchoolClass {
  id: string
  name: string
  grade: number
  academicYear: string
  homeroomTeacherId: string | null
  studentIds: string[]
  room: string
  status: ClassStatus
}

export type SchoolClassInput = Omit<SchoolClass, 'id'>
