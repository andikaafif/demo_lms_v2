import { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded'
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import PageHeader from '@/components/common/PageHeader'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { formatDate, getInitials } from '@/lib/format'
import { api, buildQuery } from '@/lib/api'
import { useAcademicContext } from '@/hooks/useAcademicContext'
import { useLocaleStore } from '@/store/localeStore'
import type { Material } from '@/features/materials/models/types'
import type { AttendanceSession } from '@/features/attendance/models/types'
import { useRoleScope } from '@/hooks/useRoleScope'
import { academicPeriodName, academicYearName } from '@/features/academic/models/catalog'
import { useClassesViewModel } from '../viewmodels/useClassesViewModel'

export default function ClassDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const scope = useRoleScope()
  const { classId } = useParams<{ classId: string }>()
  const vm = useClassesViewModel()
  const academic = useAcademicContext()
  const locale = useLocaleStore((state) => state.locale)
  const [materials, setMaterials] = useState<Material[]>([])
  const [sessions, setSessions] = useState<AttendanceSession[]>([])

  const [enrollOpen, setEnrollOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [confirm, setConfirm] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: '',
    name: '',
  })

  const schoolClass = useMemo(
    () => vm.classes.find((item) => item.id === classId) ?? null,
    [classId, vm.classes],
  )

  const members = useMemo(
    () => vm.students.filter((item) => schoolClass?.studentIds.includes(item.id)),
    [schoolClass, vm.students],
  )

  const candidates = useMemo(
    () => vm.students.filter((item) => !schoolClass?.studentIds.includes(item.id)),
    [schoolClass, vm.students],
  )

  const schedule = useMemo(
    () => vm.subjectAssignments.filter((item) => item.classId === classId),
    [classId, vm.subjectAssignments],
  )

  useEffect(() => {
    if (!classId) return
    const query = buildQuery({
      classId,
      academicYearId: academic.academicYearId,
      periodId: academic.periodId,
    })
    void Promise.all([
      api.get<Material[]>(`/api/materials${query}`).catch(() => []),
      api.get<AttendanceSession[]>(`/api/attendance${query}`).catch(() => []),
    ]).then(([materialList, sessionList]) => {
      setMaterials(materialList)
      setSessions(sessionList)
    })
  }, [academic.academicYearId, academic.periodId, classId])

  if (vm.loading) return <LoadingSkeleton variant="detail" />

  if (!schoolClass) {
    return (
      <EmptyState
        title={t('errors.notFound')}
        actionLabel={t('common.back')}
        onAction={() => navigate('/classes')}
      />
    )
  }

  return (
    <Box>
      <PageHeader
        title={schoolClass.name}
        subtitle={`${academicYearName(schoolClass.academicYearId)} · ${academicPeriodName(schoolClass.periodId)} · ${schoolClass.room} · ${vm.teacherNameOf(
          schoolClass.homeroomTeacherId,
        )}`}
        gradient="rose"
        action={
          <Stack direction="row" spacing={1}>
            {scope.isAdmin ? (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PersonAddRoundedIcon />}
                onClick={() => {
                  setSelected([])
                  setEnrollOpen(true)
                }}
              >
                {t('classes.enrollStudents')}
              </Button>
            ) : null}
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate('/classes')}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}
            >
              {t('common.back')}
            </Button>
          </Stack>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' },
          alignItems: 'start',
        }}
      >
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {t('classes.enrolledStudents')}
              </Typography>
              <Chip size="small" color="primary" label={members.length} />
            </Stack>
            {members.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('classes.noStudentsInClass')}
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.name')}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {t('users.nis')}
                    </TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{ width: 32, height: 32, fontSize: 13, bgcolor: student.avatarColor }}
                          >
                            {getInitials(student.name)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {student.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {student.nis}
                      </TableCell>
                      <TableCell align="right">
                        {scope.isAdmin ? (
                          <>
                            <Tooltip title={t('common.viewDetail')}>
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/users/students/${student.id}`)}
                              >
                                <VisibilityRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('classes.removeStudent')}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  setConfirm({ open: true, id: student.id, name: student.name })
                                }
                              >
                                <PersonRemoveRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              {t('classes.subjectSchedule')}
            </Typography>
            {schedule.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('subjects.noAssignments')}
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {schedule.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ p: 1.25, borderRadius: 2, bgcolor: 'action.hover' }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 40,
                        borderRadius: 4,
                        bgcolor: vm.subjects.find((s) => s.id === item.subjectId)?.color ?? 'primary.main',
                      }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                        {vm.subjects.find((s) => s.id === item.subjectId)?.name ?? '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.schedule} · {vm.teacherNameOf(item.teacherId)}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          alignItems: 'start',
          mt: 2.5,
        }}
      >
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              {t('classes.materialsPerMeeting')}
            </Typography>
            {materials.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('materials.noMaterials')}
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {[...materials]
                  .sort((a, b) => a.meeting - b.meeting)
                  .map((material) => (
                    <Stack
                      key={material.id}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ p: 1.25, borderRadius: 2, bgcolor: 'action.hover' }}
                    >
                      <Chip
                        size="small"
                        label={t('materials.meetingLabel', { meeting: material.meeting })}
                        sx={{ fontWeight: 700 }}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                          {material.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {vm.subjects.find((s) => s.id === material.subjectId)?.name ?? '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              {t('classes.attendancePerSession')}
            </Typography>
            {sessions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('attendance.noSessions')}
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.date')}</TableCell>
                    <TableCell>{t('common.subject')}</TableCell>
                    <TableCell align="center">{t('attendance.meeting')}</TableCell>
                    <TableCell align="center">{t('attendance.present')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.slice(0, 8).map((session) => (
                    <TableRow key={session.id} hover>
                      <TableCell>{formatDate(session.date, locale)}</TableCell>
                      <TableCell>
                        {vm.subjects.find((s) => s.id === session.subjectId)?.name ?? '-'}
                      </TableCell>
                      <TableCell align="center">{session.meeting}</TableCell>
                      <TableCell align="center">
                        {session.entries.filter((entry) => entry.status === 'present').length}/
                        {session.entries.length}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Box>

      <Dialog open={enrollOpen} onClose={() => setEnrollOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>{t('classes.enrollStudents')}</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {candidates.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
              {t('common.noData')}
            </Typography>
          ) : (
            <List dense sx={{ maxHeight: 360, overflow: 'auto' }}>
              {candidates.map((student) => (
                <ListItemButton
                  key={student.id}
                  onClick={() =>
                    setSelected((prev) =>
                      prev.includes(student.id)
                        ? prev.filter((id) => id !== student.id)
                        : [...prev, student.id],
                    )
                  }
                >
                  <Checkbox edge="start" checked={selected.includes(student.id)} tabIndex={-1} />
                  <ListItemText
                    primary={student.name}
                    secondary={`${t('users.nis')} ${student.nis} · ${vm.classes.find((c) => c.id === student.classId)?.name ?? '-'}`}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setEnrollOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={vm.saving || selected.length === 0}
            onClick={async () => {
              const ok = await vm.enrollStudents(schoolClass.id, selected)
              if (ok) setEnrollOpen(false)
            }}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirm.open}
        title={t('common.confirm')}
        message={t('classes.removeStudentConfirm', { name: confirm.name })}
        confirmLabel={t('common.delete')}
        loading={vm.saving}
        onConfirm={async () => {
          await vm.removeStudent(schoolClass.id, confirm.id)
          setConfirm({ open: false, id: '', name: '' })
        }}
        onCancel={() => setConfirm({ open: false, id: '', name: '' })}
      />
    </Box>
  )
}


