import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import FamilyRestroomRoundedIcon from '@mui/icons-material/FamilyRestroomRounded'
import PageHeader from '@/components/common/PageHeader'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import { formatDate, getInitials } from '@/lib/format'
import { statusColors } from '@/theme'
import { useLocaleStore } from '@/store/localeStore'
import { useRoleScope } from '@/hooks/useRoleScope'
import { useStudentDetailViewModel } from '../viewmodels/useStudentDetailViewModel'

export default function StudentDetailPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const locale = useLocaleStore((state) => state.locale)
  const scope = useRoleScope()
  const { studentId } = useParams<{ studentId: string }>()
  const vm = useStudentDetailViewModel(studentId)

  if (vm.loading) return <LoadingSkeleton variant="detail" />

  if (vm.notFound || !vm.student) {
    return (
      <EmptyState
        title={t('errors.notFound')}
        actionLabel={t('common.back')}
        onAction={() => navigate(-1)}
      />
    )
  }

  const student = vm.student
  const gradeRow = vm.gradebook?.rows[0]
  const attendanceItems = [
    { key: 'present' as const, value: vm.attendance?.present ?? 0 },
    { key: 'sick' as const, value: vm.attendance?.sick ?? 0 },
    { key: 'permission' as const, value: vm.attendance?.permission ?? 0 },
    { key: 'absent' as const, value: vm.attendance?.absent ?? 0 },
  ]

  return (
    <Box>
      <PageHeader
        title={student.name}
        subtitle={`${t('users.nis')} ${student.nis} · ${vm.schoolClass?.name ?? '-'}`}
        gradient="violet"
        action={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate(-1)}
          >
            {t('common.back')}
          </Button>
        }
      />

      {vm.generatedCredentials ? (
        <Alert severity="success" sx={{ mb: 2.5 }} onClose={vm.dismissCredentials}>
          {t('users.parentAccountCredentials', {
            username: vm.generatedCredentials.username,
            password: vm.generatedCredentials.password,
          })}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', md: '340px 1fr' },
          alignItems: 'start',
        }}
      >
        <Stack spacing={2.5}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 92,
                  height: 92,
                  mx: 'auto',
                  mb: 1.5,
                  bgcolor: student.avatarColor,
                  fontSize: 30,
                  fontWeight: 800,
                }}
              >
                {getInitials(student.name)}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {student.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('users.nisn')}: {student.nisn}
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1.5 }}>
                <Chip size="small" color="primary" label={vm.schoolClass?.name ?? '-'} />
                <Chip
                  size="small"
                  variant="outlined"
                  label={student.gender === 'L' ? t('common.male') : t('common.female')}
                />
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1} sx={{ textAlign: 'left' }}>
                <DetailRow label={t('users.birthDate')} value={formatDate(student.birthDate, locale)} />
                <DetailRow label={t('common.address')} value={student.address || '-'} />
                <DetailRow
                  label={t('users.academicStatus')}
                  value={
                    student.academicStatus === 'active'
                      ? t('common.active')
                      : student.academicStatus === 'graduated'
                        ? t('users.graduated')
                        : t('users.transferred')
                  }
                />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <FamilyRestroomRoundedIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {t('users.parentInfo')}
                </Typography>
              </Stack>
              <Stack spacing={1}>
                <DetailRow label={t('users.fatherName')} value={student.parent.fatherName} />
                <DetailRow label={t('users.motherName')} value={student.parent.motherName} />
                {student.parent.guardianName ? (
                  <DetailRow label={t('users.guardianName')} value={student.parent.guardianName} />
                ) : null}
                <DetailRow label={t('users.parentPhone')} value={student.parent.phone} />
                <DetailRow label={t('users.parentEmail')} value={student.parent.email || '-'} />
                <DetailRow label={t('users.occupation')} value={student.parent.occupation || '-'} />
              </Stack>
              <Box sx={{ mt: 2 }}>
                {!scope.isAdmin ? null : student.parent.hasAccount ? (
                  <Chip
                    size="small"
                    color="success"
                    label={t('users.parentAccountExists')}
                    sx={{ fontWeight: 700 }}
                  />
                ) : (
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled={vm.generating}
                    onClick={() => void vm.generateParentAccount()}
                  >
                    {t('users.generateParentAccount')}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Stack>

        <Stack spacing={2.5}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                {t('attendance.summary')}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  mb: 2,
                }}
              >
                {attendanceItems.map((item) => (
                  <Box
                    key={item.key}
                    sx={{
                      textAlign: 'center',
                      p: 1.5,
                      borderRadius: 3,
                      bgcolor: alpha(statusColors[item.key], 0.12),
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: statusColors[item.key] }}
                    >
                      {item.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t(`attendance.${item.key}`)}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {t('attendance.presentRate')}: {vm.attendance?.presentRate ?? 0}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={vm.attendance?.presentRate ?? 0}
                sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {t('gradebook.title')}
                </Typography>
                <Chip
                  color="primary"
                  label={`${t('common.average')}: ${gradeRow?.average ?? '-'}`}
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
              {gradeRow && gradeRow.items.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('assignments.assignmentTitle')}</TableCell>
                      <TableCell align="right">{t('assignments.score')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {gradeRow.items.map((item) => (
                      <TableRow key={item.assignmentId}>
                        <TableCell>{item.assignmentTitle}</TableCell>
                        <TableCell align="right">
                          {item.score === null ? (
                            <Typography variant="caption" color="text.secondary">
                              {t('gradebook.notGraded')}
                            </Typography>
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                              {item.score} / {item.maxScore}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('gradebook.noGrades')}
                </Typography>
              )}
              {gradeRow?.teacherNote ? (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.secondary.main, 0.12),
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>
                    {t('gradebook.teacherNote')}
                  </Typography>
                  <Typography variant="body2">{gradeRow.teacherNote}</Typography>
                </Box>
              ) : null}
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  )
}
