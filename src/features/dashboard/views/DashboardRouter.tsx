import { useAuthStore } from '@/store/authStore'
import AdminDashboard from './AdminDashboard'
import TeacherDashboard from './TeacherDashboard'
import StudentDashboard from './StudentDashboard'
import ParentDashboard from './ParentDashboard'

export default function DashboardRouter() {
  const user = useAuthStore((state) => state.user)

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />
    case 'teacher':
      return <TeacherDashboard />
    case 'parent':
      return <ParentDashboard />
    default:
      return <StudentDashboard />
  }
}
