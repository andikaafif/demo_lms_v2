import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/features/auth/models/types'
import {
  hasPermission,
  permissionsFor,
  type EffectiveRole,
  type Permission,
} from '@/lib/permissions'

export interface RoleScope {
  role: UserRole
  effectiveRole: EffectiveRole
  userId: string
  name: string
  teacherId?: string
  /** For students: their own id. For parents: the currently selected child id. */
  studentId?: string
  childIds: string[]
  isAdmin: boolean
  isTeacher: boolean
  isHomeroomTeacher: boolean
  isStudent: boolean
  isParent: boolean
  /** Read-only roles cannot mutate academic records. */
  isReadOnly: boolean
  permissions: Permission[]
  can: (permission: Permission) => boolean
}

const NO_CHILDREN: string[] = []

export function useRoleScope(): RoleScope {
  const user = useAuthStore((state) => state.user)
  const role = user?.role ?? 'student'
  const childIds = user?.childIds ?? NO_CHILDREN
  const isHomeroomTeacher = role === 'teacher' && Boolean(user?.homeroomClassId)
  const effectiveRole: EffectiveRole = isHomeroomTeacher ? 'homeroomTeacher' : role

  return useMemo(() => {
    const permissions = permissionsFor(effectiveRole)
    return {
      role,
      effectiveRole,
      userId: user?.id ?? '',
      name: user?.name ?? '',
      teacherId: user?.teacherId,
      studentId: role === 'student' ? user?.studentId : childIds[0],
      childIds,
      isAdmin: role === 'admin',
      isTeacher: role === 'teacher',
      isHomeroomTeacher,
      isStudent: role === 'student',
      isParent: role === 'parent',
      isReadOnly: role === 'student' || role === 'parent',
      permissions,
      can: (permission: Permission) => hasPermission(effectiveRole, permission),
    }
  }, [childIds, effectiveRole, isHomeroomTeacher, role, user?.id, user?.name, user?.studentId, user?.teacherId])
}
