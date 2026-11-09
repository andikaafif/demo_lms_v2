import { useMemo } from 'react'
import { useRoleScope } from '@/hooks/useRoleScope'
import { useAcademicContext } from '@/hooks/useAcademicContext'
import { useReferenceData } from '@/hooks/useReferenceData'
import { classIdOfStudent, classesForScope } from '@/lib/scope'
import type { ScheduleEntry } from '../models/types'

interface ScheduleViewModel {
  loading: boolean
  entries: ScheduleEntry[]
  days: { value: number; labelKey: string }[]
  classId: string
  setClassId: (value: string) => void
  availableClasses: ReturnType<typeof useReferenceData>['classes']
  isReadOnly: boolean
}

export const WEEK_DAYS = [
  { value: 1, labelKey: 'schedule.monday' },
  { value: 2, labelKey: 'schedule.tuesday' },
  { value: 3, labelKey: 'schedule.wednesday' },
  { value: 4, labelKey: 'schedule.thursday' },
  { value: 5, labelKey: 'schedule.friday' },
  { value: 6, labelKey: 'schedule.saturday' },
]

export function useScheduleViewModel(): ScheduleViewModel {
  const scope = useRoleScope()
  const academic = useAcademicContext()
  const reference = useReferenceData()

  const availableClasses = useMemo(
    () => classesForScope(reference.classes, reference.subjectAssignments, reference.students, scope),
    [reference.classes, reference.students, reference.subjectAssignments, scope],
  )

  const ownClassId = useMemo(
    () => classIdOfStudent(reference.students, scope.studentId),
    [reference.students, scope.studentId],
  )

  const entries = useMemo(() => {
    const scopedClassIds = new Set(availableClasses.map((item) => item.id))
    return reference.subjectAssignments
      .filter((item) => item.academicYearId === academic.academicYearId)
      .filter((item) => item.periodId === academic.periodId)
      .filter((item) => scopedClassIds.has(item.classId))
      .filter((item) => (scope.isTeacher ? item.teacherId === scope.teacherId : true))
      .filter((item) => (scope.isReadOnly ? item.classId === ownClassId : true))
      .map((item) => {
        const schoolClass = reference.classes.find((entry) => entry.id === item.classId)
        const subject = reference.subjects.find((entry) => entry.id === item.subjectId)
        return {
          id: item.id,
          classId: item.classId,
          className: schoolClass?.name ?? '-',
          subjectId: item.subjectId,
          subjectName: subject?.name ?? '-',
          subjectColor: subject?.color ?? '#3F51B5',
          teacherId: item.teacherId,
          teacherName: reference.teacherNameOf(item.teacherId),
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
          meeting: item.meeting,
          room: schoolClass?.room ?? '-',
        }
      })
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
  }, [
    academic.academicYearId,
    academic.periodId,
    availableClasses,
    ownClassId,
    reference,
    scope.isReadOnly,
    scope.isTeacher,
    scope.teacherId,
  ])

  return {
    loading: reference.loading,
    entries,
    days: WEEK_DAYS,
    classId: ownClassId,
    setClassId: () => undefined,
    availableClasses,
    isReadOnly: scope.isReadOnly,
  }
}
