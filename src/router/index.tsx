import { Navigate, createBrowserRouter } from 'react-router-dom'
import MainLayout from '@/components/Layout/MainLayout'
import PrivateRoute from './PrivateRoute'
import RoleRoute from './RoleRoute'
import LoginPage from '@/features/auth/views/LoginPage'
import DashboardRouter from '@/features/dashboard/views/DashboardRouter'
import AnnouncementsPage from '@/features/announcements/views/AnnouncementsPage'
import MaterialsPage from '@/features/materials/views/MaterialsPage'
import AssignmentsPage from '@/features/assignments/views/AssignmentsPage'
import AttendancePage from '@/features/attendance/views/AttendancePage'
import GradebookPage from '@/features/gradebook/views/GradebookPage'
import ClassesPage from '@/features/classes/views/ClassesPage'
import ClassDetailPage from '@/features/classes/views/ClassDetailPage'
import SubjectsPage from '@/features/subjects/views/SubjectsPage'
import UsersPage from '@/features/users/views/UsersPage'
import StudentDetailPage from '@/features/users/views/StudentDetailPage'
import SchoolProfilePage from '@/features/school-profile/views/SchoolProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardRouter /> },
          { path: '/announcements', element: <AnnouncementsPage /> },
          {
            element: <RoleRoute allowed={['admin', 'teacher', 'student']} />,
            children: [{ path: '/materials', element: <MaterialsPage /> }],
          },
          { path: '/assignments', element: <AssignmentsPage /> },
          { path: '/attendance', element: <AttendancePage /> },
          { path: '/gradebook', element: <GradebookPage /> },
          {
            element: <RoleRoute allowed={['admin', 'teacher']} />,
            children: [
              { path: '/classes', element: <ClassesPage /> },
              { path: '/classes/:classId', element: <ClassDetailPage /> },
              { path: '/subjects', element: <SubjectsPage /> },
              { path: '/users/students/:studentId', element: <StudentDetailPage /> },
            ],
          },
          {
            element: <RoleRoute allowed={['admin']} />,
            children: [{ path: '/users', element: <UsersPage /> }],
          },
          { path: '/school-profile', element: <SchoolProfilePage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
