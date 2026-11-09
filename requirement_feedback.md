# LMS Feedback Requirement & MoM

**Document Type:** Requirement Feedback / Minutes of Meeting (MoM)  
**Status:** Development Ready Draft  
**Version:** 1.0  
**Date:** 22 September 2026

---

## 1. Purpose

Dokumen ini merangkum hasil feedback LMS dan menerjemahkannya menjadi requirement yang dapat digunakan oleh:

- Product Manager / Project Manager
- Business Analyst
- UI/UX Designer
- Frontend / Mobile Developer
- Backend Developer
- QA / Tester

Dokumen ini juga berfungsi sebagai **Minutes of Meeting (MoM)** untuk menjadi baseline perubahan requirement.

---

# 2. General Rules

## 2.1 Academic Period

Sistem menggunakan struktur:

```text
Academic Year
└── Period
    ├── Odd
    └── Even
```

Contoh:

```text
2026/2027
├── Odd
└── Even
```

### Requirement

- Semua data akademik yang bersifat periodik harus memiliki relasi:
  - `academic_year`
  - `period`
- Minimal data yang perlu mengikuti academic year + period:
  - Kelas
  - Mata pelajaran
  - Materi
  - Tugas
  - Presensi
  - Nilai
  - Jadwal
- Default period mengikuti periode akademik yang sedang aktif.
- Default academic year mengikuti tahun ajaran aktif/terbaru.

---

# 3. Role & Access Matrix

| Feature | Admin | Guru | Wali Kelas | Siswa | Orang Tua |
|---|:---:|:---:|:---:|:---:|:---:|
| Materi Management | ✓ | ✓ | ✓* | View | View |
| Tugas Management | - | ✓ | ✓* | View/Submit | View |
| Presensi Monitoring | ✓ | ✓ | ✓ | View | View |
| Presensi Override | ✓ | - | - | - | - |
| Kelas Management | ✓ | View | View | View | View |
| Rekap Nilai | ✓ | ✓ | ✓ | View | View |
| Nilai Sikap | ✓ | ✓* | ✓ | View | View |
| Schedule | ✓* | ✓ | ✓ | View | View |
| Account Management | ✓ | - | - | - | - |
| School Profile | ✓ | - | - | - | - |

> `*` mengikuti permission/role yang ditentukan pada sistem.

---

# 4. ADMIN – AKADEMIK

## 4.1 Materi Management

### Requirement

Admin dapat mengelola materi pembelajaran berdasarkan:

1. Academic Year
2. Period
3. Tingkat/Kelas
4. Mata Pelajaran

### Materi dapat berisi

- Judul materi
- Deskripsi/text
- Text book yang digunakan
- Link pendukung
- File attachment

### Supported File

Minimal:

- PPT/PPTX
- DOC/DOCX
- PDF

### Acceptance Criteria

- [ ] Admin dapat memilih tingkat/kelas.
- [ ] Admin dapat memilih mata pelajaran.
- [ ] Admin dapat memasukkan textbook.
- [ ] Admin dapat memasukkan link pendukung.
- [ ] Admin dapat upload attachment.
- [ ] Materi tersimpan pada academic year + period yang benar.
- [ ] Materi dapat dilihat sesuai role yang memiliki akses.

---

## 4.2 Tugas

### Requirement

Tugas yang dibuat oleh guru **tidak ditampilkan pada menu Admin Akademik**.

### Acceptance Criteria

- [ ] Tugas guru tidak muncul pada listing Materi/Academic Admin.
- [ ] Data tugas tetap tersimpan.
- [ ] Guru tetap dapat mengelola tugas.
- [ ] Siswa tetap dapat melihat/mengerjakan tugas.
- [ ] Orang tua dapat melihat tugas sesuai hak akses.

### Open Question

Perlu dikonfirmasi apakah Admin memiliki **menu monitoring tugas tersendiri**.

---

# 5. ADMIN – PRESENSI

## 5.1 Presensi Monitoring

Admin dapat melihat presensi kelas yang sedang berjalan pada hari berjalan.

### Listing

Tampilan menggunakan **table/list**.

Kolom minimal:

| Field | Description |
|---|---|
| Kelas | Nama kelas |
| Mata Pelajaran | Subject |
| Guru | Teacher |
| Schedule | Jam/pertemuan |
| Submit Status | Submitted / Not Submitted |
| Action | View |

### Acceptance Criteria

- [ ] Sistem menampilkan kelas yang sedang berjalan hari ini.
- [ ] Sistem menampilkan status submit presensi.
- [ ] Admin dapat membuka detail dengan action `View`.
- [ ] Admin dapat melihat daftar siswa.
- [ ] Admin dapat melihat status kehadiran setiap siswa.

---

## 5.2 Presensi Filter

Filter:

- Kelas
- Mata Pelajaran

Default:

- Kelas = kosong
- Mata Pelajaran = kosong

Search:

- Free-text search

### Acceptance Criteria

- [ ] Filter dapat digunakan secara independen.
- [ ] Filter dapat digunakan secara kombinasi.
- [ ] Free-text search tersedia.
- [ ] Reset filter tersedia.

---

## 5.3 Presensi Override

Admin dapat melakukan override presensi setelah **1 jam pelajaran berlalu**.

### Business Rule

```text
Session selesai / telah melewati 1 jam pelajaran
            ↓
Admin dapat melakukan override
```

### Acceptance Criteria

- [ ] Sebelum batas waktu, override tidak tersedia untuk Admin.
- [ ] Setelah 1 jam pelajaran berlalu, override tersedia.
- [ ] Admin dapat mengubah status presensi siswa.
- [ ] Sistem menyimpan perubahan.

### Recommended Audit Trail

Sistem sebaiknya menyimpan:

- `updated_by`
- `updated_at`
- `old_status`
- `new_status`
- `reason`

> **Open Question:** Apakah `reason` wajib diisi saat Admin melakukan override?

---

## 5.4 Export Presensi

Admin dapat melakukan export data presensi.

### Recommended Format

- CSV
- XLSX

### Acceptance Criteria

- [ ] Admin dapat memilih filter sebelum export.
- [ ] Export mengikuti filter yang aktif.
- [ ] Data export memiliki academic year + period.
- [ ] Data export dapat digunakan untuk reporting.

---

# 6. ADMIN – MANAJEMEN

## 6.1 Class Management

Pada menu Kelas, Admin memilih **Academic Year** terlebih dahulu.

### Flow

```text
Kelas
 ↓
Pilih Academic Year
 ↓
Pilih Period
 ↓
Tampilkan daftar Kelas
```

### Requirement

- Academic Year menjadi filter utama.
- Period menjadi filter berikutnya.
- Academic Year terbaru menjadi default.
- Period aktif menjadi default.

### Acceptance Criteria

- [ ] Academic Year ditampilkan terlebih dahulu.
- [ ] Setelah Academic Year dipilih, sistem menampilkan data kelas terkait.
- [ ] Data kelas tidak bercampur antar academic year.
- [ ] Data Odd dan Even terpisah.

---

# 7. ADMIN – REKAP NILAI

## 7.1 Rekap Nilai Mata Pelajaran

Admin dapat melihat rekap nilai siswa berdasarkan mata pelajaran.

Contoh:

| Siswa | IPA | IPS | B. Indonesia | B. Inggris |
|---|---:|---:|---:|---:|
| Student A | 85 | 88 | 90 | 87 |
| Student B | 80 | 84 | 86 | 89 |

### Acceptance Criteria

- [ ] Rekap dapat difilter berdasarkan Academic Year.
- [ ] Rekap dapat difilter berdasarkan Period.
- [ ] Rekap dapat difilter berdasarkan Kelas.
- [ ] Nilai dikelompokkan berdasarkan mata pelajaran.

---

## 7.2 Rekap Nilai Sikap

Admin dapat melihat rekap nilai sikap siswa.

### Acceptance Criteria

- [ ] Nilai sikap tersedia dalam reporting.
- [ ] Nilai sikap terkait dengan siswa.
- [ ] Nilai sikap terkait dengan academic year + period.
- [ ] Nilai sikap dapat ditampilkan pada rekap siswa.

---

# 8. ADMIN – ACCOUNT MANAGEMENT

Admin dapat melakukan account management terhadap:

- Guru
- Orang Tua
- Siswa

### Requirement

Admin dapat:

- Reset password.
- Change password sesuai permission yang diberikan.

### Recommended Flow

```text
Admin
 ↓
User Management
 ↓
Pilih User
 ↓
Reset Password
 ↓
System generates/reset credential
```

### Acceptance Criteria

- [ ] Admin dapat mencari user.
- [ ] Admin dapat memilih user.
- [ ] Admin dapat melakukan reset password.
- [ ] User menerima mekanisme untuk membuat password baru.
- [ ] Password tidak ditampilkan dalam plain text.

---

# 9. GURU – KELAS

## 9.1 Class Filter

Menu Kelas dapat difilter berdasarkan:

- Academic Year
- Period

### Default

- Academic Year terbaru/aktif.
- Period aktif.

---

## 9.2 Class Detail

Di dalam detail kelas tersedia:

### Materi

- Materi per pertemuan.
- Guru dapat menambahkan materi.

### Siswa

- List siswa yang terdaftar pada kelas.

### Absensi

- Presensi per sesi/pertemuan.

---

# 10. GURU – SCHEDULE

Guru memiliki menu **Schedule**.

### Informasi minimal

- Tanggal
- Hari
- Jam
- Kelas
- Mata Pelajaran
- Status/pertemuan

### Acceptance Criteria

- [ ] Guru dapat melihat jadwal mengajar.
- [ ] Jadwal hanya menampilkan kelas/mata pelajaran yang menjadi tanggung jawab guru.
- [ ] Jadwal mengikuti academic year + period aktif.

---

# 11. GURU – MATERI

Guru dapat menambahkan materi dari detail kelas.

### Minimum Data

- Academic Year
- Period
- Kelas
- Mata Pelajaran
- Pertemuan
- Judul
- Deskripsi
- Textbook
- Link pendukung
- Attachment

---

# 12. GURU – TUGAS

Guru dapat membuat tugas dari menu Kelas.

## 12.1 Dynamic Form

Form tugas menggunakan konsep seperti Google Forms.

Guru dapat membuat field secara dinamis.

### Recommended Field Types

- Short Answer
- Long Answer
- Multiple Choice
- Checkbox
- Dropdown
- File Upload
- Date
- Number

### Example

```text
Assignment
│
├── Title
├── Description
├── Due Date
│
└── Questions
    ├── Question 1
    │   └── Multiple Choice
    │
    ├── Question 2
    │   └── Long Answer
    │
    └── Question 3
        └── File Upload
```

### Acceptance Criteria

- [ ] Guru dapat membuat tugas.
- [ ] Guru dapat menambahkan field.
- [ ] Guru dapat mengubah urutan field.
- [ ] Guru dapat menghapus field.
- [ ] Guru dapat menentukan tipe field.
- [ ] Guru dapat menyimpan/publish tugas.
- [ ] Siswa dapat mengakses tugas yang sudah dipublish.

---

# 13. GURU – ROLE & ACCESS

## 13.1 Guru Biasa

Guru yang bukan wali kelas:

- Tidak melihat menu Manajemen.
- Hanya dapat mengakses kelas/mata pelajaran yang diajarkan.

## 13.2 Wali Kelas

Wali kelas mendapatkan akses tambahan untuk kelas yang menjadi tanggung jawabnya.

### UI Concept

```text
MY CLASS
└── 7A
    └── Wali Kelas

TEACHING
├── 7B - IPA
├── 8A - IPA
└── 9C - IPA
```

### Rules

- `My Class` = kelas yang menjadi tanggung jawab guru sebagai wali kelas.
- `Teaching` = kelas yang diajar berdasarkan assignment/jadwal mengajar.
- Menu harus mengikuti role/permission.
- Menu Mata Pelajaran dan Profile Kelas tidak ditampilkan jika tidak relevan untuk role tersebut.

---

# 14. SISWA

## 14.1 Subject Summary

Siswa dapat melihat mata pelajaran pada periode berjalan.

Setiap mata pelajaran memiliki summary:

```text
Subject
├── Absensi
├── Materi
├── Tugas
└── Nilai
```

### Acceptance Criteria

- [ ] Siswa melihat mata pelajaran yang sedang diikuti.
- [ ] Materi dapat dibuka.
- [ ] Tugas dapat dibuka.
- [ ] Status/hasil tugas dapat ditampilkan sesuai requirement.
- [ ] Presensi dapat dilihat.
- [ ] Nilai dapat dilihat.
- [ ] Data mengikuti academic year + period aktif.

---

## 14.2 School Profile

Menu **School Profile dihilangkan** dari sisi siswa.

### Acceptance Criteria

- [ ] School Profile tidak muncul di navigation.
- [ ] School Profile tidak muncul di dashboard siswa.

---

# 15. ORANG TUA

## 15.1 Schedule

Orang tua dapat melihat jadwal mata pelajaran anak.

### Information

- Hari/tanggal
- Jam
- Mata pelajaran
- Guru
- Kelas

---

## 15.2 Academic Monitoring

Orang tua dapat melihat:

- Tugas
- Presensi
- Nilai

### Filter

Semua data akademik dapat difilter berdasarkan:

- Academic Year
- Period

### Acceptance Criteria

- [ ] Orang tua dapat memilih anak jika memiliki lebih dari satu anak.
- [ ] Orang tua dapat memilih Academic Year.
- [ ] Orang tua dapat memilih Period.
- [ ] Data tugas mengikuti filter.
- [ ] Data presensi mengikuti filter.
- [ ] Data nilai mengikuti filter.

---

# 16. Recommended Data Relationship

Development harus mempertimbangkan relasi data berikut:

```text
Academic Year
    │
    └── Period
          │
          └── Class
                │
                ├── Student
                │
                └── Subject
                      │
                      ├── Schedule
                      │
                      ├── Meeting
                      │     ├── Material
                      │     ├── Assignment
                      │     └── Attendance
                      │
                      └── Grade
```

---

# 17. Development Notes

## 17.1 Mandatory Context

Untuk data akademik, gunakan context berikut:

```text
academic_year_id
period_id
class_id
subject_id
```

Tidak semua entity membutuhkan seluruh field secara langsung, tetapi relationship harus dapat ditelusuri sampai academic year + period.

## 17.2 Role Based Access Control

Implementasikan permission berdasarkan:

```text
ROLE
 ├── ADMIN
 ├── TEACHER
 ├── HOMEROOM_TEACHER
 ├── STUDENT
 └── PARENT
```

Recommended:

```text
Role → Permission → Resource → Action
```

Contoh:

```text
TEACHER
 └── ASSIGNMENT
      ├── CREATE
      ├── READ
      ├── UPDATE
      └── DELETE
```

---

# 18. QA / Testing Checklist

## Academic Context

- [ ] Odd dan Even tidak bercampur.
- [ ] Academic Year tidak bercampur.
- [ ] Default filter menggunakan academic year aktif.
- [ ] Default period menggunakan period aktif.

## Admin

- [ ] Materi dapat dikelola.
- [ ] Presensi dapat dimonitor.
- [ ] Override presensi mengikuti business rule.
- [ ] Export berjalan.
- [ ] Rekap nilai benar.
- [ ] Reset password berjalan.

## Guru

- [ ] Class filter berjalan.
- [ ] Schedule berjalan.
- [ ] Material management berjalan.
- [ ] Dynamic assignment form berjalan.
- [ ] Permission guru biasa benar.
- [ ] Permission wali kelas benar.
- [ ] My Class dan Teaching tidak tertukar.

## Siswa

- [ ] Subject summary berjalan.
- [ ] Materi tampil sesuai kelas.
- [ ] Tugas tampil sesuai kelas.
- [ ] Presensi tampil sesuai siswa.
- [ ] Nilai tampil sesuai siswa.
- [ ] School Profile tidak muncul.

## Orang Tua

- [ ] Jadwal anak tampil.
- [ ] Tugas anak tampil.
- [ ] Presensi anak tampil.
- [ ] Nilai anak tampil.
- [ ] Filter Academic Year berjalan.
- [ ] Filter Period berjalan.

---

# 19. Open Questions / Pending Confirmation

| ID | Topic | Question | Status |
|---|---|---|---|
| OQ-001 | Admin Task | Apakah Admin memiliki menu monitoring tugas tersendiri? | Pending |
| OQ-002 | Attendance | Apakah alasan wajib diisi saat Admin override presensi? | Pending |
| OQ-003 | Attendance | Apakah history perubahan presensi wajib ditampilkan? | Recommended |
| OQ-004 | Export | Apakah export hanya CSV/XLSX atau juga PDF? | Pending |
| OQ-005 | Password | Apakah Admin melakukan reset password atau change password langsung? | Pending |
| OQ-006 | Wali Kelas | Permission tambahan apa saja yang membedakan Wali Kelas dan Guru biasa? | Pending |
| OQ-007 | Grade | Format/range nilai yang digunakan? | Pending |
| OQ-008 | Attitude Grade | Struktur/rubrik nilai sikap seperti apa? | Pending |

---

# 20. MoM – Meeting Summary

## Discussion Summary

Meeting membahas feedback dan revisi LMS pada area:

1. Admin Akademik
2. Admin Manajemen
3. Account Management
4. Guru
5. Siswa
6. Orang Tua
7. Academic Year & Period

## Key Decisions

### D-001 – Academic Period

Sistem mendukung dua periode:

- Odd
- Even

Setiap data akademik harus dapat ditelusuri berdasarkan Academic Year dan Period.

### D-002 – Admin Attendance

Admin dapat melakukan monitoring presensi dan melakukan override setelah satu jam pelajaran berlalu.

### D-003 – Teacher Class

Menu Kelas guru menggunakan filter Academic Year dan Period.

### D-004 – Teacher Assignment

Guru dapat membuat tugas dengan dynamic fields seperti konsep Google Forms.

### D-005 – Teacher Role

Akses Guru biasa dan Wali Kelas dibedakan berdasarkan role/permission.

### D-006 – Student

Student mendapatkan Subject Summary yang mencakup:

- Absensi
- Materi
- Tugas
- Nilai

School Profile dihilangkan.

### D-007 – Parent

Orang tua dapat melihat:

- Jadwal
- Tugas
- Presensi
- Nilai

Data dapat difilter berdasarkan Academic Year dan Period.

---

# 21. Action Items

| ID | Action | PIC | Priority | Status |
|---|---|---|---|---|
| A-001 | Finalisasi Academic Year + Period logic | BA/Backend | High | Open |
| A-002 | Finalisasi Admin Attendance UI | UI/UX + BA | High | Open |
| A-003 | Implement Attendance Override Rule | Backend | High | Open |
| A-004 | Implement Attendance Audit Trail | Backend | Medium | Open |
| A-005 | Implement Teacher Class Filter | Frontend + Backend | High | Open |
| A-006 | Implement Dynamic Assignment Form | Frontend + Backend | High | Open |
| A-007 | Define Teacher vs Homeroom Permission | BA/PM | High | Open |
| A-008 | Implement Student Subject Summary | Frontend + Backend | High | Open |
| A-009 | Implement Parent Academic Filter | Frontend + Backend | High | Open |
| A-010 | Finalize Grade & Attitude Grade Structure | BA + Academic | High | Open |
| A-011 | Finalize Export Format | BA/PM | Medium | Open |
| A-012 | Finalize Account Reset Flow | BA/Backend | Medium | Open |

---

# 22. Definition of Done – Feedback Implementation

Feedback dapat dianggap selesai apabila:

- [ ] Requirement sudah dikonfirmasi.
- [ ] UI/UX sudah diperbarui.
- [ ] API/Database requirement sudah tersedia.
- [ ] Frontend implementation selesai.
- [ ] Backend implementation selesai.
- [ ] Role & permission sudah diuji.
- [ ] Academic Year + Period sudah diuji.
- [ ] Unit/integration testing selesai.
- [ ] QA testing selesai.
- [ ] UAT selesai.
- [ ] Tidak ada critical/high issue yang terbuka.
- [ ] Stakeholder menyetujui hasil UAT.

---

# 23. Change Log

| Version | Date | Description |
|---|---|---|
| 1.0 | 2026-09-22 | Initial consolidated feedback & MoM |
