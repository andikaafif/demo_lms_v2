import type { Announcement } from '@/features/announcements/models/types'
import type { Assignment, Submission } from '@/features/assignments/models/types'
import type { AttendanceSession } from '@/features/attendance/models/types'
import type { SchoolClass } from '@/features/classes/models/types'
import type { Material } from '@/features/materials/models/types'
import type { SchoolProfile } from '@/features/school-profile/models/types'
import type { Subject, SubjectAssignment } from '@/features/subjects/models/types'
import type { Student, Teacher } from '@/features/users/models/types'

import { announcements } from './announcements'
import { assignments, submissions } from './assignments'
import { attendanceSessions } from './attendance'
import { classes } from './classes'
import { materials } from './materials'
import { school } from './school'
import { subjectAssignments, subjects } from './subjects'
import { teacherNotes } from './grades'
import { accounts, students, teachers, type Account } from './users'

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export interface MockDatabase {
  school: SchoolProfile
  accounts: Account[]
  teachers: Teacher[]
  students: Student[]
  classes: SchoolClass[]
  subjects: Subject[]
  subjectAssignments: SubjectAssignment[]
  materials: Material[]
  assignments: Assignment[]
  submissions: Submission[]
  attendanceSessions: AttendanceSession[]
  announcements: Announcement[]
  teacherNotes: Record<string, string>
}

export const db: MockDatabase = {
  school: clone(school),
  accounts: clone(accounts),
  teachers: clone(teachers),
  students: clone(students),
  classes: clone(classes),
  subjects: clone(subjects),
  subjectAssignments: clone(subjectAssignments),
  materials: clone(materials),
  assignments: clone(assignments),
  submissions: clone(submissions),
  attendanceSessions: clone(attendanceSessions),
  announcements: clone(announcements),
  teacherNotes: clone(teacherNotes),
}

let counter = 1000
export const nextId = (prefix: string): string => {
  counter += 1
  return `${prefix}-${counter}`
}

const AVATAR_PALETTE = [
  '#3F51B5',
  '#E91E63',
  '#009688',
  '#FF9800',
  '#795548',
  '#673AB7',
  '#2196F3',
  '#4CAF50',
]

export const randomAvatarColor = (): string =>
  AVATAR_PALETTE[Math.floor(Math.random() * AVATAR_PALETTE.length)]
