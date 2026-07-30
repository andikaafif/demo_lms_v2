import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api, buildQuery } from '@/lib/api'
import { useSnackbarStore } from '@/store/snackbarStore'
import type { AttendanceSummary } from '@/features/attendance/models/types'
import type { Gradebook } from '@/features/gradebook/models/types'
import type { SchoolClass } from '@/features/classes/models/types'
import type { Student } from '../models/types'

interface StudentDetailViewModel {
  student: Student | null
  schoolClass: SchoolClass | null
  attendance: AttendanceSummary | null
  gradebook: Gradebook | null
  loading: boolean
  generating: boolean
  notFound: boolean
  generatedCredentials: { username: string; password: string } | null
  generateParentAccount: () => Promise<void>
  dismissCredentials: () => void
}

export function useStudentDetailViewModel(studentId: string | undefined): StudentDetailViewModel {
  const { t } = useTranslation()
  const notify = useSnackbarStore((state) => state.notify)

  const [student, setStudent] = useState<Student | null>(null)
  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null)
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null)
  const [gradebook, setGradebook] = useState<Gradebook | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string
    password: string
  } | null>(null)

  const load = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    setNotFound(false)
    try {
      const detail = await api.get<Student>(`/api/users/students/${studentId}`)
      setStudent(detail)

      const [classDetail, summary, grades] = await Promise.all([
        api.get<SchoolClass>(`/api/classes/${detail.classId}`).catch(() => null),
        api
          .get<AttendanceSummary>(
            `/api/attendance/summary${buildQuery({ classId: detail.classId, studentId })}`,
          )
          .catch(() => null),
        api
          .get<Gradebook>(`/api/grades${buildQuery({ classId: detail.classId, studentId })}`)
          .catch(() => null),
      ])
      setSchoolClass(classDetail)
      setAttendance(summary)
      setGradebook(grades)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    void load()
  }, [load])

  const generateParentAccount = useCallback(async () => {
    if (!studentId) return
    setGenerating(true)
    try {
      const result = await api.post<{ username: string; password: string }>(
        `/api/users/students/${studentId}/parent-account`,
      )
      setGeneratedCredentials({ username: result.username, password: result.password })
      notify(t('users.parentAccountCreated'), 'success')
      await load()
    } catch {
      notify(t('errors.generic'), 'error')
    } finally {
      setGenerating(false)
    }
  }, [load, notify, studentId, t])

  return {
    student,
    schoolClass,
    attendance,
    gradebook,
    loading,
    generating,
    notFound,
    generatedCredentials,
    generateParentAccount,
    dismissCredentials: () => setGeneratedCredentials(null),
  }
}
