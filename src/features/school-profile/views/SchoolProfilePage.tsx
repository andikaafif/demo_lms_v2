import { useEffect, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import CallRoundedIcon from '@mui/icons-material/CallRounded'
import MailRoundedIcon from '@mui/icons-material/MailRounded'
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded'
import PageHeader from '@/components/common/PageHeader'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import { useRoleScope } from '@/hooks/useRoleScope'
import {
  schoolProfileSchema,
  useSchoolProfileViewModel,
  type SchoolProfileFormValues,
} from '../viewmodels/useSchoolProfileViewModel'

const accreditations: SchoolProfileFormValues['accreditation'][] = [
  'A',
  'B',
  'C',
  'Belum Terakreditasi',
]

export default function SchoolProfilePage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const scope = useRoleScope()
  const { school, loading, saving, save } = useSchoolProfileViewModel()
  const [editing, setEditing] = useState(false)

  const form = useForm<SchoolProfileFormValues>({
    resolver: zodResolver(schoolProfileSchema),
    defaultValues: {
      name: '',
      npsn: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      principalName: '',
      accreditation: 'A',
      description: '',
      establishedYear: 2000,
    },
  })

  useEffect(() => {
    if (!school) return
    form.reset({
      name: school.name,
      npsn: school.npsn,
      address: school.address,
      phone: school.phone,
      email: school.email,
      website: school.website,
      principalName: school.principalName,
      accreditation: school.accreditation,
      description: school.description,
      establishedYear: school.establishedYear,
    })
  }, [form, school])

  const onSubmit = async (values: SchoolProfileFormValues) => {
    const ok = await save(values)
    if (ok) setEditing(false)
  }

  if (loading || !school) {
    return (
      <Box>
        <PageHeader title={t('school.title')} subtitle={t('school.subtitle')} gradient="primary" />
        <LoadingSkeleton variant="detail" />
      </Box>
    )
  }

  const infoRows = [
    { icon: <PlaceRoundedIcon />, label: t('school.address'), value: school.address },
    { icon: <CallRoundedIcon />, label: t('school.phone'), value: school.phone },
    { icon: <MailRoundedIcon />, label: t('school.email'), value: school.email },
    { icon: <LanguageRoundedIcon />, label: t('school.website'), value: school.website || '-' },
    {
      icon: <PersonRoundedIcon />,
      label: t('school.principalName'),
      value: school.principalName,
    },
    {
      icon: <WorkspacePremiumRoundedIcon />,
      label: t('school.accreditation'),
      value: school.accreditation,
    },
  ]

  return (
    <Box>
      <PageHeader
        title={t('school.title')}
        subtitle={t('school.subtitle')}
        gradient="primary"
        icon={<SchoolRoundedIcon sx={{ fontSize: 30 }} />}
        action={
          scope.isAdmin && !editing ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<EditRoundedIcon />}
              onClick={() => setEditing(true)}
            >
              {t('school.editProfile')}
            </Button>
          ) : null
        }
      />

      {editing ? (
        <Card>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Box component="form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                }}
              >
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={t('school.schoolName')}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="npsn"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={t('school.npsn')}
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
                      label={t('school.phone')}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={t('school.email')}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="website"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={t('school.website')}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="principalName"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={t('school.principalName')}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="accreditation"
                  render={({ field }) => (
                    <TextField {...field} select label={t('school.accreditation')} fullWidth>
                      {accreditations.map((item) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  control={form.control}
                  name="establishedYear"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      label={t('school.establishedYear')}
                      fullWidth
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                    />
                  )}
                />
                <Box sx={{ gridColumn: { md: '1 / -1' } }}>
                  <Controller
                    control={form.control}
                    name="address"
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label={t('school.address')}
                        fullWidth
                        multiline
                        rows={2}
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                      />
                    )}
                  />
                </Box>
                <Box sx={{ gridColumn: { md: '1 / -1' } }}>
                  <Controller
                    control={form.control}
                    name="description"
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label={t('school.description')}
                        fullWidth
                        multiline
                        rows={3}
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                      />
                    )}
                  />
                </Box>
              </Box>

              <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button color="inherit" onClick={() => setEditing(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" variant="contained" disabled={saving}>
                  {saving ? t('common.saving') : t('common.saveChanges')}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2.5,
            gridTemplateColumns: { xs: '1fr', md: '340px 1fr' },
            alignItems: 'start',
          }}
        >
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                src={school.logoUrl}
                sx={{
                  width: 108,
                  height: 108,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                }}
              >
                <SchoolRoundedIcon sx={{ fontSize: 52 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {school.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {t('school.npsn')}: {school.npsn}
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center">
                <Chip
                  size="small"
                  color="primary"
                  label={`${t('school.accreditation')} ${school.accreditation}`}
                />
                <Chip size="small" variant="outlined" label={school.establishedYear} />
              </Stack>
              {!scope.isAdmin ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  {t('school.readOnlyHint')}
                </Typography>
              ) : null}
            </CardContent>
          </Card>

          <Stack spacing={2.5}>
            <Card>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                  {t('school.title')}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  }}
                >
                  {infoRows.map((row) => (
                    <Stack key={row.label} direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 2,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        {row.icon}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary">
                          {row.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
                          {row.value}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                  {t('school.description')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {school.description}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      )}
    </Box>
  )
}
