import type { SchoolClass } from '@/features/classes/models/types'
import { students } from './users'

const studentIdsFor = (classId: string) =>
  students.filter((student) => student.classId === classId).map((student) => student.id)

const ACTIVE_YEAR = 'ay-2025-2026'
const ACTIVE_PERIOD = 'ap-2025-2026-odd'

export const classes: SchoolClass[] = [
  {
    id: 'c-1a',
    name: 'Kelas 1A',
    grade: 1,
    academicYearId: ACTIVE_YEAR,
    periodId: ACTIVE_PERIOD,
    homeroomTeacherId: 't-6',
    studentIds: studentIdsFor('c-1a'),
    room: 'Ruang 101',
    status: 'active',
  },
  {
    id: 'c-2b',
    name: 'Kelas 2B',
    grade: 2,
    academicYearId: ACTIVE_YEAR,
    periodId: ACTIVE_PERIOD,
    homeroomTeacherId: 't-5',
    studentIds: studentIdsFor('c-2b'),
    room: 'Ruang 102',
    status: 'active',
  },
  {
    id: 'c-3c',
    name: 'Kelas 3C',
    grade: 3,
    academicYearId: ACTIVE_YEAR,
    periodId: ACTIVE_PERIOD,
    homeroomTeacherId: 't-4',
    studentIds: studentIdsFor('c-3c'),
    room: 'Ruang 201',
    status: 'active',
  },
  {
    id: 'c-4d',
    name: 'Kelas 4D',
    grade: 4,
    academicYearId: ACTIVE_YEAR,
    periodId: ACTIVE_PERIOD,
    homeroomTeacherId: 't-2',
    studentIds: studentIdsFor('c-4d'),
    room: 'Ruang 202',
    status: 'active',
  },
  {
    id: 'c-5e',
    name: 'Kelas 5E',
    grade: 5,
    academicYearId: ACTIVE_YEAR,
    periodId: ACTIVE_PERIOD,
    homeroomTeacherId: 't-1',
    studentIds: studentIdsFor('c-5e'),
    room: 'Ruang 301',
    status: 'active',
  },
  {
    id: 'c-6f',
    name: 'Kelas 6F',
    grade: 6,
    academicYearId: ACTIVE_YEAR,
    periodId: ACTIVE_PERIOD,
    homeroomTeacherId: 't-3',
    studentIds: studentIdsFor('c-6f'),
    room: 'Ruang 302',
    status: 'active',
  },
  // Historical data so academic year / period separation is visible in the demo.
  {
    id: 'c-5e-2425',
    name: 'Kelas 5E',
    grade: 5,
    academicYearId: 'ay-2024-2025',
    periodId: 'ap-2024-2025-even',
    homeroomTeacherId: 't-1',
    studentIds: [],
    room: 'Ruang 301',
    status: 'archived',
  },
  {
    id: 'c-4d-2425',
    name: 'Kelas 4D',
    grade: 4,
    academicYearId: 'ay-2024-2025',
    periodId: 'ap-2024-2025-even',
    homeroomTeacherId: 't-2',
    studentIds: [],
    room: 'Ruang 202',
    status: 'archived',
  },
]
