import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api, buildQuery } from '@/lib/api'
import { useSnackbarStore } from '@/store/snackbarStore'
import { useRoleScope } from '@/hooks/useRoleScope'
import { useReferenceData } from '@/hooks/useReferenceData'
import { classIdOfStudent, classesForScope, defaultClassId } from '@/lib/scope'
import type { Gradebook } from '../models/types'

interface GradebookViewModel {
  gradebook: Gradebook | null
  loading: boolean
  saving: boolean
  canEditNotes: boolean
  isReadOnly: boolean
  classId: string
  subjectId: string
  setClassId: (value: string) => void
  setSubjectId: (value: string) => void
  availableClasses: ReturnType<typeof useReferenceData>['classes']
  availableSubjects: ReturnType<typeof useReferenceData>['subjects']
  reload: () => Promise<void>
  saveNote: (studentId: string, note: string) => Promise<boolean>
  subjectNameOf: (id: string | null | undefined) => string
  stats: { highest: number | null; lowest: number | null }
}

export function useGradebookViewModel(): GradebookViewModel {
  const { t } = useTranslation()
  const notify = useSnackbarStore((state) => state.notify)
  const scope = useRoleScope()
  const reference = useReferenceData()

  const [gradebook, setGradebook] = useState<Gradebook | null>(null)
  const [classId, setClassId] = useState('')
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
    if (classId) return
    if (scope.isReadOnly && ownClassId) {
      setClassId(ownClassId)
      return
    }
    const preferred = defaultClassId(availableClasses)
    if (preferred) setClassId(preferred)
  }, [availableClasses, classId, ownClassId, scope.isReadOnly])

  const load = useCallback(async () => {
    if (!classId) {
      setLoading(reference.loading)
      return
    }
    setLoading(true)
    try {
      const query = buildQuery({
        classId,
        subjectId,
        studentId: scope.isReadOnly ? scope.studentId : undefined,
      })
      setGradebook(await api.get<Gradebook>(`/api/grades${query}`))
    } catch {
      notify(t('errors.generic'), 'error')
    } finally {
      setLoading(false)
    }
  }, [classId, notify, reference.loading, scope.isReadOnly, scope.studentId, subjectId, t])

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

  const stats = useMemo(() => {
    const averages = (gradebook?.rows ?? [])
      .map((row) => row.average)
      .filter((value): value is number => value !== null)
    if (averages.length === 0) return { highest: null, lowest: null }
    return { highest: Math.max(...averages), lowest: Math.min(...averages) }
  }, [gradebook])

  return {
    gradebook,
    loading: loading || reference.loading,
    saving,
    canEditNotes: scope.isAdmin || scope.isTeacher,
    isReadOnly: scope.isReadOnly,
    classId,
    subjectId,
    setClassId,
    setSubjectId,
    availableClasses,
    availableSubjects: reference.subjects,
    reload: load,
    saveNote,
    subjectNameOf: reference.subjectNameOf,
    stats,
  }
}
