import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import PageHeader from '@/components/common/PageHeader'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import StatusChip from '@/components/common/StatusChip'
import { formatDate, getInitials } from '@/lib/format'
import { statusColors } from '@/theme'
import { useLocaleStore } from '@/store/localeStore'
import { useRoleScope } from '@/hooks/useRoleScope'
import type { AttendanceStatus } from '../models/types'
import { useAttendanceViewModel } from '../viewmodels/useAttendanceViewModel'

const STATUSES: AttendanceStatus[] = ['present', 'sick', 'permission', 'absent']

export default function AttendancePage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)
  const scope = useRoleScope()
  const vm = useAttendanceViewModel()

  const summaryItems = [
    { key: 'present' as const, value: vm.summary?.present ?? 0 },
    { key: 'sick' as const, value: vm.summary?.sick ?? 0 },
    { key: 'permission' as const, value: vm.summary?.permission ?? 0 },
    { key: 'absent' as const, value: vm.summary?.absent ?? 0 },
  ]

  return (
    <Box>
      <PageHeader
        title={t('attendance.title')}
        subtitle={
          vm.canRecord
            ? t('attendance.subtitle')
            : scope.isParent
              ? t('attendance.childAttendance')
              : t('attendance.myAttendance')
        }
        gradient="forest"
        icon={<FactCheckRoundedIcon sx={{ fontSize: 30 }} />}
      />

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              size="small"
              select
              label={t('attendance.selectClass')}
              value={vm.classId}
              onChange={(event) => vm.setClassId(event.target.value)}
              fullWidth
              disabled={scope.isReadOnly}
            >
              {vm.availableClasses.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
            {vm.canRecord ? (
              <>
                <TextField
                  size="small"
                  select
                  label={t('attendance.selectSubject')}
                  value={vm.subjectId}
                  onChange={(event) => vm.setSubjectId(event.target.value)}
                  fullWidth
                >
                  {vm.availableSubjects.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  size="small"
                  type="date"
                  label={t('attendance.selectDate')}
                  value={vm.date}
                  onChange={(event) => vm.setDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
            {t('attendance.summary')}
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
                <Typography variant="h4" sx={{ fontWeight: 800, color: statusColors[item.key] }}>
                  {item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t(`attendance.${item.key}`)}
                </Typography>
              </Box>
            ))}
          </Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {t('attendance.presentRate')}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {vm.summary?.presentRate ?? 0}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={vm.summary?.presentRate ?? 0}
            sx={{ height: 9, borderRadius: 5 }}
          />
        </CardContent>
      </Card>

      {vm.loading ? (
        <LoadingSkeleton variant="table" count={6} />
      ) : vm.canRecord ? (
        vm.classStudents.length === 0 ? (
          <EmptyState title={t('attendance.notEnrolled')} />
        ) : (
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              {vm.existingSession ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {t('attendance.sessionExists')}
                </Alert>
              ) : null}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {t('attendance.recordAttendance')} — {formatDate(vm.date, locale)}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DoneAllRoundedIcon />}
                    onClick={vm.markAllPresent}
                  >
                    {t('attendance.markAllPresent')}
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    disabled={vm.saving}
                    onClick={() => void vm.save()}
                  >
                    {vm.saving ? t('common.saving') : t('attendance.saveAttendance')}
                  </Button>
                </Stack>
              </Stack>

              <Stack spacing={1.25}>
                {vm.classStudents.map((student) => {
                  const entry = vm.entries[student.id]
                  return (
                    <Stack
                      key={student.id}
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={1.5}
                      alignItems={{ md: 'center' }}
                      sx={{ p: 1.5, borderRadius: 3, bgcolor: 'action.hover' }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                        <Avatar sx={{ width: 36, height: 36, fontSize: 13, bgcolor: student.avatarColor }}>
                          {getInitials(student.name)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                            {student.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.nis}
                          </Typography>
                        </Box>
                      </Stack>

                      <ToggleButtonGroup
                        exclusive
                        size="small"
                        value={entry?.status ?? 'present'}
                        onChange={(_, value: AttendanceStatus | null) => {
                          if (value) vm.setStatus(student.id, value)
                        }}
                      >
                        {STATUSES.map((status) => (
                          <ToggleButton
                            key={status}
                            value={status}
                            sx={{
                              px: 1.5,
                              fontWeight: 700,
                              '&.Mui-selected': {
                                bgcolor: alpha(statusColors[status], 0.18),
                                color: statusColors[status],
                                '&:hover': { bgcolor: alpha(statusColors[status], 0.26) },
                              },
                            }}
                          >
                            {t(`attendance.${status}`)}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>

                      <TextField
                        size="small"
                        placeholder={t('attendance.noteHint')}
                        value={entry?.note ?? ''}
                        onChange={(event) => vm.setNote(student.id, event.target.value)}
                        sx={{ minWidth: { md: 200 } }}
                      />
                    </Stack>
                  )
                })}
              </Stack>
            </CardContent>
          </Card>
        )
      ) : vm.sessions.length === 0 ? (
        <EmptyState title={t('attendance.noSessions')} />
      ) : (
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
              {t('attendance.history')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('attendance.recap', { count: vm.sessions.length })}
            </Typography>
            <Table size="small" sx={{ mt: 1.5 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.date')}</TableCell>
                  <TableCell>{t('common.subject')}</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {t('common.note')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vm.sessions.map((session) => {
                  const entry = session.entries.find((item) => item.studentId === scope.studentId)
                  if (!entry) return null
                  return (
                    <TableRow key={session.id} hover>
                      <TableCell>{formatDate(session.date, locale)}</TableCell>
                      <TableCell>
                        <Chip size="small" variant="outlined" label={vm.subjectNameOf(session.subjectId)} />
                      </TableCell>
                      <TableCell>
                        <StatusChip status={entry.status} />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {entry.note || '-'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
