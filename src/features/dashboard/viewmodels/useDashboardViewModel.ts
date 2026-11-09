import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, buildQuery } from '@/lib/api'
import { useRoleScope } from '@/hooks/useRoleScope'
import { useAcademicContext } from '@/hooks/useAcademicContext'
import { useReferenceData } from '@/hooks/useReferenceData'
import { classIdOfStudent, classesForScope, defaultClassId } from '@/lib/scope'
import type { AssignmentWithStats, Submission } from '@/features/assignments/models/types'
import type { AttendanceSummary } from '@/features/attendance/models/types'
import type { Announcement } from '@/features/announcements/models/types'
import type { Material } from '@/features/materials/models/types'
import type { Gradebook } from '@/features/gradebook/models/types'
import type { SchoolProfile } from '@/features/school-profile/models/types'
import type { SchoolClass } from '@/features/classes/models/types'

interface DashboardViewModel {
  loading: boolean
  school: SchoolProfile | null
  scopedClasses: SchoolClass[]
  assignments: AssignmentWithStats[]
  submissions: Submission[]
  materials: Material[]
  announcements: Announcement[]
  attendanceSummary: AttendanceSummary | null
  gradebook: Gradebook | null
  counts: { students: number; teachers: number; classes: number; subjects: number }
  myAverage: number | null
  pendingGradingCount: number
  upcomingAssignments: AssignmentWithStats[]
  subjectNameOf: (id: string | null | undefined) => string
  subjectColorOf: (id: string | null | undefined) => string
  classNameOf: (id: string | null | undefined) => string
  studentNameOf: (id: string | null | undefined) => string
}

export function useDashboardViewModel(): DashboardViewModel {
  const scope = useRoleScope()
  const academic = useAcademicContext()
  const reference = useReferenceData()

  const [school, setSchool] = useState<SchoolProfile | null>(null)
  const [assignments, setAssignments] = useState<AssignmentWithStats[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null)
  const [gradebook, setGradebook] = useState<Gradebook | null>(null)
  const [loading, setLoading] = useState(true)

  const scopedClasses = useMemo(
    () => classesForScope(reference.classes, reference.subjectAssignments, reference.students, scope),
    [reference.classes, reference.students, reference.subjectAssignments, scope],
  )

  const ownClassId = useMemo(
    () => classIdOfStudent(reference.students, scope.studentId),
    [reference.students, scope.studentId],
  )

  const focusClassId = scope.isReadOnly ? ownClassId : defaultClassId(scopedClasses)

  const load = useCallback(async () => {
    if (reference.loading) return
    setLoading(true)
    try {
      const [schoolData, assignmentList, materialList, announcementList] = await Promise.all([
        api.get<SchoolProfile>('/api/school'),
        api.get<AssignmentWithStats[]>(
          `/api/assignments${buildQuery({
            classId: scope.isReadOnly ? focusClassId : undefined,
            academicYearId: academic.academicYearId,
            periodId: academic.periodId,
          })}`,
        ),
        api.get<Material[]>(
          `/api/materials${buildQuery({
            classId: scope.isReadOnly ? focusClassId : undefined,
            academicYearId: academic.academicYearId,
            periodId: academic.periodId,
          })}`,
        ),
        api.get<Announcement[]>(`/api/announcements${buildQuery({ role: scope.role })}`),
      ])
      setSchool(schoolData)
      setAssignments(assignmentList)
      setMaterials(materialList)
      setAnnouncements(announcementList)

      setSubmissions(
        await api.get<Submission[]>(
          `/api/submissions${buildQuery({ studentId: scope.isReadOnly ? scope.studentId : undefined })}`,
        ),
      )

      if (scope.isAdmin) {
        setAttendanceSummary(
          await api.get<AttendanceSummary>(
            `/api/attendance/summary${buildQuery({
              academicYearId: academic.academicYearId,
              periodId: academic.periodId,
            })}`,
          ),
        )
      } else if (focusClassId) {
        setAttendanceSummary(
          await api.get<AttendanceSummary>(
            `/api/attendance/summary${buildQuery({
              classId: focusClassId,
              studentId: scope.isReadOnly ? scope.studentId : undefined,
              academicYearId: academic.academicYearId,
              periodId: academic.periodId,
            })}`,
          ),
        )
        setGradebook(
          await api.get<Gradebook>(
            `/api/grades${buildQuery({
              classId: focusClassId,
              studentId: scope.isReadOnly ? scope.studentId : undefined,
              academicYearId: academic.academicYearId,
              periodId: academic.periodId,
            })}`,
          ),
        )
      }
    } catch {
      setSchool(null)
    } finally {
      setLoading(false)
    }
  }, [
    academic.academicYearId,
    academic.periodId,
    focusClassId,
    reference.loading,
    scope.isAdmin,
    scope.isReadOnly,
    scope.role,
    scope.studentId,
  ])

  useEffect(() => {
    void load()
  }, [load])

  const upcomingAssignments = useMemo(
    () =>
      assignments
        .filter((item) => new Date(item.dueDate).getTime() >= Date.now() - 86_400_000)
        .slice(0, 5),
    [assignments],
  )

  const pendingGradingCount = useMemo(() => {
    if (scope.isReadOnly) {
      return submissions.filter((item) => item.status === 'pending').length
    }
    return assignments.reduce(
      (total, item) => total + Math.max(item.submittedCount - item.gradedCount, 0),
      0,
    )
  }, [assignments, scope.isReadOnly, submissions])

  const myAverage = useMemo(() => {
    const row = gradebook?.rows.find((item) => item.studentId === scope.studentId)
    return row?.average ?? gradebook?.classAverage ?? null
  }, [gradebook, scope.studentId])

  return {
    loading: loading || reference.loading,
    school,
    scopedClasses,
    assignments,
    submissions,
    materials,
    announcements,
    attendanceSummary,
    gradebook,
    counts: {
      students: reference.students.length,
      teachers: reference.teachers.length,
      classes: reference.classes.length,
      subjects: reference.subjects.length,
    },
    myAverage,
    pendingGradingCount,
    upcomingAssignments,
    subjectNameOf: reference.subjectNameOf,
    subjectColorOf: reference.subjectColorOf,
    classNameOf: reference.classNameOf,
    studentNameOf: reference.studentNameOf,
  }
}
