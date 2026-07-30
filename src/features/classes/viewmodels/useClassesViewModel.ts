import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { api } from '@/lib/api'
import { useSnackbarStore } from '@/store/snackbarStore'
import { useRoleScope } from '@/hooks/useRoleScope'
import { classesForScope } from '@/lib/scope'
import type { Subject, SubjectAssignment } from '@/features/subjects/models/types'
import type { Student, Teacher } from '@/features/users/models/types'
import type { SchoolClass, SchoolClassInput } from '../models/types'

export const classSchema = z.object({
  name: z.string().min(1, 'classes.validation.nameRequired'),
  grade: z
    .number({ invalid_type_error: 'classes.validation.gradeRange' })
    .int()
    .min(1, 'classes.validation.gradeRange')
    .max(6, 'classes.validation.gradeRange'),
  academicYear: z.string().min(1, 'classes.validation.academicYearRequired'),
  homeroomTeacherId: z.string().nullable(),
  room: z.string().min(1, 'classes.validation.roomRequired'),
  status: z.enum(['active', 'archived']),
})

export type ClassFormValues = z.infer<typeof classSchema>

interface ClassesViewModel {
  classes: SchoolClass[]
  teachers: Teacher[]
  students: Student[]
  subjects: Subject[]
  subjectAssignments: SubjectAssignment[]
  loading: boolean
  saving: boolean
  reload: () => Promise<void>
  createClass: (values: ClassFormValues) => Promise<boolean>
  updateClass: (id: string, values: ClassFormValues) => Promise<boolean>
  deleteClass: (id: string) => Promise<boolean>
  toggleArchive: (item: SchoolClass) => Promise<boolean>
  enrollStudents: (classId: string, studentIds: string[]) => Promise<boolean>
  removeStudent: (classId: string, studentId: string) => Promise<boolean>
  teacherNameOf: (id: string | null | undefined) => string
}

export function useClassesViewModel(): ClassesViewModel {
  const { t } = useTranslation()
  const notify = useSnackbarStore((state) => state.notify)
  const scope = useRoleScope()

  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [classList, teacherList, studentList, subjectList, assignmentList] = await Promise.all([
        api.get<SchoolClass[]>('/api/classes'),
        api.get<Teacher[]>('/api/users/teachers'),
        api.get<Student[]>('/api/users/students'),
        api.get<Subject[]>('/api/subjects'),
        api.get<SubjectAssignment[]>('/api/subject-assignments'),
      ])
      setClasses(classList)
      setTeachers(teacherList)
      setStudents(studentList)
      setSubjects(subjectList)
      setSubjectAssignments(assignmentList)
    } catch {
      notify(t('errors.generic'), 'error')
    } finally {
      setLoading(false)
    }
  }, [notify, t])

  useEffect(() => {
    void reload()
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

  const createClass = useCallback(
    (values: ClassFormValues) => {
      const payload: SchoolClassInput = { ...values, studentIds: [] }
      return run(() => api.post('/api/classes', payload), 'classes.createSuccess')
    },
    [run],
  )

  const updateClass = useCallback(
    (id: string, values: ClassFormValues) =>
      run(() => api.put(`/api/classes/${id}`, values), 'classes.updateSuccess'),
    [run],
  )

  const deleteClass = useCallback(
    (id: string) => run(() => api.delete(`/api/classes/${id}`), 'classes.deleteSuccess'),
    [run],
  )

  const toggleArchive = useCallback(
    (item: SchoolClass) =>
      run(
        () =>
          api.put(`/api/classes/${item.id}`, {
            status: item.status === 'active' ? 'archived' : 'active',
          }),
        'classes.updateSuccess',
      ),
    [run],
  )

  const enrollStudents = useCallback(
    (classId: string, studentIds: string[]) =>
      run(() => api.post(`/api/classes/${classId}/enroll`, { studentIds }), 'classes.enrollSuccess'),
    [run],
  )

  const removeStudent = useCallback(
    (classId: string, studentId: string) =>
      run(
        () => api.delete(`/api/classes/${classId}/enroll/${studentId}`),
        'classes.updateSuccess',
      ),
    [run],
  )

  const teacherNameOf = useCallback(
    (id: string | null | undefined) => teachers.find((item) => item.id === id)?.name ?? '-',
    [teachers],
  )

  const visibleClasses = useMemo(
    () => classesForScope(classes, subjectAssignments, students, scope),
    [classes, scope, students, subjectAssignments],
  )

  return {
    classes: visibleClasses,
    teachers,
    students,
    subjects,
    subjectAssignments,
    loading,
    saving,
    reload,
    createClass,
    updateClass,
    deleteClass,
    toggleArchive,
    enrollStudents,
    removeStudent,
    teacherNameOf,
  }
}
