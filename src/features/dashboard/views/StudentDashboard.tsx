import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import StatCard from '@/components/common/StatCard'
import { useRoleScope } from '@/hooks/useRoleScope'
import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel'
import {
  DashboardHeader,
  LatestMaterials,
  RecentAnnouncements,
  UpcomingAssignments,
} from './DashboardShared'

export default function StudentDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const scope = useRoleScope()
  const vm = useDashboardViewModel()

  if (vm.loading) {
    return (
      <Box>
        <DashboardHeader name={scope.name} />
        <LoadingSkeleton variant="cards" count={4} />
      </Box>
    )
  }

  const graded = vm.submissions.filter((item) => item.status === 'graded').length
  const submitted = vm.submissions.filter(
    (item) => item.status === 'submitted' || item.status === 'late',
  ).length
  const pending = vm.submissions.filter((item) => item.status === 'pending').length

  return (
    <Box>
      <DashboardHeader name={scope.name} />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          mb: 2.5,
        }}
      >
        <StatCard
          label={t('dashboard.myAverage')}
          value={vm.myAverage ?? '-'}
          icon={<EmojiEventsRoundedIcon />}
          color="#3F51B5"
          onClick={() => navigate('/gradebook')}
        />
        <StatCard
          label={t('dashboard.myAttendance')}
          value={`${vm.attendanceSummary?.presentRate ?? 0}%`}
          icon={<FactCheckRoundedIcon />}
          color="#2E7D32"
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          label={t('dashboard.gradedTasks')}
          value={graded}
          icon={<TaskAltRoundedIcon />}
          color="#0F9B8E"
          onClick={() => navigate('/assignments')}
        />
        <StatCard
          label={t('dashboard.pendingTasks')}
          value={pending}
          icon={<PendingActionsRoundedIcon />}
          color="#FFA000"
          caption={`${submitted} ${t('dashboard.submittedTasks')}`}
          onClick={() => navigate('/assignments')}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          mb: 2.5,
        }}
      >
        <UpcomingAssignments
          assignments={vm.upcomingAssignments}
          subjectNameOf={vm.subjectNameOf}
          subjectColorOf={vm.subjectColorOf}
        />
        <LatestMaterials
          materials={vm.materials}
          subjectNameOf={vm.subjectNameOf}
          subjectColorOf={vm.subjectColorOf}
        />
      </Box>

      <RecentAnnouncements announcements={vm.announcements} />
    </Box>
  )
}
