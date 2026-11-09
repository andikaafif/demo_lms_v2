import type { AttitudeGrade, AttitudeGradeRow } from '@/features/gradebook/models/types'
import { students } from './users'

/** Homeroom teacher notes shown in the gradebook, keyed by student id. */
export const teacherNotes: Record<string, string> = {
  'st-1': 'Aktif bertanya di kelas dan konsisten mengumpulkan tugas tepat waktu.',
  'st-2': 'Nilai sangat baik pada seluruh mata pelajaran. Dapat menjadi tutor sebaya.',
  'st-3': 'Perlu pendampingan tambahan pada Matematika, terutama materi pecahan.',
  'st-4': 'Rajin dan teliti. Tingkatkan keberanian menyampaikan pendapat.',
  'st-5': 'Perlu meningkatkan kedisiplinan pengumpulan tugas.',
  'st-6': 'Kemampuan menulis narasi berkembang pesat semester ini.',
  'st-7': 'Cukup baik. Perhatikan ketelitian saat mengerjakan soal hitungan.',
  'st-8': 'Berprestasi konsisten. Direkomendasikan mengikuti olimpiade sains sekolah.',
  'st-9': 'Perlu latihan rutin di rumah untuk materi pecahan dan desimal.',
  'st-10': 'Perkembangan baik. Terus pertahankan semangat belajarnya.',
}

const attitudeGrades: AttitudeGrade[] = ['A', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A']

const attitudeNotes: Record<string, string> = {
  'st-1': 'Menunjukkan sikap santun dan tanggung jawab yang baik.',
  'st-2': 'Sangat disiplin, jujur, dan menjadi teladan bagi teman sekelas.',
  'st-3': 'Perlu bimbingan dalam kedisiplinan dan kerja sama kelompok.',
  'st-4': 'Percaya diri dan menghargai pendapat teman.',
  'st-5': 'Perlu peningkatan tanggung jawab dalam menyelesaikan tugas.',
  'st-6': 'Kreatif dan aktif dalam kegiatan kelas.',
  'st-7': 'Cukup baik, perlu lebih fokus saat pembelajaran.',
  'st-8': 'Sikap kepemimpinan dan kepedulian sosial sangat baik.',
  'st-9': 'Perlu latihan kedisiplinan waktu.',
  'st-10': 'Ramah dan kooperatif dalam bekerja kelompok.',
}

const class5eStudents = students.filter((student) => student.classId === 'c-5e')

export const attitudeGradeRows: AttitudeGradeRow[] = class5eStudents.map((student, index) => ({
  studentId: student.id,
  studentName: student.name,
  nis: student.nis,
  grade: attitudeGrades[index % attitudeGrades.length],
  note: attitudeNotes[student.id] ?? '',
}))
