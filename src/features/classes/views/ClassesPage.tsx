import { useEffect, useState } from 'react'
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import ClassRoundedIcon from '@mui/icons-material/ClassRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import UnarchiveRoundedIcon from '@mui/icons-material/UnarchiveRounded'
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded'
import PageHeader from '@/components/common/PageHeader'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { getInitials } from '@/lib/format'
import { useRoleScope } from '@/hooks/useRoleScope'
import type { SchoolClass } from '../models/types'
import { classSchema, useClassesViewModel, type ClassFormValues } from '../viewmodels/useClassesViewModel'

const emptyValues: ClassFormValues = {
  name: '',
  grade: 1,
  academicYear: '2024/2025',
  homeroomTeacherId: null,
  room: '',
  status: 'active',
}

export default function ClassesPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const scope = useRoleScope()
  const vm = useClassesViewModel()

  const [dialog, setDialog] = useState<{ open: boolean; item: SchoolClass | null }>({
    open: false,
    item: null,
  })
  const [confirm, setConfirm] = useState<{ open: boolean; item: SchoolClass | null }>({
    open: false,
    item: null,
  })

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!dialog.open) return
    form.reset(
      dialog.item
        ? {
            name: dialog.item.name,
            grade: dialog.item.grade,
            academicYear: dialog.item.academicYear,
            homeroomTeacherId: dialog.item.homeroomTeacherId,
            room: dialog.item.room,
            status: dialog.item.status,
          }
        : emptyValues,
    )
  }, [dialog, form])

  const onSubmit = async (values: ClassFormValues) => {
    const ok = dialog.item
      ? await vm.updateClass(dialog.item.id, values)
      : await vm.createClass(values)
    if (ok) setDialog({ open: false, item: null })
  }

  return (
    <Box>
      <PageHeader
        title={t('classes.title')}
        subtitle={t('classes.subtitle')}
        gradient="rose"
        icon={<ClassRoundedIcon sx={{ fontSize: 30 }} />}
        action={
          scope.isAdmin ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddRoundedIcon />}
              onClick={() => setDialog({ open: true, item: null })}
            >
              {t('classes.addClass')}
            </Button>
          ) : null
        }
      />

      {vm.loading ? (
        <LoadingSkeleton variant="cards" count={6} />
      ) : vm.classes.length === 0 ? (
        <EmptyState
          title={t('classes.noClasses')}
          actionLabel={scope.isAdmin ? t('classes.addClass') : undefined}
          onAction={scope.isAdmin ? () => setDialog({ open: true, item: null }) : undefined}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          }}
        >
          {vm.classes.map((item) => {
            const students = vm.students.filter((student) => item.studentIds.includes(student.id))
            return (
              <Card key={item.id} sx={{ opacity: item.status === 'archived' ? 0.65 : 1 }}>
                <CardActionArea onClick={() => navigate(`/classes/${item.id}`)}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 900,
                          fontSize: 18,
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: 'primary.main',
                        }}
                      >
                        {item.grade}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }} noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.academicYear}
                        </Typography>
                      </Box>
                      {item.status === 'archived' ? (
                        <Chip size="small" label={t('common.archived')} />
                      ) : null}
                    </Stack>

                    <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: 'primary.main' }}>
                          {getInitials(vm.teacherNameOf(item.homeroomTeacherId))}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {vm.teacherNameOf(item.homeroomTeacherId)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MeetingRoomRoundedIcon fontSize="small" color="disabled" />
                        <Typography variant="body2" color="text.secondary">
                          {item.room}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 11 } }}>
                        {students.map((student) => (
                          <Avatar key={student.id} sx={{ bgcolor: student.avatarColor }}>
                            {getInitials(student.name)}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                      <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={`${item.studentIds.length} ${t('common.students')}`}
                      />
                    </Stack>
                  </CardContent>
                </CardActionArea>
                {scope.isAdmin ? (
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ px: 1.5, pb: 1.5 }}>
                    <Tooltip title={t('common.edit')}>
                      <IconButton size="small" onClick={() => setDialog({ open: true, item })}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={item.status === 'active' ? t('classes.archiveClass') : t('classes.unarchiveClass')}
                    >
                      <IconButton size="small" onClick={() => void vm.toggleArchive(item)}>
                        {item.status === 'active' ? (
                          <ArchiveRoundedIcon fontSize="small" />
                        ) : (
                          <UnarchiveRoundedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.delete')}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setConfirm({ open: true, item })}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ) : null}
              </Card>
            )
          })}
        </Box>
      )}

      <Dialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, item: null })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {dialog.item ? t('classes.editClass') : t('classes.addClass')}
        </DialogTitle>
        <Box component="form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('classes.className')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="grade"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label={t('classes.grade')}
                    fullWidth
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  >
                    {[1, 2, 3, 4, 5, 6].map((grade) => (
                      <MenuItem key={grade} value={grade}>
                        {grade}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                control={form.control}
                name="academicYear"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('classes.academicYear')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="room"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('classes.room')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="homeroomTeacherId"
                render={({ field }) => (
                  <TextField
                    select
                    label={t('classes.homeroomTeacher')}
                    fullWidth
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value || null)}
                  >
                    <MenuItem value="">{t('common.none')}</MenuItem>
                    {vm.teachers.map((teacher) => (
                      <MenuItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <TextField {...field} select label={t('common.status')} fullWidth>
                    <MenuItem value="active">{t('common.active')}</MenuItem>
                    <MenuItem value="archived">{t('common.archived')}</MenuItem>
                  </TextField>
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button color="inherit" onClick={() => setDialog({ open: false, item: null })}>
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
        message={t('classes.deleteConfirm', { name: confirm.item?.name ?? '' })}
        confirmLabel={t('common.delete')}
        loading={vm.saving}
        onConfirm={async () => {
          if (confirm.item) await vm.deleteClass(confirm.item.id)
          setConfirm({ open: false, item: null })
        }}
        onCancel={() => setConfirm({ open: false, item: null })}
      />
    </Box>
  )
}
