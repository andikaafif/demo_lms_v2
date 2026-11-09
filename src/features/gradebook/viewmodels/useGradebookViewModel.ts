import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api, buildQuery } from '@/lib/api'
import { useSnackbarStore } from '@/store/snackbarStore'
import { useRoleScope } from '@/hooks/useRoleScope'
import { useAcademicContext } from '@/hooks/useAcademicContext'
import { useReferenceData } from '@/hooks/useReferenceData'
import { classIdOfStudent, classesForScope, defaultClassId } from '@/lib/scope'
import type {
  AttitudeGrade,
  AttitudeGradebook,
  Gradebook,
  SubjectRecap,
} from '../models/types'

interface GradebookViewModel {
  gradebook: Gradebook | null
  recap: SubjectRecap | null
  attitude: AttitudeGradebook | null
  loading: boolean
  saving: boolean
  canEditNotes: boolean
  canEditAttitude: boolean
  isReadOnly: boolean
  classId: string
  subjectId: string
  setClassId: (value: string) => void
  setSubjectId: (value: string) => void
  availableClasses: ReturnType<typeof useReferenceData>['classes']
  availableSubjects: ReturnType<typeof useReferenceData>['subjects']
  reload: () => Promise<void>
  saveNote: (studentId: string, note: string) => Promise<boolean>
  saveAttitude: (studentId: string, grade: AttitudeGrade, note: string) => Promise<boolean>
  subjectNameOf: (id: string | null | undefined) => string
  stats: { highest: number | null; lowest: number | null }
}

export function useGradebookViewModel(options?: { classId?: string }): GradebookViewModel {
  const { t } = useTranslation()
  const notify = useSnackbarStore((state) => state.notify)
  const scope = useRoleScope()
  const academic = useAcademicContext()
  const reference = useReferenceData()

  const [gradebook, setGradebook] = useState<Gradebook | null>(null)
  const [recap, setRecap] = useState<SubjectRecap | null>(null)
  const [attitude, setAttitude] = useState<AttitudeGradebook | null>(null)
  const [internalClassId, setClassId] = useState('')
  const classId = options?.classId ?? internalClassId
  const [subjectId, setSubjectId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const availableClasses = useMemo(
    () => classesForScope(reference.classes, reference.subjectAssignments, reference.students, scope),
    [reference.classes, reference.students, reference.subjectAssignments, scope],
  )

  const ownClassId = useMemo(
    () => classIdOfStudent(reference.students, scope.studentId),
    [reference.students, scope.studentId],
  )

  useEffect(() => {
    if (options?.classId) return
    if (internalClassId) return
    if (scope.isReadOnly && ownClassId) {
      setClassId(ownClassId)
      return
    }
    const preferred = defaultClassId(availableClasses)
    if (preferred) setClassId(preferred)
  }, [availableClasses, internalClassId, options?.classId, ownClassId, scope.isReadOnly])

  const load = useCallback(async () => {
    if (!classId) {
      setLoading(reference.loading)
      return
    }
    setLoading(true)
    try {
      const context = {
        classId,
        academicYearId: academic.academicYearId,
        periodId: academic.periodId,
      }
      const [gradebookData, recapData, attitudeData] = await Promise.all([
        api.get<Gradebook>(
          `/api/grades${buildQuery({
            ...context,
            subjectId,
            studentId: scope.isReadOnly ? scope.studentId : undefined,
          })}`,
        ),
        api.get<SubjectRecap>(`/api/grades/recap${buildQuery(context)}`).catch(() => null),
        api.get<AttitudeGradebook>(`/api/grades/attitude${buildQuery(context)}`).catch(() => null),
      ])
      setGradebook(gradebookData)
      setRecap(recapData)
      setAttitude(attitudeData)
    } catch {
      notify(t('errors.generic'), 'error')
    } finally {
      setLoading(false)
    }
  }, [
    academic.academicYearId,
    academic.periodId,
    classId,
    notify,
    reference.loading,
    scope.isReadOnly,
    scope.studentId,
    subjectId,
    t,
  ])

  useEffect(() => {
    void load()
  }, [load])

  const saveNote = useCallback(
    async (studentId: string, note: string) => {
      setSaving(true)
      try {
        await api.put(`/api/grades/notes/${studentId}`, { note })
        await load()
        notify(t('gradebook.noteSaved'), 'success')
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

  const saveAttitude = useCallback(
    async (studentId: string, grade: AttitudeGrade, note: string) => {
      setSaving(true)
      try {
        await api.put(`/api/grades/attitude/${studentId}`, { grade, note })
        await load()
        notify(t('gradebook.attitudeSaved'), 'success')
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

  const stats = useMemo(() => {
    const averages = (gradebook?.rows ?? [])
      .map((row) => row.average)
      .filter((value): value is number => value !== null)
    if (averages.length === 0) return { highest: null, lowest: null }
    return { highest: Math.max(...averages), lowest: Math.min(...averages) }
  }, [gradebook])

  return {
    gradebook,
    recap,
    attitude,
    loading: loading || reference.loading,
    saving,
    canEditNotes: scope.isAdmin || scope.isTeacher,
    canEditAttitude: scope.isAdmin || scope.isTeacher || scope.isHomeroomTeacher,
    isReadOnly: scope.isReadOnly,
    classId,
    subjectId,
    setClassId,
    setSubjectId,
    availableClasses,
    availableSubjects: reference.subjects,
    reload: load,
    saveNote,
    saveAttitude,
    subjectNameOf: reference.subjectNameOf,
    stats,
  }
}
