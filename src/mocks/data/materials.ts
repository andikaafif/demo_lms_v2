import type { Material } from '@/features/materials/models/types'
import { isoDaysFromNow } from './dateHelpers'

export const materials: Material[] = [
  {
    id: 'm-1',
    title: 'Operasi Hitung Pecahan Campuran',
    description:
      'Ringkasan materi penjumlahan dan pengurangan pecahan campuran lengkap dengan 15 contoh soal beserta pembahasannya. Pelajari langkah menyamakan penyebut sebelum mengerjakan latihan.',
    subjectId: 's-mtk',
    classId: 'c-5e',
    teacherId: 't-1',
    type: 'pdf',
    attachments: [
      {
        id: 'ma-1',
        name: 'Modul-Pecahan-Campuran.pdf',
        type: 'pdf',
        url: '/files/modul-pecahan-campuran.pdf',
        sizeKb: 1840,
      },
      {
        id: 'ma-2',
        name: 'Lembar-Latihan-Pecahan.pdf',
        type: 'pdf',
        url: '/files/lembar-latihan-pecahan.pdf',
        sizeKb: 620,
      },
    ],
    publishedAt: isoDaysFromNow(-12, 8, 30),
    viewCount: 47,
  },
  {
    id: 'm-2',
    title: 'Video Pembelajaran: Siklus Air di Bumi',
    description:
      'Video animasi yang menjelaskan proses evaporasi, kondensasi, presipitasi, dan infiltrasi dalam siklus air. Tonton hingga selesai lalu catat tiga hal baru yang kamu pelajari.',
    subjectId: 's-ipas',
    classId: 'c-5e',
    teacherId: 't-1',
    type: 'video',
    youtubeUrl: 'https://www.youtube.com/watch?v=al-do-HGuIk',
    attachments: [],
    publishedAt: isoDaysFromNow(-9, 10, 15),
    viewCount: 38,
  },
  {
    id: 'm-3',
    title: 'Struktur Teks Narasi dan Contohnya',
    description:
      'Materi Bahasa Indonesia tentang orientasi, komplikasi, dan resolusi dalam teks narasi. Dilengkapi contoh cerita rakyat Nusantara.',
    subjectId: 's-bind',
    classId: 'c-5e',
    teacherId: 't-2',
    type: 'pdf',
    attachments: [
      {
        id: 'ma-3',
        name: 'Struktur-Teks-Narasi.pdf',
        type: 'pdf',
        url: '/files/struktur-teks-narasi.pdf',
        sizeKb: 980,
      },
    ],
    publishedAt: isoDaysFromNow(-6, 9, 0),
    viewCount: 52,
  },
  {
    id: 'm-4',
    title: 'Infografis Rantai Makanan Ekosistem Sawah',
    description:
      'Gambar infografis berwarna yang memperlihatkan produsen, konsumen tingkat I sampai III, dan pengurai pada ekosistem sawah.',
    subjectId: 's-ipas',
    classId: 'c-5e',
    teacherId: 't-1',
    type: 'image',
    attachments: [
      {
        id: 'ma-4',
        name: 'Infografis-Rantai-Makanan.png',
        type: 'image',
        url: '/files/infografis-rantai-makanan.png',
        sizeKb: 2450,
      },
    ],
    publishedAt: isoDaysFromNow(-4, 13, 45),
    viewCount: 29,
  },
  {
    id: 'm-5',
    title: 'Kosakata Tema Family and Home',
    description:
      'Daftar 40 kosakata Bahasa Inggris bertema keluarga dan rumah beserta cara pengucapannya. Hafalkan minimal 20 kata untuk kuis minggu depan.',
    subjectId: 's-bing',
    classId: 'c-5e',
    teacherId: 't-2',
    type: 'link',
    youtubeUrl: '',
    attachments: [
      {
        id: 'ma-5',
        name: 'Vocabulary-Family-and-Home.pdf',
        type: 'pdf',
        url: '/files/vocabulary-family-home.pdf',
        sizeKb: 410,
      },
    ],
    publishedAt: isoDaysFromNow(-2, 11, 20),
    viewCount: 21,
  },
  {
    id: 'm-6',
    title: 'Latihan Soal Bangun Ruang Kelas 6',
    description: 'Kumpulan soal volume kubus dan balok sebagai persiapan asesmen sumatif.',
    subjectId: 's-mtk',
    classId: 'c-6f',
    teacherId: 't-1',
    type: 'pdf',
    attachments: [
      {
        id: 'ma-6',
        name: 'Latihan-Bangun-Ruang.pdf',
        type: 'pdf',
        url: '/files/latihan-bangun-ruang.pdf',
        sizeKb: 760,
      },
    ],
    publishedAt: isoDaysFromNow(-7, 8, 0),
    viewCount: 33,
  },
]
