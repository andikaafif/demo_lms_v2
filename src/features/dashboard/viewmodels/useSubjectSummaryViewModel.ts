import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api, buildQuery } from '@/lib/api'
import { useSnackbarStore } from '@/store/snackbarStore'
import { useRoleScope } from '@/hooks/useRoleScope'
import { useAcademicContext } from '@/hooks/useAcademicContext'
import { useReferenceData } from '@/hooks/useReferenceData'
import { classIdOfStudent } from '@/lib/scope'
import type { AssignmentWithStats, Submission } from '@/features/assignments/models/types'
import type { AttendanceSession } from '@/features/attendance/models/types'
import type { Material } from '@/features/materials/models/types'

export interface SubjectSummaryRow {
  subjectId: string
  subjectName: string
  subjectColor: string
  teacherName: string
  present: number
  sick: number
  permission: number
  absent: number
  totalSessions: number
  presentRate: number
  materialCount: number
  assignmentCount: number
  submittedCount: number
  average: number | null
}

interface SubjectSummaryViewModel {
  loading: boolean
  rows: SubjectSummaryRow[]
  classId: string
  className: string
  childIds: string[]
  selectedChildId: string
  setSelectedChildId: (value: string) => void
  studentNameOf: (id: string) => string
}

export function useSubjectSummaryViewModel(): SubjectSummaryViewModel {
  const { t } = useTranslation()
  const notify = useSnackbarStore((state) => state.notify)
  const scope = useRoleScope()
  const academic = useAcademicContext()
  const reference = useReferenceData()

  const [selectedChildId, setSelectedChildId] = useState(scope.studentId ?? '')
  const [materials, setMaterials] = useState<Material[]>([])
  const [assignments, setAssignments] = useState<AssignmentWithStats[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [loading, setLoading] = useState(true)

  const effectiveStudentId = scope.isParent ? selectedChildId : scope.studentId
  const classId = useMemo(
    () => classIdOfStudent(reference.students, effectiveStudentId),
    [effectiveStudentId, reference.students],
  )

  const load = useCallback(async () => {
    if (!classId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const context = {
        classId,
        academicYearId: academic.academicYearId,
        periodId: academic.periodId,
      }
      const [materialList, assignmentList, submissionList, sessionList] = await Promise.all([
        api.get<Material[]>(`/api/materials${buildQuery(context)}`),
        api.get<AssignmentWithStats[]>(`/api/assignments${buildQuery(context)}`),
        api.get<Submission[]>(`/api/submissions${buildQuery({ studentId: effectiveStudentId })}`),
        api.get<AttendanceSession[]>(`/api/attendance${buildQuery(context)}`),
      ])
      setMaterials(materialList)
      setAssignments(assignmentList)
      setSubmissions(submissionList)
      setSessions(sessionList)
    } catch {
      notify(t('errors.generic'), 'error')
    } finally {
      setLoading(false)
    }
  }, [academic.academicYearId, academic.periodId, classId, effectiveStudentId, notify, t])

  useEffect(() => {
    void load()
  }, [load])

  const rows = useMemo<SubjectSummaryRow[]>(() => {
    const subjectIds = new Set<string>()
    reference.subjectAssignments
      .filter((item) => item.classId === classId)
      .forEach((item) => subjectIds.add(item.subjectId))

    return Array.from(subjectIds).map((subjectId) => {
      const subject = reference.subjects.find((item) => item.id === subjectId)
      const assignment = reference.subjectAssignments.find(
        (item) => item.classId === classId && item.subjectId === subjectId,
      )
      const subjectSessions = sessions.filter((item) => item.subjectId === subjectId)
      const counters = { present: 0, sick: 0, permission: 0, absent: 0 }
      subjectSessions.forEach((session) => {
        const entry = session.entries.find((item) => item.studentId === effectiveStudentId)
        if (entry) counters[entry.status] += 1
      })
      const total = counters.present + counters.sick + counters.permission + counters.absent
      const subjectAssignments = assignments.filter((item) => item.subjectId === subjectId)
      const graded = subjectAssignments
        .map(
          (item) =>
            submissions.find(
              (submission) =>
                submission.assignmentId === item.id &&
                submission.studentId === effectiveStudentId &&
                submission.status === 'graded',
            )?.score ?? null,
        )
        .filter((value): value is number => value !== null)
      return {
        subjectId,
        subjectName: subject?.name ?? '-',
        subjectColor: subject?.color ?? '#3F51B5',
        teacherName: reference.teacherNameOf(assignment?.teacherId),
        present: counters.present,
        sick: counters.sick,
        permission: counters.permission,
        absent: counters.absent,
        totalSessions: total,
        presentRate: total === 0 ? 0 : Math.round((counters.present / total) * 100),
        materialCount: materials.filter((item) => item.subjectId === subjectId).length,
        assignmentCount: subjectAssignments.length,
        submittedCount: subjectAssignments.filter((item) =>
          submissions.some(
            (submission) =>
              submission.assignmentId === item.id &&
              submission.studentId === effectiveStudentId &&
              submission.status !== 'pending',
          ),
        ).length,
        average:
          graded.length === 0
            ? null
            : Math.round((graded.reduce((sum, value) => sum + value, 0) / graded.length) * 10) / 10,
      }
    })
  }, [
    assignments,
    classId,
    effectiveStudentId,
    materials,
    reference,
    sessions,
    submissions,
  ])

  return {
    loading: loading || reference.loading,
    rows,
    classId,
    className: reference.classNameOf(classId),
    childIds: scope.childIds,
    selectedChildId: effectiveStudentId ?? '',
    setSelectedChildId,
    studentNameOf: reference.studentNameOf,
  }
}
