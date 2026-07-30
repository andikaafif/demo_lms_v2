import type { ComponentType } from 'react'
import type { SvgIconProps } from '@mui/material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import ClassRoundedIcon from '@mui/icons-material/ClassRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded'
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import GradingRoundedIcon from '@mui/icons-material/GradingRounded'
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import type { UserRole } from '@/features/auth/models/types'
import type { GradientKey } from '@/theme'

export interface NavItem {
  key: string
  path: string
  labelKey: string
  icon: ComponentType<SvgIconProps>
  roles: UserRole[]
  section: 'main' | 'academic' | 'management'
  gradient: GradientKey
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    labelKey: 'nav.dashboard',
    icon: DashboardRoundedIcon,
    roles: ['admin', 'teacher', 'student', 'parent'],
    section: 'main',
    gradient: 'primary',
  },
  {
    key: 'announcements',
    path: '/announcements',
    labelKey: 'nav.announcements',
    icon: CampaignRoundedIcon,
    roles: ['admin', 'teacher', 'student', 'parent'],
    section: 'main',
    gradient: 'sunset',
  },
  {
    key: 'materials',
    path: '/materials',
    labelKey: 'nav.materials',
    icon: LibraryBooksRoundedIcon,
    roles: ['admin', 'teacher', 'student'],
    section: 'academic',
    gradient: 'teal',
  },
  {
    key: 'assignments',
    path: '/assignments',
    labelKey: 'nav.assignments',
    icon: AssignmentRoundedIcon,
    roles: ['admin', 'teacher', 'student', 'parent'],
    section: 'academic',
    gradient: 'violet',
  },
  {
    key: 'attendance',
    path: '/attendance',
    labelKey: 'nav.attendance',
    icon: FactCheckRoundedIcon,
    roles: ['admin', 'teacher', 'student', 'parent'],
    section: 'academic',
    gradient: 'forest',
  },
  {
    key: 'gradebook',
    path: '/gradebook',
    labelKey: 'nav.gradebook',
    icon: GradingRoundedIcon,
    roles: ['admin', 'teacher', 'student', 'parent'],
    section: 'academic',
    gradient: 'ocean',
  },
  {
    key: 'classes',
    path: '/classes',
    labelKey: 'nav.classes',
    icon: ClassRoundedIcon,
    roles: ['admin', 'teacher'],
    section: 'management',
    gradient: 'rose',
  },
  {
    key: 'subjects',
    path: '/subjects',
    labelKey: 'nav.subjects',
    icon: MenuBookRoundedIcon,
    roles: ['admin', 'teacher'],
    section: 'management',
    gradient: 'secondary',
  },
  {
    key: 'users',
    path: '/users',
    labelKey: 'nav.users',
    icon: GroupsRoundedIcon,
    roles: ['admin'],
    section: 'management',
    gradient: 'violet',
  },
  {
    key: 'school-profile',
    path: '/school-profile',
    labelKey: 'nav.schoolProfile',
    icon: SchoolRoundedIcon,
    roles: ['admin', 'teacher', 'student', 'parent'],
    section: 'management',
    gradient: 'primary',
  },
]

export const navItemsForRole = (role: UserRole): NavItem[] =>
  NAV_ITEMS.filter((item) => item.roles.includes(role))

/** Bottom navigation shows at most 4 direct tabs plus a "More" entry. */
export const BOTTOM_NAV_LIMIT = 4

export const findNavItem = (pathname: string): NavItem | undefined =>
  NAV_ITEMS.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))
