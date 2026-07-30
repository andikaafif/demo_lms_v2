import type { Assignment, Submission } from '@/features/assignments/models/types'
import { isoDaysFromNow } from './dateHelpers'
import { students } from './users'

export const assignments: Assignment[] = [
  {
    id: 'a-1',
    title: 'Latihan Soal Pecahan Campuran',
    description:
      'Kerjakan 10 soal penjumlahan dan pengurangan pecahan campuran pada modul halaman 12-14. Tuliskan langkah pengerjaan secara lengkap, lalu unggah foto atau ketik jawabanmu.',
    subjectId: 's-mtk',
    classId: 'c-5e',
    teacherId: 't-1',
    maxScore: 100,
    dueDate: isoDaysFromNow(-5, 23, 59),
    createdAt: isoDaysFromNow(-12, 8, 0),
    allowFileUpload: true,
    allowTextAnswer: true,
  },
  {
    id: 'a-2',
    title: 'Laporan Pengamatan Siklus Air',
    description:
      'Setelah menonton video siklus air, buatlah laporan pengamatan singkat (minimal 3 paragraf) yang menjelaskan tahapan evaporasi, kondensasi, dan presipitasi di lingkungan sekitarmu.',
    subjectId: 's-ipas',
    classId: 'c-5e',
    teacherId: 't-1',
    maxScore: 100,
    dueDate: isoDaysFromNow(2, 23, 59),
    createdAt: isoDaysFromNow(-8, 10, 30),
    allowFileUpload: true,
    allowTextAnswer: true,
  },
  {
    id: 'a-3',
    title: 'Menulis Teks Narasi Cerita Rakyat',
    description:
      'Tulis kembali salah satu cerita rakyat Nusantara dengan struktur teks narasi yang benar (orientasi, komplikasi, resolusi). Panjang tulisan minimal 250 kata.',
    subjectId: 's-bind',
    classId: 'c-5e',
    teacherId: 't-2',
    maxScore: 100,
    dueDate: isoDaysFromNow(6, 23, 59),
    createdAt: isoDaysFromNow(-3, 9, 15),
    allowFileUpload: false,
    allowTextAnswer: true,
  },
  {
    id: 'a-4',
    title: 'Proyek Poster Hemat Energi',
    description:
      'Buat poster ajakan hemat energi di rumah menggunakan kertas gambar A3. Unggah hasil fotonya sebelum tenggat.',
    subjectId: 's-sbdp',
    classId: 'c-5e',
    teacherId: 't-5',
    maxScore: 100,
    dueDate: isoDaysFromNow(9, 23, 59),
    createdAt: isoDaysFromNow(-1, 14, 0),
    allowFileUpload: true,
    allowTextAnswer: false,
  },
]

const class5eStudents = students.filter((student) => student.classId === 'c-5e')

const gradedScores: Record<string, number> = {
  'st-1': 88,
  'st-2': 95,
  'st-3': 74,
  'st-4': 90,
  'st-5': 68,
  'st-6': 85,
  'st-7': 79,
  'st-8': 92,
  'st-9': 71,
  'st-10': 83,
}

const answerSamples = [
  'Saya mengerjakan seluruh soal dengan menyamakan penyebut terlebih dahulu, kemudian menjumlahkan bagian bulat dan pecahannya secara terpisah.',
  'Jawaban saya kerjakan bertahap sesuai contoh di modul. Nomor 7 sempat sulit karena penyebutnya berbeda jauh.',
  'Semua soal sudah saya kerjakan dan saya periksa ulang hasilnya bersama kakak di rumah.',
]

const reportSamples = [
  'Siklus air dimulai dari penguapan air laut dan sungai akibat panas matahari. Uap air naik ke atmosfer lalu mendingin dan berubah menjadi titik-titik air pada awan. Ketika awan sudah jenuh, air jatuh kembali ke bumi sebagai hujan dan meresap ke dalam tanah.',
  'Di lingkungan rumah saya, saya mengamati genangan air di halaman yang mengering saat siang hari. Itu adalah proses evaporasi. Pada pagi hari saya juga melihat embun di daun yang merupakan hasil kondensasi.',
]

const feedbackSamples: Record<string, string> = {
  'st-1': 'Langkah pengerjaan sudah runtut dan rapi. Perhatikan kembali penyederhanaan hasil akhir pada nomor 6.',
  'st-2': 'Sangat baik! Semua jawaban benar dan penulisan langkahnya jelas. Pertahankan ya.',
  'st-3': 'Beberapa jawaban masih keliru saat menyamakan penyebut. Silakan pelajari ulang contoh nomor 3.',
  'st-4': 'Bagus sekali, hanya ada satu kesalahan hitung kecil pada nomor 9.',
  'st-5': 'Masih perlu latihan tambahan. Yuk kerjakan lembar latihan tambahan di materi kelas.',
  'st-6': 'Pengerjaan sudah baik. Tingkatkan kerapian penulisan langkah pengerjaan.',
  'st-7': 'Cukup baik, namun beberapa nomor belum dituliskan langkahnya.',
  'st-8': 'Luar biasa! Jawaban lengkap dan sangat teliti.',
  'st-9': 'Perlu lebih teliti pada operasi pengurangan pecahan. Semangat berlatih!',
  'st-10': 'Hasil kerja baik. Perhatikan penulisan pecahan campuran agar tidak tertukar.',
}

function buildSubmissions(): Submission[] {
  const result: Submission[] = []

  // Assignment 1 — past due and fully graded.
  class5eStudents.forEach((student, index) => {
    result.push({
      id: `sub-a1-${student.id}`,
      assignmentId: 'a-1',
      studentId: student.id,
      status: 'graded',
      textAnswer: answerSamples[index % answerSamples.length],
      files: [
        {
          id: `f-a1-${student.id}`,
          name: `Tugas-Pecahan-${student.name.split(' ')[0]}.pdf`,
          sizeKb: 420 + index * 33,
          url: `/files/tugas-pecahan-${student.id}.pdf`,
        },
      ],
      submittedAt: isoDaysFromNow(-6, 19, 30 + index),
      score: gradedScores[student.id] ?? 80,
      feedback: feedbackSamples[student.id] ?? 'Terima kasih sudah mengumpulkan tepat waktu.',
      gradedAt: isoDaysFromNow(-4, 15, 0),
    })
  })

  // Assignment 2 — open, mixed submitted / pending.
  class5eStudents.forEach((student, index) => {
    const submitted = index % 3 !== 2
    result.push({
      id: `sub-a2-${student.id}`,
      assignmentId: 'a-2',
      studentId: student.id,
      status: submitted ? 'submitted' : 'pending',
      textAnswer: submitted ? reportSamples[index % reportSamples.length] : '',
      files: submitted
        ? [
            {
              id: `f-a2-${student.id}`,
              name: `Laporan-Siklus-Air-${student.name.split(' ')[0]}.pdf`,
              sizeKb: 510 + index * 21,
              url: `/files/laporan-siklus-air-${student.id}.pdf`,
            },
          ]
        : [],
      submittedAt: submitted ? isoDaysFromNow(-1, 20, 10 + index) : null,
      score: null,
      feedback: '',
      gradedAt: null,
    })
  })

  // Assignment 3 — open, nobody has submitted yet.
  class5eStudents.forEach((student) => {
    result.push({
      id: `sub-a3-${student.id}`,
      assignmentId: 'a-3',
      studentId: student.id,
      status: 'pending',
      textAnswer: '',
      files: [],
      submittedAt: null,
      score: null,
      feedback: '',
      gradedAt: null,
    })
  })

  // Assignment 4 — newly created, all pending.
  class5eStudents.forEach((student) => {
    result.push({
      id: `sub-a4-${student.id}`,
      assignmentId: 'a-4',
      studentId: student.id,
      status: 'pending',
      textAnswer: '',
      files: [],
      submittedAt: null,
      score: null,
      feedback: '',
      gradedAt: null,
    })
  })

  return result
}

export const submissions: Submission[] = buildSubmissions()
