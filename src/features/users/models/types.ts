export type AccountStatus = 'active' | 'inactive'
export type AcademicStatus = 'active' | 'graduated' | 'transferred'
export type Gender = 'L' | 'P'

export interface Teacher {
  id: string
  name: string
  employeeNumber: string
  email: string
  phone: string
  gender: Gender
  subjectIds: string[]
  homeroomClassId: string | null
  accountStatus: AccountStatus
  username: string
  avatarColor: string
  joinedAt: string
}

export interface ParentInfo {
  fatherName: string
  motherName: string
  guardianName?: string
  phone: string
  email: string
  occupation: string
  address: string
  hasAccount: boolean
}

export interface Student {
  id: string
  name: string
  nis: string
  nisn: string
  classId: string
  gender: Gender
  birthDate: string
  address: string
  academicStatus: AcademicStatus
  avatarColor: string
  enrolledAt: string
  parent: ParentInfo
}

export type TeacherInput = Omit<Teacher, 'id' | 'avatarColor' | 'joinedAt'>
export type StudentInput = Omit<Student, 'id' | 'avatarColor' | 'enrolledAt'>
