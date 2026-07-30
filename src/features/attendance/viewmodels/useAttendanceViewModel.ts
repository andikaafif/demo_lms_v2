import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api, buildQuery } from '@/lib/api'
import { useSnackbarStore } from '@/store/snackbarStore'
import { useRoleScope } from '@/hooks/useRoleScope'
import { useReferenceData } from '@/hooks/useReferenceData'
import { classIdOfStudent, classesForScope, defaultClassId, subjectIdsForTeacherInClass } from '@/lib/scope'
import { todayKey } from '@/lib/format'
import type { Student } from '@/features/users/models/types'
import type {
  AttendanceEntry,
  AttendanceSession,
  AttendanceStatus,
  AttendanceSummary,
} from '../models/types'

interface AttendanceViewModel {
  canRecord: boolean
  loading: boolean
  saving: boolean
  classId: string
  subjectId: string
  date: string
  setClassId: (value: string) => void
  setSubjectId: (value: string) => void
  setDate: (value: string) => void
  availableClasses: ReturnType<typeof useReferenceData>['classes']
  availableSubjects: ReturnType<typeof useReferenceData>['subjects']
  classStudents: Student[]
  entries: Record<string, AttendanceEntry>
  existingSession: AttendanceSession | null
  sessions: AttendanceSession[]
  summary: AttendanceSummary | null
  setStatus: (studentId: string, status: AttendanceStatus) => void
  setNote: (studentId: string, note: string) => void
  markAllPresent: () => void
  save: () => Promise<boolean>
  studentNameOf: (id: string | null | undefined) => string
  subjectNameOf: (id: string | null | undefined) => string
  classNameOf: (id: string | null | undefined) => string
}

export function useAttendanceViewModel(): AttendanceViewModel {
  const { t } = useTranslation()
  const notify = useSnackbarStore((state) => state.notify)
  const scope = useRoleScope()
  const reference = useReferenceData()

  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [date, setDate] = useState(todayKey())
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)
  const [entries, setEntries] = useState<Record<string, AttendanceEntry>>({})
  const [loading, setLoading] = useState(false)
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

  const availableSubjects = useMemo(() => {
    if (!classId) return reference.subjects
    const ids = subjectIdsForTeacherInClass(
      reference.subjectAssignments,
      scope.isTeacher ? scope.teacherId : undefined,
      classId,
    )
    const scoped = reference.subjects.filter((item) => ids.includes(item.id))
    return scoped.length > 0 ? scoped : reference.subjects
  }, [classId, reference.subjectAssignments, reference.subjects, scope.isTeacher, scope.teacherId])

  useEffect(() => {
    if (availableSubjects.length === 0) return
    if (!availableSubjects.some((item) => item.id === subjectId)) {
      setSubjectId(availableSubjects[0].id)
    }
  }, [availableSubjects, subjectId])

  const classStudents = useMemo(
    () => reference.students.filter((item) => item.classId === classId),
    [classId, reference.students],
  )

  const load = useCallback(async () => {
    if (!classId) return
    setLoading(true)
    try {
      const [sessionList, summaryData] = await Promise.all([
        api.get<AttendanceSession[]>(`/api/attendance${buildQuery({ classId })}`),
        api.get<AttendanceSummary>(
          `/api/attendance/summary${buildQuery({
            classId,
            studentId: scope.isReadOnly ? scope.studentId : undefined,
          })}`,
        ),
      ])
      setSessions(sessionList)
      setSummary(summaryData)
    } catch {
      notify(t('errors.generic'), 'error')
    } finally {
      setLoading(false)
    }
  }, [classId, notify, scope.isReadOnly, scope.studentId, t])

  useEffect(() => {
    void load()
  }, [load])

  const existingSession = useMemo(
    () =>
      sessions.find(
        (item) => item.classId === classId && item.subjectId === subjectId && item.date === date,
      ) ?? null,
    [classId, date, sessions, subjectId],
  )

  useEffect(() => {
    const next: Record<string, AttendanceEntry> = {}
    classStudents.forEach((student) => {
      const found = existingSession?.entries.find((entry) => entry.studentId === student.id)
      next[student.id] = found ?? { studentId: student.id, status: 'present', note: '' }
    })
    setEntries(next)
  }, [classStudents, existingSession])

  const save = useCallback(async () => {
    if (!classId || !subjectId || !date) {
      notify(t('attendance.selectFirst'), 'warning')
      return false
    }
    setSaving(true)
    try {
      await api.post('/api/attendance', {
        classId,
        subjectId,
        teacherId: scope.teacherId ?? 't-1',
        date,
        entries: Object.values(entries),
      })
      await load()
      notify(t('attendance.saveSuccess'), 'success')
      return true
    } catch {
      notify(t('errors.generic'), 'error')
      return false
    } finally {
      setSaving(false)
    }
  }, [classId, date, entries, load, notify, scope.teacherId, subjectId, t])

  return {
    canRecord: scope.isAdmin || scope.isTeacher,
    loading: loading || reference.loading,
    saving,
    classId,
    subjectId,
    date,
    setClassId,
    setSubjectId,
    setDate,
    availableClasses,
    availableSubjects,
    classStudents,
    entries,
    existingSession,
    sessions,
    summary,
    setStatus: (studentId, status) =>
      setEntries((previous) => ({
        ...previous,
        [studentId]: { ...previous[studentId], studentId, status },
      })),
    setNote: (studentId, note) =>
      setEntries((previous) => ({
        ...previous,
        [studentId]: { ...previous[studentId], studentId, note },
      })),
    markAllPresent: () =>
      setEntries((previous) => {
        const next: Record<string, AttendanceEntry> = {}
        Object.entries(previous).forEach(([id, entry]) => {
          next[id] = { ...entry, status: 'present', note: '' }
        })
        return next
      }),
    save,
    studentNameOf: reference.studentNameOf,
    subjectNameOf: reference.subjectNameOf,
    classNameOf: reference.classNameOf,
  }
}
