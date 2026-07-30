import type { Announcement } from '@/features/announcements/models/types'
import { isoDaysFromNow } from './dateHelpers'

export const announcements: Announcement[] = [
  {
    id: 'an-1',
    title: 'Penilaian Tengah Semester Genap 2024/2025',
    content:
      'Diberitahukan kepada seluruh siswa dan orang tua bahwa Penilaian Tengah Semester (PTS) Genap akan dilaksanakan pada tanggal 10 sampai 15 bulan depan. Jadwal lengkap per mata pelajaran dapat diunduh melalui menu Materi Pembelajaran. Mohon siswa mempersiapkan diri dan hadir tepat waktu pukul 07.00 WIB.',
    audience: 'all',
    priority: 'important',
    authorId: 'u-admin',
    authorName: 'Sri Wahyuni, M.Pd.',
    publishedAt: isoDaysFromNow(-1, 7, 30),
    pinned: true,
  },
  {
    id: 'an-2',
    title: 'Pertemuan Orang Tua Siswa Kelas 5',
    content:
      'Sekolah mengundang Bapak/Ibu orang tua siswa kelas 5 untuk menghadiri pertemuan pembahasan perkembangan belajar semester ini. Pertemuan diadakan Sabtu pekan depan pukul 08.00 WIB di Aula Sekolah. Kehadiran Bapak/Ibu sangat kami harapkan.',
    audience: 'parents',
    priority: 'normal',
    authorId: 'u-admin',
    authorName: 'Sri Wahyuni, M.Pd.',
    publishedAt: isoDaysFromNow(-3, 10, 0),
    pinned: false,
  },
  {
    id: 'an-3',
    title: 'Libur Hari Raya dan Kegiatan Pesantren Kilat',
    content:
      'Kegiatan belajar mengajar diliburkan selama pekan Hari Raya. Sebelum libur, sekolah mengadakan Pesantren Kilat selama tiga hari untuk siswa kelas 4 hingga 6. Peserta wajib membawa perlengkapan ibadah masing-masing.',
    audience: 'all',
    priority: 'normal',
    authorId: 'u-admin',
    authorName: 'Sri Wahyuni, M.Pd.',
    publishedAt: isoDaysFromNow(-6, 9, 15),
    pinned: false,
  },
  {
    id: 'an-4',
    title: 'Pengumpulan Tugas Laporan Siklus Air',
    content:
      'Anak-anak kelas 5E, jangan lupa mengumpulkan laporan pengamatan siklus air paling lambat lusa pukul 23.59 melalui menu Tugas. Bagi yang mengalami kendala teknis, silakan hubungi Bapak Ahmad Fauzi.',
    audience: 'students',
    priority: 'urgent',
    authorId: 'u-guru1',
    authorName: 'Ahmad Fauzi, S.Pd.',
    publishedAt: isoDaysFromNow(-2, 16, 45),
    pinned: true,
  },
  {
    id: 'an-5',
    title: 'Rapat Koordinasi Guru Bulanan',
    content:
      'Seluruh bapak/ibu guru diharapkan hadir dalam rapat koordinasi bulanan pada hari Jumat pukul 13.00 WIB di ruang guru. Agenda: evaluasi pembelajaran dan persiapan PTS.',
    audience: 'teachers',
    priority: 'important',
    authorId: 'u-admin',
    authorName: 'Sri Wahyuni, M.Pd.',
    publishedAt: isoDaysFromNow(-4, 13, 0),
    pinned: false,
  },
]
