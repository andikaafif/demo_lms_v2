import {
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import EmptyState from '@/components/common/EmptyState'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import { useGradebookViewModel } from '../viewmodels/useGradebookViewModel'

export default function GradeRecapView({ classId }: { classId: string }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const vm = useGradebookViewModel({ classId })

  if (vm.loading) return <LoadingSkeleton variant="table" count={8} />
  if (!vm.recap || vm.recap.rows.length === 0 || vm.recap.subjects.length === 0) {
    return <EmptyState title={t('gradebook.noRecap')} description={t('gradebook.noRecapHint')} />
  }

  return (
    <Card>
      <CardContent sx={{ p: 2.5, pb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          {t('gradebook.recapTitle')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('gradebook.recapHint')}
        </Typography>
      </CardContent>
      <TableContainer sx={{ maxHeight: 620 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ minWidth: 180, position: 'sticky', left: 0, zIndex: 3, bgcolor: 'background.paper' }}
              >
                {t('gradebook.studentName')}
              </TableCell>
              {vm.recap.subjects.map((subject) => (
                <TableCell key={subject.id} align="center" sx={{ minWidth: 110 }}>
                  <Chip
                    size="small"
                    label={subject.name}
                    sx={{ bgcolor: alpha(subject.color, 0.14), color: subject.color, fontWeight: 700 }}
                  />
                </TableCell>
              ))}
              <TableCell align="center">{t('common.average')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vm.recap.rows.map((row) => (
              <TableRow key={row.studentId} hover>
                <TableCell sx={{ position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {row.studentName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.nis}
                  </Typography>
                </TableCell>
                {vm.recap?.subjects.map((subject) => (
                  <TableCell key={subject.id} align="center">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {row.scores[subject.id] ?? '-'}
                    </Typography>
                  </TableCell>
                ))}
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={row.average ?? '-'}
                    sx={{
                      fontWeight: 800,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: 'primary.main',
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {t('gradebook.classAverage')}: {vm.recap.classAverage ?? '-'}
        </Typography>
      </Box>
    </Card>
  )
}
