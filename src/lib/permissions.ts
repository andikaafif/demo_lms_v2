import type { UserRole } from '@/features/auth/models/types'

export type Resource =
  | 'material'
  | 'assignment'
  | 'attendance'
  | 'class'
  | 'subject'
  | 'grade'
  | 'schedule'
  | 'account'
  | 'schoolProfile'
  | 'announcement'

export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'override'
  | 'export'
  | 'resetPassword'

export type Permission = `${Resource}:${Action}`

/** Effective role used for permission resolution. */
export type EffectiveRole = UserRole | 'homeroomTeacher'

const READ_ONLY: Permission[] = [
  'material:read',
  'assignment:read',
  'attendance:read',
  'class:read',
  'subject:read',
  'grade:read',
  'schedule:read',
  'announcement:read',
  'schoolProfile:read',
]

const TEACHER: Permission[] = [
  ...READ_ONLY,
  'material:create',
  'material:update',
  'material:delete',
  'assignment:create',
  'assignment:update',
  'assignment:delete',
  'attendance:create',
  'attendance:update',
  'grade:update',
]

const HOMEROOM_TEACHER: Permission[] = [...TEACHER, 'grade:update', 'attendance:export']

const ADMIN: Permission[] = [
  ...READ_ONLY,
  'material:create',
  'material:update',
  'material:delete',
  'assignment:read',
  'attendance:create',
  'attendance:update',
  'attendance:override',
  'attendance:export',
  'class:create',
  'class:update',
  'class:delete',
  'subject:create',
  'subject:update',
  'subject:delete',
  'grade:update',
  'schedule:create',
  'schedule:update',
  'schedule:delete',
  'account:read',
  'account:resetPassword',
  'schoolProfile:update',
  'announcement:create',
  'announcement:update',
  'announcement:delete',
]

const STUDENT: Permission[] = [
  'material:read',
  'assignment:read',
  'attendance:read',
  'class:read',
  'subject:read',
  'grade:read',
  'schedule:read',
  'announcement:read',
]

const PARENT: Permission[] = [
  'material:read',
  'assignment:read',
  'attendance:read',
  'class:read',
  'subject:read',
  'grade:read',
  'schedule:read',
  'announcement:read',
]

const PERMISSIONS: Record<EffectiveRole, Permission[]> = {
  admin: ADMIN,
  teacher: TEACHER,
  homeroomTeacher: HOMEROOM_TEACHER,
  student: STUDENT,
  parent: PARENT,
}

export function permissionsFor(role: EffectiveRole): Permission[] {
  return PERMISSIONS[role] ?? []
}

export function hasPermission(role: EffectiveRole, permission: Permission): boolean {
  return permissionsFor(role).includes(permission)
}
