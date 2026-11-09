import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api, buildQuery } from '@/lib/api'
import { useSnackbarStore } from '@/store/snackbarStore'
import { useAcademicContext } from '@/hooks/useAcademicContext'
import { useReferenceData } from '@/hooks/useReferenceData'
import { todayKey } from '@/lib/format'
import type {
  AttendanceEntry,
  AttendanceMonitorRow,
  AttendanceSession,
  AttendanceStatus,
} from '../models/types'

interface AttendanceMonitorViewModel {
  loading: boolean
  saving: boolean
  date: string
  classFilter: string
  subjectFilter: string
  search: string
  rows: AttendanceMonitorRow[]
  classes: ReturnType<typeof useReferenceData>['classes']
  subjects: ReturnType<typeof useReferenceData>['subjects']
  setDate: (value: string) => void
  setClassFilter: (value: string) => void
  setSubjectFilter: (value: string) => void
  setSearch: (value: string) => void
  resetFilters: () => void
  reload: () => Promise<void>
  detail: AttendanceSession | null
  detailLoading: boolean
  openDetail: (sessionId: string) => Promise<void>
  closeDetail: () => void
  overrideEntries: Record<string, AttendanceEntry>
  setOverrideStatus: (studentId: string, status: AttendanceStatus) => void
  overrideReason: string
  setOverrideReason: (value: string) => void
  saveOverride: () => Promise<boolean>
  exportCsv: () => void
  studentNameOf: (id: string | null | undefined) => string
  subjectNameOf: (id: string | null | undefined) => string
}

export function useAttendanceMonitorViewModel(): AttendanceMonitorViewModel {
  const { t } = useTranslation()
  const notify = useSnackbarStore((state) => state.notify)
  const academic = useAcademicContext()
  const reference = useReferenceData()

  const [date, setDate] = useState(todayKey())
  const [classFilter, setClassFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<AttendanceMonitorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [detail, setDetail] = useState<AttendanceSession | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [overrideEntries, setOverrideEntries] = useState<Record<string, AttendanceEntry>>({})
  const [overrideReason, setOverrideReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const query = buildQuery({
        date,
        classId: classFilter,
        subjectId: subjectFilter,
        search,
        academicYearId: academic.academicYearId,
        periodId: academic.periodId,
      })
      setRows(await api.get<AttendanceMonitorRow[]>(`/api/attendance/monitor${query}`))
    } catch {
      notify(t('errors.generic'), 'error')
    } finally {
      setLoading(false)
    }
  }, [academic.academicYearId, academic.periodId, classFilter, date, notify, search, subjectFilter, t])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 200)
    return () => window.clearTimeout(timer)
  }, [load])

  const openDetail = useCallback(
    async (sessionId: string) => {
      setDetailLoading(true)
      try {
        const sessions = await api.get<AttendanceSession[]>(
          `/api/attendance${buildQuery({
            academicYearId: academic.academicYearId,
            periodId: academic.periodId,
          })}`,
        )
        const found = sessions.find((item) => item.id === sessionId) ?? null
        setDetail(found)
        setOverrideReason('')
        const next: Record<string, AttendanceEntry> = {}
        found?.entries.forEach((entry) => {
          next[entry.studentId] = { ...entry }
        })
        setOverrideEntries(next)
      } catch {
        notify(t('errors.generic'), 'error')
      } finally {
        setDetailLoading(false)
      }
    },
    [academic.academicYearId, academic.periodId, notify, t],
  )

  const closeDetail = useCallback(() => {
    setDetail(null)
    setOverrideEntries({})
    setOverrideReason('')
  }, [])

  const saveOverride = useCallback(async () => {
    if (!detail) return false
    if (!overrideReason.trim()) {
      notify(t('attendance.overrideReasonRequired'), 'warning')
      return false
    }
    setSaving(true)
    try {
      await api.put(`/api/attendance/${detail.id}/override`, {
        entries: Object.values(overrideEntries),
        reason: overrideReason,
        updatedBy: 'u-admin',
        updatedByName: 'Administrator',
      })
      await load()
      await openDetail(detail.id)
      notify(t('attendance.overrideSuccess'), 'success')
      return true
    } catch {
      notify(t('attendance.overrideNotAllowed'), 'error')
      return false
    } finally {
      setSaving(false)
    }
  }, [detail, load, notify, openDetail, overrideEntries, overrideReason, t])

  const exportCsv = useCallback(() => {
    const header = [
      'Tanggal',
      'Kelas',
      'Mata Pelajaran',
      'Guru',
      'Pertemuan',
      'Jam',
      'Status Submit',
      'Hadir',
      'Sakit',
      'Izin',
      'Alpa',
      'Total',
    ]
    const lines = rows.map((row) => [
      row.date,
      row.className,
      row.subjectName,
      row.teacherName,
      String(row.meeting),
      `${row.startTime}-${row.endTime}`,
      row.submitted ? 'Submitted' : 'Not Submitted',
      String(row.present),
      String(row.sick),
      String(row.permission),
      String(row.absent),
      String(row.total),
    ])
    const csv = [header, ...lines]
      .map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\r\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `presensi-${date}.csv`
    link.click()
    URL.revokeObjectURL(url)
    notify(t('attendance.exportSuccess'), 'success')
  }, [date, notify, rows, t])

  const resetFilters = useCallback(() => {
    setClassFilter('')
    setSubjectFilter('')
    setSearch('')
    setDate(todayKey())
  }, [])

  const classes = useMemo(() => reference.classes, [reference.classes])
  const subjects = useMemo(() => reference.subjects, [reference.subjects])

  return {
    loading: loading || reference.loading,
    saving,
    date,
    classFilter,
    subjectFilter,
    search,
    rows,
    classes,
    subjects,
    setDate,
    setClassFilter,
    setSubjectFilter,
    setSearch,
    resetFilters,
    reload: load,
    detail,
    detailLoading,
    openDetail,
    closeDetail,
    overrideEntries,
    setOverrideStatus: (studentId, status) =>
      setOverrideEntries((previous) => ({
        ...previous,
        [studentId]: { ...previous[studentId], studentId, status },
      })),
    overrideReason,
    setOverrideReason,
    saveOverride,
    exportCsv,
    studentNameOf: reference.studentNameOf,
    subjectNameOf: reference.subjectNameOf,
  }
}
