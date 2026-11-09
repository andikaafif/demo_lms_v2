import type { Subject, SubjectAssignment } from '@/features/subjects/models/types'

export const subjects: Subject[] = [
  {
    id: 's-mtk',
    name: 'Matematika',
    code: 'MTK',
    color: '#3F51B5',
    description: 'Bilangan, pengukuran, geometri, dan pengolahan data untuk jenjang sekolah dasar.',
    weeklyHours: 5,
  },
  {
    id: 's-bind',
    name: 'Bahasa Indonesia',
    code: 'BIND',
    color: '#E91E63',
    description: 'Menyimak, berbicara, membaca, dan menulis dalam Bahasa Indonesia.',
    weeklyHours: 6,
  },
  {
    id: 's-ipas',
    name: 'IPAS',
    code: 'IPAS',
    color: '#009688',
    description: 'Ilmu Pengetahuan Alam dan Sosial secara terpadu.',
    weeklyHours: 5,
  },
  {
    id: 's-ppkn',
    name: 'Pendidikan Pancasila',
    code: 'PPKN',
    color: '#F44336',
    description: 'Nilai-nilai Pancasila, kewarganegaraan, dan budi pekerti.',
    weeklyHours: 4,
  },
  {
    id: 's-bing',
    name: 'Bahasa Inggris',
    code: 'BING',
    color: '#2196F3',
    description: 'Pengenalan kosakata dan percakapan sederhana Bahasa Inggris.',
    weeklyHours: 2,
  },
  {
    id: 's-pjok',
    name: 'PJOK',
    code: 'PJOK',
    color: '#4CAF50',
    description: 'Pendidikan Jasmani, Olahraga, dan Kesehatan.',
    weeklyHours: 3,
  },
  {
    id: 's-sbdp',
    name: 'Seni Budaya dan Prakarya',
    code: 'SBDP',
    color: '#FF9800',
    description: 'Seni rupa, musik, tari, dan prakarya.',
    weeklyHours: 3,
  },
  {
    id: 's-pai',
    name: 'Pendidikan Agama Islam dan Budi Pekerti',
    code: 'PAIBP',
    color: '#795548',
    description: 'Akidah, akhlak, fikih, dan sejarah kebudayaan Islam.',
    weeklyHours: 4,
  },
]

const ACTIVE_YEAR = 'ay-2025-2026'
const ACTIVE_PERIOD = 'ap-2025-2026-odd'

interface AssignmentSeed {
  id: string
  subjectId: string
  classId: string
  teacherId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  meeting: number
}

const seeds: AssignmentSeed[] = [
  { id: 'sa-1', subjectId: 's-mtk', classId: 'c-5e', teacherId: 't-1', dayOfWeek: 1, startTime: '07:30', endTime: '09:00', meeting: 1 },
  { id: 'sa-2', subjectId: 's-ipas', classId: 'c-5e', teacherId: 't-1', dayOfWeek: 2, startTime: '09:30', endTime: '11:00', meeting: 2 },
  { id: 'sa-3', subjectId: 's-bind', classId: 'c-5e', teacherId: 't-2', dayOfWeek: 3, startTime: '07:30', endTime: '09:00', meeting: 3 },
  { id: 'sa-4', subjectId: 's-bing', classId: 'c-5e', teacherId: 't-2', dayOfWeek: 4, startTime: '10:00', endTime: '11:00', meeting: 4 },
  { id: 'sa-5', subjectId: 's-pjok', classId: 'c-5e', teacherId: 't-3', dayOfWeek: 5, startTime: '07:00', endTime: '08:30', meeting: 5 },
  { id: 'sa-6', subjectId: 's-pai', classId: 'c-5e', teacherId: 't-4', dayOfWeek: 1, startTime: '09:30', endTime: '11:00', meeting: 6 },
  { id: 'sa-7', subjectId: 's-sbdp', classId: 'c-5e', teacherId: 't-5', dayOfWeek: 4, startTime: '07:30', endTime: '09:00', meeting: 7 },
  { id: 'sa-8', subjectId: 's-ppkn', classId: 'c-5e', teacherId: 't-4', dayOfWeek: 3, startTime: '09:30', endTime: '10:30', meeting: 8 },
  { id: 'sa-9', subjectId: 's-mtk', classId: 'c-6f', teacherId: 't-1', dayOfWeek: 2, startTime: '07:30', endTime: '09:00', meeting: 1 },
  { id: 'sa-10', subjectId: 's-bind', classId: 'c-4d', teacherId: 't-2', dayOfWeek: 1, startTime: '07:30', endTime: '09:00', meeting: 1 },
  { id: 'sa-11', subjectId: 's-pjok', classId: 'c-6f', teacherId: 't-3', dayOfWeek: 3, startTime: '07:00', endTime: '08:30', meeting: 2 },
  { id: 'sa-12', subjectId: 's-sbdp', classId: 'c-2b', teacherId: 't-5', dayOfWeek: 5, startTime: '09:00', endTime: '10:30', meeting: 1 },
  { id: 'sa-13', subjectId: 's-pai', classId: 'c-3c', teacherId: 't-4', dayOfWeek: 2, startTime: '07:30', endTime: '09:00', meeting: 1 },
  { id: 'sa-14', subjectId: 's-mtk', classId: 'c-1a', teacherId: 't-6', dayOfWeek: 1, startTime: '07:30', endTime: '08:30', meeting: 1 },
]

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export const subjectAssignments: SubjectAssignment[] = seeds.map((seed) => ({
  ...seed,
  academicYearId: ACTIVE_YEAR,
  periodId: ACTIVE_PERIOD,
  schedule: `${dayNames[seed.dayOfWeek]}, ${seed.startTime.replace(':', '.')} - ${seed.endTime.replace(':', '.')}`,
}))
