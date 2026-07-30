import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import PageHeader from '@/components/common/PageHeader'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useRoleScope } from '@/hooks/useRoleScope'
import type { Subject, SubjectAssignment } from '../models/types'
import {
  subjectAssignmentSchema,
  subjectSchema,
  useSubjectsViewModel,
  type SubjectAssignmentFormValues,
  type SubjectFormValues,
} from '../viewmodels/useSubjectsViewModel'

const emptySubject: SubjectFormValues = {
  name: '',
  code: '',
  color: '#3F51B5',
  description: '',
  weeklyHours: 4,
}

const emptyAssignment: SubjectAssignmentFormValues = {
  subjectId: '',
  classId: '',
  teacherId: '',
  schedule: '',
}

export default function SubjectsPage() {
  const { t } = useTranslation()
  const scope = useRoleScope()
  const vm = useSubjectsViewModel()

  const [tab, setTab] = useState(0)
  const [subjectDialog, setSubjectDialog] = useState<{ open: boolean; item: Subject | null }>({
    open: false,
    item: null,
  })
  const [assignmentDialog, setAssignmentDialog] = useState<{
    open: boolean
    item: SubjectAssignment | null
  }>({ open: false, item: null })
  const [confirm, setConfirm] = useState<{
    open: boolean
    kind: 'subject' | 'assignment'
    id: string
    name: string
  }>({ open: false, kind: 'subject', id: '', name: '' })

  const subjectForm = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: emptySubject,
  })
  const assignmentForm = useForm<SubjectAssignmentFormValues>({
    resolver: zodResolver(subjectAssignmentSchema),
    defaultValues: emptyAssignment,
  })

  useEffect(() => {
    if (!subjectDialog.open) return
    subjectForm.reset(
      subjectDialog.item
        ? {
            name: subjectDialog.item.name,
            code: subjectDialog.item.code,
            color: subjectDialog.item.color,
            description: subjectDialog.item.description,
            weeklyHours: subjectDialog.item.weeklyHours,
          }
        : emptySubject,
    )
  }, [subjectDialog, subjectForm])

  useEffect(() => {
    if (!assignmentDialog.open) return
    assignmentForm.reset(
      assignmentDialog.item
        ? {
            subjectId: assignmentDialog.item.subjectId,
            classId: assignmentDialog.item.classId,
            teacherId: assignmentDialog.item.teacherId,
            schedule: assignmentDialog.item.schedule,
          }
        : emptyAssignment,
    )
  }, [assignmentDialog, assignmentForm])

  const canManage = scope.isAdmin

  return (
    <Box>
      <PageHeader
        title={t('subjects.title')}
        subtitle={t('subjects.subtitle')}
        gradient="secondary"
        icon={<MenuBookRoundedIcon sx={{ fontSize: 30 }} />}
        action={
          canManage ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddRoundedIcon />}
              onClick={() =>
                tab === 0
                  ? setSubjectDialog({ open: true, item: null })
                  : setAssignmentDialog({ open: true, item: null })
              }
            >
              {tab === 0 ? t('subjects.addSubject') : t('subjects.addAssignment')}
            </Button>
          ) : null
        }
      />

      <Card sx={{ mb: 2.5 }}>
        <Tabs value={tab} onChange={(_, value: number) => setTab(value)} variant="fullWidth">
          <Tab label={t('subjects.tabSubjects')} />
          <Tab label={t('subjects.tabAssignments')} />
        </Tabs>
      </Card>

      {vm.loading ? (
        <LoadingSkeleton variant="cards" count={6} />
      ) : tab === 0 ? (
        vm.subjects.length === 0 ? (
          <EmptyState title={t('subjects.noSubjects')} />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            }}
          >
            {vm.subjects.map((subject) => (
              <Card key={subject.id}>
                <Box sx={{ height: 6, bgcolor: subject.color }} />
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 3,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: alpha(subject.color, 0.15),
                        color: subject.color,
                        fontWeight: 900,
                        fontSize: 13,
                      }}
                    >
                      {subject.code}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                        {subject.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {subject.weeklyHours} {t('subjects.weeklyHours')}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      minHeight: 40,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {subject.description}
                  </Typography>
                  {canManage ? (
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ mt: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => setSubjectDialog({ open: true, item: subject })}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          setConfirm({
                            open: true,
                            kind: 'subject',
                            id: subject.id,
                            name: subject.name,
                          })
                        }
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </Box>
        )
      ) : vm.subjectAssignments.length === 0 ? (
        <EmptyState title={t('subjects.noAssignments')} />
      ) : (
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('common.subject')}</TableCell>
                <TableCell>{t('subjects.class')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  {t('subjects.teacher')}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  {t('subjects.schedule')}
                </TableCell>
                {canManage ? <TableCell align="right">{t('common.actions')}</TableCell> : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {vm.subjectAssignments.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Chip
                      size="small"
                      label={vm.subjectNameOf(item.subjectId)}
                      sx={{
                        bgcolor: alpha(vm.subjectColorOf(item.subjectId), 0.14),
                        color: vm.subjectColorOf(item.subjectId),
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell>{vm.classNameOf(item.classId)}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {vm.teacherNameOf(item.teacherId)}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <ScheduleRoundedIcon fontSize="small" color="disabled" />
                      <Typography variant="body2">{item.schedule}</Typography>
                    </Stack>
                  </TableCell>
                  {canManage ? (
                    <TableCell align="right">
                      <Tooltip title={t('common.edit')}>
                        <IconButton
                          size="small"
                          onClick={() => setAssignmentDialog({ open: true, item })}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.delete')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setConfirm({
                              open: true,
                              kind: 'assignment',
                              id: item.id,
                              name: vm.subjectNameOf(item.subjectId),
                            })
                          }
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog
        open={subjectDialog.open}
        onClose={() => setSubjectDialog({ open: false, item: null })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {subjectDialog.item ? t('subjects.editSubject') : t('subjects.addSubject')}
        </DialogTitle>
        <Box
          component="form"
          noValidate
          onSubmit={subjectForm.handleSubmit(async (values) => {
            const ok = subjectDialog.item
              ? await vm.updateSubject(subjectDialog.item.id, values)
              : await vm.createSubject(values)
            if (ok) setSubjectDialog({ open: false, item: null })
          })}
        >
          <DialogContent dividers>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                pt: 0.5,
              }}
            >
              <Controller
                control={subjectForm.control}
                name="name"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('subjects.subjectName')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  />
                )}
              />
              <Controller
                control={subjectForm.control}
                name="code"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('subjects.code')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  />
                )}
              />
              <Controller
                control={subjectForm.control}
                name="weeklyHours"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t('subjects.weeklyHours')}
                    fullWidth
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  />
                )}
              />
              <Controller
                control={subjectForm.control}
                name="color"
                render={({ field }) => (
                  <TextField {...field} type="color" label={t('subjects.color')} fullWidth />
                )}
              />
              <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                <Controller
                  control={subjectForm.control}
                  name="description"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('common.description')}
                      fullWidth
                      multiline
                      rows={3}
                    />
                  )}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button color="inherit" onClick={() => setSubjectDialog({ open: false, item: null })}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={vm.saving}>
              {vm.saving ? t('common.saving') : t('common.save')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={assignmentDialog.open}
        onClose={() => setAssignmentDialog({ open: false, item: null })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {assignmentDialog.item ? t('subjects.editAssignment') : t('subjects.addAssignment')}
        </DialogTitle>
        <Box
          component="form"
          noValidate
          onSubmit={assignmentForm.handleSubmit(async (values) => {
            const ok = assignmentDialog.item
              ? await vm.updateAssignment(assignmentDialog.item.id, values)
              : await vm.createAssignment(values)
            if (ok) setAssignmentDialog({ open: false, item: null })
          })}
        >
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <Controller
                control={assignmentForm.control}
                name="subjectId"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label={t('common.subject')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  >
                    {vm.subjects.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                control={assignmentForm.control}
                name="classId"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label={t('subjects.class')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  >
                    {vm.classes.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                control={assignmentForm.control}
                name="teacherId"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label={t('subjects.teacher')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  >
                    {vm.teachers.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                control={assignmentForm.control}
                name="schedule"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('subjects.schedule')}
                    fullWidth
                    placeholder="Senin, 07.00 - 08.30"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button color="inherit" onClick={() => setAssignmentDialog({ open: false, item: null })}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={vm.saving}>
              {vm.saving ? t('common.saving') : t('common.save')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={confirm.open}
        title={t('common.confirm')}
        message={
          confirm.kind === 'subject'
            ? t('subjects.deleteConfirm', { name: confirm.name })
            : t('subjects.deleteAssignmentConfirm')
        }
        confirmLabel={t('common.delete')}
        loading={vm.saving}
        onConfirm={async () => {
          if (confirm.kind === 'subject') await vm.deleteSubject(confirm.id)
          else await vm.deleteAssignment(confirm.id)
          setConfirm((state) => ({ ...state, open: false }))
        }}
        onCancel={() => setConfirm((state) => ({ ...state, open: false }))}
      />
    </Box>
  )
}
