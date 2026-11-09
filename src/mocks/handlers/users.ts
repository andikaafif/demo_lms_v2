import { HttpResponse, delay, http } from 'msw'
import type { Student, StudentInput, Teacher, TeacherInput } from '@/features/users/models/types'
import { db, nextId, randomAvatarColor } from '../data/db'

const todayIso = () => new Date().toISOString().slice(0, 10)

export const usersHandlers = [
  http.get('/api/users/teachers', async ({ request }) => {
    await delay(350)
    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const result = search
      ? db.teachers.filter(
          (teacher) =>
            teacher.name.toLowerCase().includes(search) ||
            teacher.employeeNumber.includes(search) ||
            teacher.email.toLowerCase().includes(search),
        )
      : db.teachers
    return HttpResponse.json(result)
  }),

  http.post('/api/users/teachers', async ({ request }) => {
    await delay(450)
    const body = (await request.json()) as TeacherInput
    const teacher: Teacher = {
      ...body,
      id: nextId('t'),
      avatarColor: randomAvatarColor(),
      joinedAt: todayIso(),
    }
    db.teachers.push(teacher)
    if (teacher.homeroomClassId) {
      const target = db.classes.find((item) => item.id === teacher.homeroomClassId)
      if (target) target.homeroomTeacherId = teacher.id
    }
    return HttpResponse.json(teacher, { status: 201 })
  }),

  http.put('/api/users/teachers/:id', async ({ params, request }) => {
    await delay(450)
    const body = (await request.json()) as Partial<TeacherInput>
    const index = db.teachers.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.teachers[index] = { ...db.teachers[index], ...body }
    return HttpResponse.json(db.teachers[index])
  }),

  http.delete('/api/users/teachers/:id', async ({ params }) => {
    await delay(400)
    const index = db.teachers.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.teachers.splice(index, 1)
    db.classes.forEach((item) => {
      if (item.homeroomTeacherId === params.id) item.homeroomTeacherId = null
    })
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/users/students', async ({ request }) => {
    await delay(350)
    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const classId = url.searchParams.get('classId')
    let result = db.students
    if (classId) result = result.filter((student) => student.classId === classId)
    if (search) {
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(search) ||
          student.nis.includes(search) ||
          student.nisn.includes(search),
      )
    }
    return HttpResponse.json(result)
  }),

  http.get('/api/users/students/:id', async ({ params }) => {
    await delay(300)
    const student = db.students.find((item) => item.id === params.id)
    if (!student) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    return HttpResponse.json(student)
  }),

  http.post('/api/users/students', async ({ request }) => {
    await delay(450)
    const body = (await request.json()) as StudentInput
    const student: Student = {
      ...body,
      id: nextId('st'),
      avatarColor: randomAvatarColor(),
      enrolledAt: todayIso(),
    }
    db.students.push(student)
    const target = db.classes.find((item) => item.id === student.classId)
    if (target && !target.studentIds.includes(student.id)) target.studentIds.push(student.id)
    return HttpResponse.json(student, { status: 201 })
  }),

  http.put('/api/users/students/:id', async ({ params, request }) => {
    await delay(450)
    const body = (await request.json()) as Partial<StudentInput>
    const index = db.students.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    const previous = db.students[index]
    const updated = { ...previous, ...body }
    db.students[index] = updated
    if (body.classId && body.classId !== previous.classId) {
      db.classes.forEach((item) => {
        item.studentIds = item.studentIds.filter((id) => id !== updated.id)
      })
      const target = db.classes.find((item) => item.id === updated.classId)
      if (target) target.studentIds.push(updated.id)
    }
    return HttpResponse.json(updated)
  }),

  http.delete('/api/users/students/:id', async ({ params }) => {
    await delay(400)
    const index = db.students.findIndex((item) => item.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    db.students.splice(index, 1)
    db.classes.forEach((item) => {
      item.studentIds = item.studentIds.filter((id) => id !== params.id)
    })
    return HttpResponse.json({ success: true })
  }),

  http.post('/api/users/students/:id/parent-account', async ({ params }) => {
    await delay(600)
    const student = db.students.find((item) => item.id === params.id)
    if (!student) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    student.parent.hasAccount = true
    const username = `ortu_${student.nis}`
    const existing = db.accounts.find((item) => item.username === username)
    if (!existing) {
      db.accounts.push({
        id: nextId('u'),
        username,
        password: 'ortu123',
        role: 'parent',
        name: student.parent.fatherName || student.parent.guardianName || 'Orang Tua',
        email: student.parent.email,
        avatarColor: randomAvatarColor(),
        childIds: [student.id],
      })
    }
    return HttpResponse.json({ username, password: 'ortu123', student })
  }),
  http.get('/api/users/accounts', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const search = (url.searchParams.get('search') ?? '').toLowerCase()
    const role = url.searchParams.get('role')
    let result = db.accounts
    if (role) result = result.filter((item) => item.role === role)
    if (search) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.username.toLowerCase().includes(search) ||
          item.email.toLowerCase().includes(search),
      )
    }
    return HttpResponse.json(
      result.map((account) => {
        const safe = { ...account }
        delete (safe as { password?: string }).password
        return safe
      }),
    )
  }),

  http.post('/api/users/accounts/:id/reset-password', async ({ params }) => {
    await delay(600)
    const account = db.accounts.find((item) => item.id === params.id)
    if (!account) return HttpResponse.json({ message: 'notFound' }, { status: 404 })
    const temporaryPassword = `Edu${Math.random().toString(36).slice(2, 8)}!`
    account.password = temporaryPassword
    return HttpResponse.json({
      userId: account.id,
      username: account.username,
      temporaryPassword,
      mustChangePassword: true,
    })
  }),
]
