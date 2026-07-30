import { useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { SchoolClass } from '@/features/classes/models/types'
import type { Student } from '../models/types'
import { studentSchema, type StudentFormValues } from '../viewmodels/useUsersViewModel'

interface StudentFormDialogProps {
  open: boolean
  student: Student | null
  classes: SchoolClass[]
  saving: boolean
  onClose: () => void
  onSubmit: (values: StudentFormValues) => Promise<void>
}

const emptyValues: StudentFormValues = {
  name: '',
  nis: '',
  nisn: '',
  classId: '',
  gender: 'L',
  birthDate: '',
  address: '',
  academicStatus: 'active',
  parent: {
    fatherName: '',
    motherName: '',
    guardianName: '',
    phone: '',
    email: '',
    occupation: '',
    address: '',
    hasAccount: false,
  },
}

export default function StudentFormDialog({
  open,
  student,
  classes,
  saving,
  onClose,
  onSubmit,
}: StudentFormDialogProps) {
  const { t } = useTranslation()
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      student
        ? {
            name: student.name,
            nis: student.nis,
            nisn: student.nisn,
            classId: student.classId,
            gender: student.gender,
            birthDate: student.birthDate,
            address: student.address,
            academicStatus: student.academicStatus,
            parent: {
              fatherName: student.parent.fatherName,
              motherName: student.parent.motherName,
              guardianName: student.parent.guardianName ?? '',
              phone: student.parent.phone,
              email: student.parent.email,
              occupation: student.parent.occupation,
              address: student.parent.address,
              hasAccount: student.parent.hasAccount,
            },
          }
        : emptyValues,
    )
  }, [form, open, student])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800 }}>
        {student ? t('users.editStudent') : t('users.addStudent')}
      </DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
            {t('users.personalInfo')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
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
              name="classId"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label={t('common.class')}
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                >
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
              name="nis"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t('users.nis')}
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                />
              )}
            />
            <Controller
              control={form.control}
              name="nisn"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t('users.nisn')}
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
              name="birthDate"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="date"
                  label={t('users.birthDate')}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                />
              )}
            />
            <Controller
              control={form.control}
              name="academicStatus"
              render={({ field }) => (
                <TextField {...field} select label={t('users.academicStatus')} fullWidth>
                  <MenuItem value="active">{t('common.active')}</MenuItem>
                  <MenuItem value="graduated">{t('users.graduated')}</MenuItem>
                  <MenuItem value="transferred">{t('users.transferred')}</MenuItem>
                </TextField>
              )}
            />
            <Controller
              control={form.control}
              name="address"
              render={({ field }) => <TextField {...field} label={t('common.address')} fullWidth />}
            />
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
            {t('users.parentInfo')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Controller
              control={form.control}
              name="parent.fatherName"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t('users.fatherName')}
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                />
              )}
            />
            <Controller
              control={form.control}
              name="parent.motherName"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t('users.motherName')}
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                />
              )}
            />
            <Controller
              control={form.control}
              name="parent.guardianName"
              render={({ field }) => (
                <TextField
                  {...field}
                  label={`${t('users.guardianName')} (${t('common.optional')})`}
                  fullWidth
                />
              )}
            />
            <Controller
              control={form.control}
              name="parent.phone"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t('users.parentPhone')}
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                />
              )}
            />
            <Controller
              control={form.control}
              name="parent.email"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t('users.parentEmail')}
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                />
              )}
            />
            <Controller
              control={form.control}
              name="parent.occupation"
              render={({ field }) => (
                <TextField {...field} label={t('users.occupation')} fullWidth />
              )}
            />
            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <Controller
                control={form.control}
                name="parent.address"
                render={({ field }) => (
                  <TextField {...field} label={t('users.parentAddress')} fullWidth multiline rows={2} />
                )}
              />
            </Box>
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
