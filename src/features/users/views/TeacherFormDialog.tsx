import { useEffect } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  ListItemText,
  MenuItem,
  TextField,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { SchoolClass } from '@/features/classes/models/types'
import type { Subject } from '@/features/subjects/models/types'
import type { Teacher } from '../models/types'
import { teacherSchema, type TeacherFormValues } from '../viewmodels/useUsersViewModel'

interface TeacherFormDialogProps {
  open: boolean
  teacher: Teacher | null
  subjects: Subject[]
  classes: SchoolClass[]
  saving: boolean
  onClose: () => void
  onSubmit: (values: TeacherFormValues) => Promise<void>
}

const emptyValues: TeacherFormValues = {
  name: '',
  employeeNumber: '',
  email: '',
  phone: '',
  gender: 'L',
  subjectIds: [],
  homeroomClassId: null,
  accountStatus: 'active',
  username: '',
}

export default function TeacherFormDialog({
  open,
  teacher,
  subjects,
  classes,
  saving,
  onClose,
  onSubmit,
}: TeacherFormDialogProps) {
  const { t } = useTranslation()
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      teacher
        ? {
            name: teacher.name,
            employeeNumber: teacher.employeeNumber,
            email: teacher.email,
            phone: teacher.phone,
            gender: teacher.gender,
            subjectIds: teacher.subjectIds,
            homeroomClassId: teacher.homeroomClassId,
            accountStatus: teacher.accountStatus,
            username: teacher.username,
          }
        : emptyValues,
    )
  }, [form, open, teacher])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>
        {teacher ? t('users.editTeacher') : t('users.addTeacher')}
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
                  label={t('common.name')}
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                />
              )}
            />
            <Controller
              control={form.control}
              name="employeeNumber"
              render={({ field }) => (
                <TextField {...field} label={t('users.employeeNumber')} fullWidth />
              )}
            />
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t('common.email')}
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                />
              )}
            />
            <Controller
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t('common.phone')}
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                />
              )}
            />
            <Controller
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t('auth.username')}
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                />
              )}
            />
            <Controller
              control={form.control}
              name="gender"
              render={({ field }) => (
                <TextField {...field} select label={t('users.gender')} fullWidth>
                  <MenuItem value="L">{t('common.male')}</MenuItem>
                  <MenuItem value="P">{t('common.female')}</MenuItem>
                </TextField>
              )}
            />
            <Controller
              control={form.control}
              name="subjectIds"
              render={({ field }) => (
                <TextField
                  select
                  label={t('users.subjectsTaught')}
                  fullWidth
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(
                      typeof event.target.value === 'string'
                        ? event.target.value.split(',')
                        : event.target.value,
                    )
                  }
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) =>
                      (selected as string[])
                        .map((id) => subjects.find((item) => item.id === id)?.name ?? id)
                        .join(', '),
                  }}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      <Checkbox checked={field.value.includes(subject.id)} size="small" />
                      <ListItemText primary={subject.name} />
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              control={form.control}
              name="homeroomClassId"
              render={({ field }) => (
                <TextField
                  select
                  label={t('users.homeroomOf')}
                  fullWidth
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(event.target.value || null)}
                >
                  <MenuItem value="">{t('users.noHomeroom')}</MenuItem>
                  {classes.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              control={form.control}
              name="accountStatus"
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value === 'active'}
                      onChange={(event) => field.onChange(event.target.checked ? 'active' : 'inactive')}
                    />
                  }
                  label={t('common.active')}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
