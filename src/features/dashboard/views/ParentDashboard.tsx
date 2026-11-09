import { Avatar, Box, Card, CardContent, LinearProgress, Stack, Typography, alpha } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import StatCard from '@/components/common/StatCard'
import { getInitials } from '@/lib/format'
import { statusColors } from '@/theme'
import { useRoleScope } from '@/hooks/useRoleScope'
import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel'
import SubjectSummaryView from './SubjectSummaryView'
import { DashboardHeader, RecentAnnouncements, UpcomingAssignments } from './DashboardShared'

export default function ParentDashboard() {
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

  const childName = vm.studentNameOf(scope.studentId)
  const graded = vm.submissions.filter((item) => item.status === 'graded').length
  const pending = vm.submissions.filter((item) => item.status === 'pending').length
  const summaryItems = [
    { key: 'present' as const, value: vm.attendanceSummary?.present ?? 0 },
    { key: 'sick' as const, value: vm.attendanceSummary?.sick ?? 0 },
    { key: 'permission' as const, value: vm.attendanceSummary?.permission ?? 0 },
    { key: 'absent' as const, value: vm.attendanceSummary?.absent ?? 0 },
  ]

  return (
    <Box>
      <DashboardHeader name={scope.name} />

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 800 }}>
              {getInitials(childName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {t('dashboard.childProgress')}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {childName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {vm.classNameOf(vm.gradebook?.classId)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          mb: 2.5,
        }}
      >
        <StatCard
          label={t('dashboard.childGrades')}
          value={vm.myAverage ?? '-'}
          icon={<EmojiEventsRoundedIcon />}
          color="#3F51B5"
          onClick={() => navigate('/gradebook')}
        />
        <StatCard
          label={t('dashboard.childAttendance')}
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
          onClick={() => navigate('/assignments')}
        />
      </Box>

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
            {t('dashboard.childAttendance')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              mb: 2,
            }}
          >
            {summaryItems.map((item) => (
              <Box
                key={item.key}
                sx={{
                  textAlign: 'center',
                  p: 1.75,
                  borderRadius: 3,
                  bgcolor: alpha(statusColors[item.key], 0.12),
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, color: statusColors[item.key] }}>
                  {item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t(`attendance.${item.key}`)}
                </Typography>
              </Box>
            ))}
          </Box>
          <LinearProgress
            variant="determinate"
            value={vm.attendanceSummary?.presentRate ?? 0}
            sx={{ height: 9, borderRadius: 5 }}
          />
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        }}
      >
        <UpcomingAssignments
          assignments={vm.upcomingAssignments}
          subjectNameOf={vm.subjectNameOf}
          subjectColorOf={vm.subjectColorOf}
        />
        <Box sx={{ mb: 2.5 }}>
        <SubjectSummaryView />
      </Box>

      <RecentAnnouncements announcements={vm.announcements} />
      </Box>
    </Box>
  )
}
