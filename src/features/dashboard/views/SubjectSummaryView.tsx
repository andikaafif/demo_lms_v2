import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import GradingRoundedIcon from '@mui/icons-material/GradingRounded'
import EmptyState from '@/components/common/EmptyState'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import { useSubjectSummaryViewModel } from '../viewmodels/useSubjectSummaryViewModel'

export default function SubjectSummaryView() {
  const { t } = useTranslation()
  const vm = useSubjectSummaryViewModel()

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t('dashboard.subjectSummary')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('dashboard.subjectSummaryHint')}
          </Typography>
        </Box>
        {vm.childIds.length > 1 ? (
          <TextField
            size="small"
            select
            label={t('dashboard.selectChild')}
            value={vm.selectedChildId}
            onChange={(event) => vm.setSelectedChildId(event.target.value)}
            sx={{ minWidth: 200 }}
          >
            {vm.childIds.map((childId) => (
              <MenuItem key={childId} value={childId}>
                {vm.studentNameOf(childId)}
              </MenuItem>
            ))}
          </TextField>
        ) : null}
      </Stack>

      {vm.loading ? (
        <LoadingSkeleton variant="cards" count={4} />
      ) : vm.rows.length === 0 ? (
        <EmptyState title={t('dashboard.subjectSummary')} description={t('common.noData')} />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          }}
        >
          {vm.rows.map((row) => (
            <Card key={row.subjectId}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: alpha(row.subjectColor, 0.14),
                      color: row.subjectColor,
                    }}
                  >
                    <MenuBookRoundedIcon />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                      {row.subjectName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {row.teacherName} · {vm.className}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={row.average ?? '-'}
                    sx={{
                      fontWeight: 800,
                      bgcolor: alpha(row.subjectColor, 0.14),
                      color: row.subjectColor,
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<FactCheckRoundedIcon />}
                    label={`${row.present}/${row.totalSessions}`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<MenuBookRoundedIcon />}
                    label={row.materialCount}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<AssignmentRoundedIcon />}
                    label={`${row.submittedCount}/${row.assignmentCount}`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<GradingRoundedIcon />}
                    label={row.average ?? '-'}
                  />
                </Stack>

                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {t('attendance.presentRate')}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>
                    {row.presentRate}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={row.presentRate}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
