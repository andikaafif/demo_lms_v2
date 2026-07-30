import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import ClassRoundedIcon from '@mui/icons-material/ClassRounded'
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded'
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
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

export default function TeacherDashboard() {
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
          label={t('dashboard.myClasses')}
          value={vm.scopedClasses.length}
          icon={<ClassRoundedIcon />}
          color="#3F51B5"
          onClick={() => navigate('/classes')}
        />
        <StatCard
          label={t('dashboard.myMaterials')}
          value={vm.materials.length}
          icon={<LibraryBooksRoundedIcon />}
          color="#0F9B8E"
          onClick={() => navigate('/materials')}
        />
        <StatCard
          label={t('dashboard.pendingGrading')}
          value={vm.pendingGradingCount}
          icon={<PendingActionsRoundedIcon />}
          color="#FFA000"
          onClick={() => navigate('/assignments')}
        />
        <StatCard
          label={t('dashboard.attendanceRate')}
          value={`${vm.attendanceSummary?.presentRate ?? 0}%`}
          icon={<FactCheckRoundedIcon />}
          color="#2E7D32"
          onClick={() => navigate('/attendance')}
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

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        }}
      >
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              {t('dashboard.myClasses')}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {vm.scopedClasses.map((item) => (
                <Chip
                  key={item.id}
                  label={`${item.name} · ${item.studentIds.length} ${t('common.students')}`}
                  onClick={() => navigate(`/classes/${item.id}`)}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
        <RecentAnnouncements announcements={vm.announcements} />
      </Box>
    </Box>
  )
}
