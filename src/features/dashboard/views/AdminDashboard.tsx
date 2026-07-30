import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded'
import ClassRoundedIcon from '@mui/icons-material/ClassRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import StatCard from '@/components/common/StatCard'
import { useRoleScope } from '@/hooks/useRoleScope'
import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel'
import { DashboardHeader, RecentAnnouncements, UpcomingAssignments } from './DashboardShared'

export default function AdminDashboard() {
  const { t } = useTranslation()
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
          label={t('dashboard.totalStudents')}
          value={vm.counts.students}
          icon={<GroupsRoundedIcon />}
          color="#3F51B5"
        />
        <StatCard
          label={t('dashboard.totalTeachers')}
          value={vm.counts.teachers}
          icon={<SchoolRoundedIcon />}
          color="#0F9B8E"
        />
        <StatCard
          label={t('dashboard.totalClasses')}
          value={vm.counts.classes}
          icon={<ClassRoundedIcon />}
          color="#E91E63"
        />
        <StatCard
          label={t('dashboard.totalSubjects')}
          value={vm.counts.subjects}
          icon={<MenuBookRoundedIcon />}
          color="#FFA000"
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          mb: 2.5,
        }}
      >
        <StatCard
          label={t('dashboard.attendanceRate')}
          value={`${vm.attendanceSummary?.presentRate ?? 0}%`}
          icon={<FactCheckRoundedIcon />}
          color="#2E7D32"
          caption={t('attendance.summary')}
        />
        <StatCard
          label={t('dashboard.activeAssignments')}
          value={vm.assignments.length}
          icon={<AssignmentRoundedIcon />}
          color="#7C4DFF"
          caption={`${vm.pendingGradingCount} ${t('dashboard.pendingGrading')}`}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          alignItems: 'stretch',
          mb: 2.5,
        }}
      >
        <UpcomingAssignments
          assignments={vm.upcomingAssignments}
          subjectNameOf={vm.subjectNameOf}
          subjectColorOf={vm.subjectColorOf}
        />
        <RecentAnnouncements announcements={vm.announcements} />
      </Box>

      {vm.school ? (
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              {t('dashboard.schoolSnapshot')}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={vm.school.name} color="primary" sx={{ fontWeight: 700 }} />
              <Chip variant="outlined" label={`${t('dashboard.npsn')}: ${vm.school.npsn}`} />
              <Chip
                variant="outlined"
                label={`${t('dashboard.principal')}: ${vm.school.principalName}`}
              />
              <Chip
                variant="outlined"
                label={`${t('dashboard.accreditation')}: ${vm.school.accreditation}`}
              />
            </Stack>
          </CardContent>
        </Card>
      ) : null}
    </Box>
  )
}
