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
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded'
import PageHeader from '@/components/common/PageHeader'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { formatDateTime } from '@/lib/format'
import { useLocaleStore } from '@/store/localeStore'
import type { Announcement, AnnouncementPriority } from '../models/types'
import {
  announcementSchema,
  useAnnouncementsViewModel,
  type AnnouncementFormValues,
} from '../viewmodels/useAnnouncementsViewModel'

const priorityColor: Record<AnnouncementPriority, string> = {
  normal: '#1976D2',
  important: '#F9A825',
  urgent: '#D32F2F',
}

const emptyValues: AnnouncementFormValues = {
  title: '',
  content: '',
  audience: 'all',
  priority: 'normal',
  pinned: false,
}

export default function AnnouncementsPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const locale = useLocaleStore((state) => state.locale)
  const vm = useAnnouncementsViewModel()

  const [dialog, setDialog] = useState<{ open: boolean; item: Announcement | null }>({
    open: false,
    item: null,
  })
  const [confirm, setConfirm] = useState<{ open: boolean; item: Announcement | null }>({
    open: false,
    item: null,
  })

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!dialog.open) return
    form.reset(
      dialog.item
        ? {
            title: dialog.item.title,
            content: dialog.item.content,
            audience: dialog.item.audience,
            priority: dialog.item.priority,
            pinned: dialog.item.pinned,
          }
        : emptyValues,
    )
  }, [dialog, form])

  return (
    <Box>
      <PageHeader
        title={t('announcements.title')}
        subtitle={t('announcements.subtitle')}
        gradient="sunset"
        icon={<CampaignRoundedIcon sx={{ fontSize: 30 }} />}
        action={
          vm.canManage ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddRoundedIcon />}
              onClick={() => setDialog({ open: true, item: null })}
            >
              {t('announcements.addAnnouncement')}
            </Button>
          ) : null
        }
      />

      {vm.loading ? (
        <LoadingSkeleton variant="list" count={4} />
      ) : vm.announcements.length === 0 ? (
        <EmptyState
          title={t('announcements.noAnnouncements')}
          actionLabel={vm.canManage ? t('announcements.addAnnouncement') : undefined}
          onAction={vm.canManage ? () => setDialog({ open: true, item: null }) : undefined}
        />
      ) : (
        <Stack spacing={2}>
          {vm.announcements.map((item) => (
            <Card
              key={item.id}
              sx={{
                borderLeft: `5px solid ${priorityColor[item.priority]}`,
                bgcolor: item.pinned
                  ? alpha(theme.palette.secondary.main, theme.palette.mode === 'light' ? 0.06 : 0.12)
                  : 'background.paper',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                      {item.pinned ? (
                        <PushPinRoundedIcon fontSize="small" color="secondary" />
                      ) : null}
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {item.title}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1.25 }}>
                      <Chip
                        size="small"
                        label={t(`announcements.priority${item.priority.charAt(0).toUpperCase()}${item.priority.slice(1)}`)}
                        sx={{
                          fontWeight: 700,
                          bgcolor: alpha(priorityColor[item.priority], 0.14),
                          color: priorityColor[item.priority],
                        }}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={t(
                          `announcements.audience${item.audience.charAt(0).toUpperCase()}${item.audience.slice(1)}`,
                        )}
                      />
                    </Stack>
                  </Box>
                  {vm.canManage ? (
                    <Box sx={{ flexShrink: 0 }}>
                      <Tooltip title={t('common.edit')}>
                        <IconButton size="small" onClick={() => setDialog({ open: true, item })}>
                          <EditRoundedIcon fontSize="small" />
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
                    </Box>
                  ) : null}
                </Stack>

                <Typography variant="body2" sx={{ lineHeight: 1.85, whiteSpace: 'pre-line' }}>
                  {item.content}
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  {t('announcements.publishedBy', { name: item.authorName })} ·{' '}
                  {formatDateTime(item.publishedAt, locale)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, item: null })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {dialog.item ? t('announcements.editAnnouncement') : t('announcements.addAnnouncement')}
        </DialogTitle>
        <Box
          component="form"
          noValidate
          onSubmit={form.handleSubmit(async (values) => {
            const ok = dialog.item
              ? await vm.updateAnnouncement(dialog.item.id, values)
              : await vm.createAnnouncement(values)
            if (ok) setDialog({ open: false, item: null })
          })}
        >
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <Controller
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('announcements.announcementTitle')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  />
                )}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  control={form.control}
                  name="audience"
                  render={({ field }) => (
                    <TextField {...field} select label={t('announcements.audience')} fullWidth>
                      <MenuItem value="all">{t('announcements.audienceAll')}</MenuItem>
                      <MenuItem value="teachers">{t('announcements.audienceTeachers')}</MenuItem>
                      <MenuItem value="students">{t('announcements.audienceStudents')}</MenuItem>
                      <MenuItem value="parents">{t('announcements.audienceParents')}</MenuItem>
                    </TextField>
                  )}
                />
                <Controller
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <TextField {...field} select label={t('announcements.priority')} fullWidth>
                      <MenuItem value="normal">{t('announcements.priorityNormal')}</MenuItem>
                      <MenuItem value="important">{t('announcements.priorityImportant')}</MenuItem>
                      <MenuItem value="urgent">{t('announcements.priorityUrgent')}</MenuItem>
                    </TextField>
                  )}
                />
              </Stack>
              <Controller
                control={form.control}
                name="content"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('announcements.content')}
                    fullWidth
                    multiline
                    rows={5}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="pinned"
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label={t('announcements.pinAnnouncement')}
                  />
                )}
              />
            </Stack>
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
        message={t('announcements.deleteConfirm', { name: confirm.item?.title ?? '' })}
        confirmLabel={t('common.delete')}
        loading={vm.saving}
        onConfirm={async () => {
          if (confirm.item) await vm.deleteAnnouncement(confirm.item.id)
          setConfirm({ open: false, item: null })
        }}
        onCancel={() => setConfirm({ open: false, item: null })}
      />
    </Box>
  )
}
