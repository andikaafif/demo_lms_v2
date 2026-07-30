import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { api } from '@/lib/api'
import { useSnackbarStore } from '@/store/snackbarStore'
import type { SchoolClass } from '@/features/classes/models/types'
import type { Teacher } from '@/features/users/models/types'
import type { Subject, SubjectAssignment } from '../models/types'

export const subjectSchema = z.object({
  name: z.string().min(1, 'subjects.validation.nameRequired'),
  code: z.string().min(1, 'subjects.validation.codeRequired'),
  color: z.string().min(1, 'subjects.validation.codeRequired'),
  description: z.string(),
  weeklyHours: z
    .number({ invalid_type_error: 'subjects.validation.hoursRange' })
    .int()
    .min(1, 'subjects.validation.hoursRange')
    .max(12, 'subjects.validation.hoursRange'),
})

export type SubjectFormValues = z.infer<typeof subjectSchema>

export const subjectAssignmentSchema = z.object({
  subjectId: z.string().min(1, 'materials.validation.subjectRequired'),
  classId: z.string().min(1, 'materials.validation.classRequired'),
  teacherId: z.string().min(1, 'users.validation.nameRequired'),
  schedule: z.string().min(1, 'subjects.validation.codeRequired'),
})

export type SubjectAssignmentFormValues = z.infer<typeof subjectAssignmentSchema>

interface SubjectsViewModel {
  subjects: Subject[]
  subjectAssignments: SubjectAssignment[]
  teachers: Teacher[]
  classes: SchoolClass[]
  loading: boolean
  saving: boolean
  reload: () => Promise<void>
  createSubject: (values: SubjectFormValues) => Promise<boolean>
  updateSubject: (id: string, values: SubjectFormValues) => Promise<boolean>
  deleteSubject: (id: string) => Promise<boolean>
  createAssignment: (values: SubjectAssignmentFormValues) => Promise<boolean>
  updateAssignment: (id: string, values: SubjectAssignmentFormValues) => Promise<boolean>
  deleteAssignment: (id: string) => Promise<boolean>
  subjectNameOf: (id: string) => string
  subjectColorOf: (id: string) => string
  classNameOf: (id: string) => string
  teacherNameOf: (id: string) => string
}

export function useSubjectsViewModel(): SubjectsViewModel {
  const { t } = useTranslation()
  const notify = useSnackbarStore((state) => state.notify)

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignment[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [subjectList, assignmentList, teacherList, classList] = await Promise.all([
        api.get<Subject[]>('/api/subjects'),
        api.get<SubjectAssignment[]>('/api/subject-assignments'),
        api.get<Teacher[]>('/api/users/teachers'),
        api.get<SchoolClass[]>('/api/classes'),
      ])
      setSubjects(subjectList)
      setSubjectAssignments(assignmentList)
      setTeachers(teacherList)
      setClasses(classList)
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

  return {
    subjects,
    subjectAssignments,
    teachers,
    classes,
    loading,
    saving,
    reload,
    createSubject: (values) => run(() => api.post('/api/subjects', values), 'subjects.createSuccess'),
    updateSubject: (id, values) =>
      run(() => api.put(`/api/subjects/${id}`, values), 'subjects.updateSuccess'),
    deleteSubject: (id) => run(() => api.delete(`/api/subjects/${id}`), 'subjects.deleteSuccess'),
    createAssignment: (values) =>
      run(() => api.post('/api/subject-assignments', values), 'subjects.createSuccess'),
    updateAssignment: (id, values) =>
      run(() => api.put(`/api/subject-assignments/${id}`, values), 'subjects.updateSuccess'),
    deleteAssignment: (id) =>
      run(() => api.delete(`/api/subject-assignments/${id}`), 'subjects.deleteSuccess'),
    subjectNameOf: (id) => subjects.find((item) => item.id === id)?.name ?? '-',
    subjectColorOf: (id) => subjects.find((item) => item.id === id)?.color ?? '#3F51B5',
    classNameOf: (id) => classes.find((item) => item.id === id)?.name ?? '-',
    teacherNameOf: (id) => teachers.find((item) => item.id === id)?.name ?? '-',
  }
}
