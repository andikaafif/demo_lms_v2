import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { api, buildQuery } from '@/lib/api'
import { useSnackbarStore } from '@/store/snackbarStore'
import type { SchoolClass } from '@/features/classes/models/types'
import type { Subject } from '@/features/subjects/models/types'
import type { Student, StudentInput, Teacher, TeacherInput } from '../models/types'

export const teacherSchema = z.object({
  name: z.string().min(1, 'users.validation.nameRequired'),
  employeeNumber: z.string(),
  email: z.string().email('users.validation.emailInvalid'),
  phone: z.string().min(1, 'users.validation.phoneRequired'),
  gender: z.enum(['L', 'P']),
  subjectIds: z.array(z.string()),
  homeroomClassId: z.string().nullable(),
  accountStatus: z.enum(['active', 'inactive']),
  username: z.string().min(3, 'auth.usernameMin'),
})

export type TeacherFormValues = z.infer<typeof teacherSchema>

export const studentSchema = z.object({
  name: z.string().min(1, 'users.validation.nameRequired'),
  nis: z.string().min(1, 'users.validation.nisRequired'),
  nisn: z.string().min(1, 'users.validation.nisnRequired'),
  classId: z.string().min(1, 'users.validation.classRequired'),
  gender: z.enum(['L', 'P']),
  birthDate: z.string().min(1, 'users.validation.birthDateRequired'),
  address: z.string(),
  academicStatus: z.enum(['active', 'graduated', 'transferred']),
  parent: z.object({
    fatherName: z.string().min(1, 'users.validation.nameRequired'),
    motherName: z.string().min(1, 'users.validation.nameRequired'),
    guardianName: z.string().optional(),
    phone: z.string().min(1, 'users.validation.phoneRequired'),
    email: z.string().email('users.validation.emailInvalid').or(z.literal('')),
    occupation: z.string(),
    address: z.string(),
    hasAccount: z.boolean(),
  }),
})

export type StudentFormValues = z.infer<typeof studentSchema>

interface UsersViewModel {
  teachers: Teacher[]
  students: Student[]
  classes: SchoolClass[]
  subjects: Subject[]
  loading: boolean
  saving: boolean
  teacherSearch: string
  studentSearch: string
  studentClassFilter: string
  setTeacherSearch: (value: string) => void
  setStudentSearch: (value: string) => void
  setStudentClassFilter: (value: string) => void
  reload: () => Promise<void>
  createTeacher: (values: TeacherFormValues) => Promise<boolean>
  updateTeacher: (id: string, values: TeacherFormValues) => Promise<boolean>
  deleteTeacher: (id: string) => Promise<boolean>
  createStudent: (values: StudentFormValues) => Promise<boolean>
  updateStudent: (id: string, values: StudentFormValues) => Promise<boolean>
  deleteStudent: (id: string) => Promise<boolean>
  classNameOf: (id: string | null | undefined) => string
  subjectNamesOf: (ids: string[]) => string[]
}

export function useUsersViewModel(): UsersViewModel {
  const { t } = useTranslation()
  const notify = useSnackbarStore((state) => state.notify)

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [teacherSearch, setTeacherSearch] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [studentClassFilter, setStudentClassFilter] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [teacherList, studentList, classList, subjectList] = await Promise.all([
        api.get<Teacher[]>(`/api/users/teachers${buildQuery({ search: teacherSearch })}`),
        api.get<Student[]>(
          `/api/users/students${buildQuery({ search: studentSearch, classId: studentClassFilter })}`,
        ),
        api.get<SchoolClass[]>('/api/classes'),
        api.get<Subject[]>('/api/subjects'),
      ])
      setTeachers(teacherList)
      setStudents(studentList)
      setClasses(classList)
      setSubjects(subjectList)
    } catch {
      notify(t('errors.generic'), 'error')
    } finally {
      setLoading(false)
    }
  }, [notify, studentClassFilter, studentSearch, t, teacherSearch])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload()
    }, 220)
    return () => window.clearTimeout(timer)
  }, [reload])

  const run = useCallback(
    async (action: () => Promise<unknown>, successKey: string) => {
      setSaving(true)
      try {
        await action()
        await reload()
        notify(t(successKey), 'success')
        return true
      } catch {
        notify(t('errors.generic'), 'error')
        return false
      } finally {
        setSaving(false)
      }
    },
    [notify, reload, t],
  )

  const toTeacherInput = (values: TeacherFormValues): TeacherInput => ({
    ...values,
    homeroomClassId: values.homeroomClassId || null,
  })

  const toStudentInput = (values: StudentFormValues): StudentInput => ({
    ...values,
    parent: {
      ...values.parent,
      guardianName: values.parent.guardianName ?? '',
    },
  })

  const createTeacher = useCallback(
    (values: TeacherFormValues) =>
      run(() => api.post('/api/users/teachers', toTeacherInput(values)), 'users.createSuccess'),
    [run],
  )

  const updateTeacher = useCallback(
    (id: string, values: TeacherFormValues) =>
      run(() => api.put(`/api/users/teachers/${id}`, toTeacherInput(values)), 'users.updateSuccess'),
    [run],
  )

  const deleteTeacher = useCallback(
    (id: string) => run(() => api.delete(`/api/users/teachers/${id}`), 'users.deleteSuccess'),
    [run],
  )

  const createStudent = useCallback(
    (values: StudentFormValues) =>
      run(() => api.post('/api/users/students', toStudentInput(values)), 'users.createSuccess'),
    [run],
  )

  const updateStudent = useCallback(
    (id: string, values: StudentFormValues) =>
      run(() => api.put(`/api/users/students/${id}`, toStudentInput(values)), 'users.updateSuccess'),
    [run],
  )

  const deleteStudent = useCallback(
    (id: string) => run(() => api.delete(`/api/users/students/${id}`), 'users.deleteSuccess'),
    [run],
  )

  const classNameOf = useCallback(
    (id: string | null | undefined) => classes.find((item) => item.id === id)?.name ?? '-',
    [classes],
  )

  const subjectNamesOf = useCallback(
    (ids: string[]) =>
      ids
        .map((id) => subjects.find((item) => item.id === id)?.name)
        .filter((value): value is string => Boolean(value)),
    [subjects],
  )

  return useMemo(
    () => ({
      teachers,
      students,
      classes,
      subjects,
      loading,
      saving,
      teacherSearch,
      studentSearch,
      studentClassFilter,
      setTeacherSearch,
      setStudentSearch,
      setStudentClassFilter,
      reload,
      createTeacher,
      updateTeacher,
      deleteTeacher,
      createStudent,
      updateStudent,
      deleteStudent,
      classNameOf,
      subjectNamesOf,
    }),
    [
      classNameOf,
      classes,
      createStudent,
      createTeacher,
      deleteStudent,
      deleteTeacher,
      loading,
      reload,
      saving,
      studentClassFilter,
      studentSearch,
      students,
      subjectNamesOf,
      subjects,
      teacherSearch,
      teachers,
      updateStudent,
      updateTeacher,
    ],
  )
}
