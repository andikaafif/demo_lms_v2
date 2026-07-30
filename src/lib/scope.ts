import type { SchoolClass } from '@/features/classes/models/types'
import type { SubjectAssignment } from '@/features/subjects/models/types'
import type { Student } from '@/features/users/models/types'
import type { RoleScope } from '@/hooks/useRoleScope'

/** Classes the current user is allowed to see, following the demo business rules. */
export function classesForScope(
  classes: SchoolClass[],
  subjectAssignments: SubjectAssignment[],
  students: Student[],
  scope: RoleScope,
): SchoolClass[] {
  if (scope.isAdmin) return classes

  if (scope.isTeacher) {
    const taught = new Set(
      subjectAssignments
        .filter((item) => item.teacherId === scope.teacherId)
        .map((item) => item.classId),
    )
    return classes.filter(
      (item) => item.homeroomTeacherId === scope.teacherId || taught.has(item.id),
    )
  }

  const ownClassId = students.find((item) => item.id === scope.studentId)?.classId
  return classes.filter((item) => item.id === ownClassId)
}

/** Subjects the current teacher teaches inside a given class. */
export function subjectIdsForTeacherInClass(
  subjectAssignments: SubjectAssignment[],
  teacherId: string | undefined,
  classId: string,
): string[] {
  return subjectAssignments
    .filter((item) => item.classId === classId && (!teacherId || item.teacherId === teacherId))
    .map((item) => item.subjectId)
}

export function classIdOfStudent(students: Student[], studentId: string | undefined): string {
  if (!studentId) return ''
  return students.find((item) => item.id === studentId)?.classId ?? ''
}

/** Preferred class to preselect in filters: the most populated one, so demo data is visible. */
export function defaultClassId(classes: SchoolClass[]): string {
  if (classes.length === 0) return ''
  return classes.reduce((best, item) =>
    item.studentIds.length > best.studentIds.length ? item : best,
  ).id
}
