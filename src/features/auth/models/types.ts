export type UserRole = 'admin' | 'teacher' | 'student' | 'parent'

export interface AuthUser {
  id: string
  username: string
  role: UserRole
  name: string
  email: string
  avatarColor: string
  /** Populated when role === 'student' */
  studentId?: string
  /** Populated when role === 'teacher' */
  teacherId?: string
  /** Populated when role === 'parent' — students this parent may access */
  childIds?: string[]
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface ApiErrorPayload {
  message: string
  code?: string
}
