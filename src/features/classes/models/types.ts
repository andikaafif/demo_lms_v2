export type ClassStatus = 'active' | 'archived'

export interface SchoolClass {
  id: string
  name: string
  grade: number
  academicYearId: string
  periodId: string
  homeroomTeacherId: string | null
  studentIds: string[]
  room: string
  status: ClassStatus
}

export type SchoolClassInput = Omit<SchoolClass, 'id'>
