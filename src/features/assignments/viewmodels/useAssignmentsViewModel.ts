import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { api, buildQuery } from '@/lib/api'
import { useSnackbarStore } from '@/store/snackbarStore'
import { useRoleScope } from '@/hooks/useRoleScope'
import { useReferenceData } from '@/hooks/useReferenceData'
import { classIdOfStudent, classesForScope } from '@/lib/scope'
import type {
  AssignmentInput,
  AssignmentWithStats,
  Submission,
} from '../models/types'

export const assignmentSchema = z.object({
  title: z.string().min(1, 'assignments.validation.titleRequired'),
  description: z.string().min(1, 'assignments.validation.descriptionRequired'),
  subjectId: z.string().min(1, 'assignments.validation.subjectRequired'),
  classId: z.string().min(1, 'assignments.validation.classRequired'),
  dueDate: z.string().min(1, 'assignments.validation.dueDateRequired'),
  maxScore: z
    .number({ invalid_type_error: 'assignments.validation.maxScoreRange' })
    .int()
    .min(1, 'assignments.validation.maxScoreRange')
    .max(100, 'assignments.validation.maxScoreRange'),
  allowFileUpload: z.boolean(),
  allowTextAnswer: z.boolean(),
})

export type AssignmentFormValues = z.infer<typeof assignmentSchema>

export const submissionSchema = z.object({
  textAnswer: z.string().min(1, 'assignments.validation.answerRequired'),
  fileName: z.string().optional(),
})

export type SubmissionFormValues = z.infer<typeof submissionSchema>

interface AssignmentsViewModel {
  assignments: AssignmentWithStats[]
  submissions: Submission[]
  loading: boolean
  saving: boolean
  canManage: boolean
  isStudent: boolean
  isParent: boolean
  classFilter: string
  subjectFilter: string
  availableClasses: ReturnType<typeof useReferenceData>['classes']
  availableSubjects: ReturnType<typeof useReferenceData>['subjects']
  students: ReturnType<typeof useReferenceData>['students']
  setClassFilter: (value: string) => void
  setSubjectFilter: (value: string) => void
  reload: () => Promise<void>
  createAssignment: (values: AssignmentFormValues) => Promise<boolean>
  updateAssignment: (id: string, values: AssignmentFormValues) => Promise<boolean>
  deleteAssignment: (id: string) => Promise<boolean>
  submitAssignment: (assignmentId: string, values: SubmissionFormValues) => Promise<boolean>
  gradeSubmission: (submissionId: string, score: number, feedback: string) => Promise<boolean>
  submissionsFor: (assignmentId: string) => Submission[]
  mySubmissionFor: (assignmentId: string) => Submission | undefined
  subjectNameOf: (id: string | null | undefined) => string
  subjectColorOf: (id: string | null | undefined) => string
  classNameOf: (id: string | null | undefined) => string
  teacherNameOf: (id: string | null | undefined) => string
  studentNameOf: (id: string | null | undefined) => string
}

export function useAssignmentsViewModel(): AssignmentsViewModel {
  const { t } = useTranslation()
  const notify = useSnackbarStore((state) => state.notify)
  const scope = useRoleScope()
  const reference = useReferenceData()

  const [assignments, setAssignments] = useState<AssignmentWithStats[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [classFilter, setClassFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')

  const ownClassId = useMemo(
    () => classIdOfStudent(reference.students, scope.studentId),
    [reference.students, scope.studentId],
  )

  const availableClasses = useMemo(
    () => classesForScope(reference.classes, reference.subjectAssignments, reference.students, scope),
    [reference.classes, reference.students, reference.subjectAssignments, scope],
  )

  const effectiveClassId = scope.isReadOnly ? ownClassId : classFilter

  const load = useCallback(async () => {
    if (scope.isReadOnly && !ownClassId) {
      setAssignments([])
      setSubmissions([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const list = await api.get<AssignmentWithStats[]>(
        `/api/assignments${buildQuery({ classId: effectiveClassId, subjectId: subjectFilter })}`,
      )
      setAssignments(list)
      const submissionQuery = scope.isReadOnly ? buildQuery({ studentId: scope.studentId }) : ''
      setSubmissions(await api.get<Submission[]>(`/api/submissions${submissionQuery}`))
    } catch {
      notify(t('errors.generic'), 'error')
    } finally {
      setLoading(false)
    }
  }, [effectiveClassId, notify, ownClassId, scope.isReadOnly, scope.studentId, subjectFilter, t])

  useEffect(() => {
    void load()
  }, [load])

  const run = useCallback(
    async (action: () => Promise<unknown>, successKey: string) => {
      setSaving(true)
      try {
        await action()
        await load()
        notify(t(successKey), 'success')
        return true
      } catch {
        notify(t('errors.generic'), 'error')
        return false
      } finally {
        setSaving(false)
      }
    },
    [load, notify, t],
  )

  const toInput = useCallback(
    (values: AssignmentFormValues): AssignmentInput => ({
      ...values,
      dueDate: new Date(values.dueDate).toISOString(),
      teacherId: scope.teacherId ?? 't-1',
    }),
    [scope.teacherId],
  )

  const submitAssignment = useCallback(
    (assignmentId: string, values: SubmissionFormValues) =>
      run(
        () =>
          api.post(`/api/assignments/${assignmentId}/submit`, {
            studentId: scope.studentId,
            textAnswer: values.textAnswer,
            files: values.fileName
              ? [
                  {
                    id: `file-${Date.now()}`,
                    name: values.fileName,
                    sizeKb: 640,
                    url: `/files/${values.fileName.toLowerCase().replace(/\s+/g, '-')}`,
                  },
                ]
              : [],
          }),
        'assignments.submitSuccess',
      ),
    [run, scope.studentId],
  )

  return {
    assignments,
    submissions,
    loading: loading || reference.loading,
    saving,
    canManage: scope.isAdmin || scope.isTeacher,
    isStudent: scope.isStudent,
    isParent: scope.isParent,
    classFilter,
    subjectFilter,
    availableClasses,
    availableSubjects: reference.subjects,
    students: reference.students,
    setClassFilter,
    setSubjectFilter,
    reload: load,
    createAssignment: (values) =>
      run(() => api.post('/api/assignments', toInput(values)), 'assignments.createSuccess'),
    updateAssignment: (id, values) =>
      run(() => api.put(`/api/assignments/${id}`, toInput(values)), 'assignments.updateSuccess'),
    deleteAssignment: (id) =>
      run(() => api.delete(`/api/assignments/${id}`), 'assignments.deleteSuccess'),
    submitAssignment,
    gradeSubmission: (submissionId, score, feedback) =>
      run(
        () => api.put(`/api/submissions/${submissionId}/grade`, { score, feedback }),
        'assignments.gradeSuccess',
      ),
    submissionsFor: (assignmentId) =>
      submissions.filter((item) => item.assignmentId === assignmentId),
    mySubmissionFor: (assignmentId) =>
      submissions.find(
        (item) => item.assignmentId === assignmentId && item.studentId === scope.studentId,
      ),
    subjectNameOf: reference.subjectNameOf,
    subjectColorOf: reference.subjectColorOf,
    classNameOf: reference.classNameOf,
    teacherNameOf: reference.teacherNameOf,
    studentNameOf: reference.studentNameOf,
  }
}
