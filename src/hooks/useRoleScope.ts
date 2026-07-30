import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/features/auth/models/types'

export interface RoleScope {
  role: UserRole
  userId: string
  name: string
  teacherId?: string
  /** For students: their own id. For parents: the currently selected child id. */
  studentId?: string
  childIds: string[]
  isAdmin: boolean
  isTeacher: boolean
  isStudent: boolean
  isParent: boolean
  /** Read-only roles cannot mutate academic records. */
  isReadOnly: boolean
}

export function useRoleScope(): RoleScope {
  const user = useAuthStore((state) => state.user)
  const role = user?.role ?? 'student'
  const childIds = user?.childIds ?? []

  return {
    role,
    userId: user?.id ?? '',
    name: user?.name ?? '',
    teacherId: user?.teacherId,
    studentId: role === 'student' ? user?.studentId : childIds[0],
    childIds,
    isAdmin: role === 'admin',
    isTeacher: role === 'teacher',
    isStudent: role === 'student',
    isParent: role === 'parent',
    isReadOnly: role === 'student' || role === 'parent',
  }
}
