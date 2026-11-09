import { useEffect, useState, type ReactElement } from 'react'
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
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded'
import ImageRoundedIcon from '@mui/icons-material/ImageRounded'
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded'
import SlideshowRoundedIcon from '@mui/icons-material/SlideshowRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import PageHeader from '@/components/common/PageHeader'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import AcademicContextBar from '@/components/common/AcademicContextBar'
import { formatDate, formatFileSize, youtubeEmbedUrl } from '@/lib/format'
import { useLocaleStore } from '@/store/localeStore'
import { useSnackbarStore } from '@/store/snackbarStore'
import type { Material, MaterialType } from '../models/types'
import {
  materialSchema,
  useMaterialsViewModel,
  type MaterialFormValues,
} from '../viewmodels/useMaterialsViewModel'

const typeIcon: Record<MaterialType, ReactElement> = {
  pdf: <PictureAsPdfRoundedIcon />,
  image: <ImageRoundedIcon />,
  video: <PlayCircleRoundedIcon />,
  link: <LinkRoundedIcon />,
  text: <ArticleRoundedIcon />,
  ppt: <SlideshowRoundedIcon />,
  doc: <DescriptionRoundedIcon />,
}

const emptyValues: MaterialFormValues = {
  title: '',
  description: '',
  subjectId: '',
  classId: '',
  meeting: 1,
  textbook: '',
  linkLabel: '',
  linkUrl: '',
  type: 'pdf',
  youtubeUrl: '',
  attachmentName: '',
}

export default function MaterialsPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)
  const notify = useSnackbarStore((state) => state.notify)
  const vm = useMaterialsViewModel()

  const [dialog, setDialog] = useState<{ open: boolean; item: Material | null }>({
    open: false,
    item: null,
  })
  const [confirm, setConfirm] = useState<{ open: boolean; item: Material | null }>({
    open: false,
    item: null,
  })
  const [preview, setPreview] = useState<Material | null>(null)

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: emptyValues,
  })
  const selectedType = form.watch('type')

  useEffect(() => {
    if (!dialog.open) return
    form.reset(
      dialog.item
        ? {
            title: dialog.item.title,
            description: dialog.item.description,
            subjectId: dialog.item.subjectId,
            classId: dialog.item.classId,
            type: dialog.item.type,
            youtubeUrl: dialog.item.youtubeUrl ?? '',
            attachmentName: dialog.item.attachments[0]?.name ?? '',
          }
        : {
            ...emptyValues,
            classId: vm.availableClasses[0]?.id ?? '',
            subjectId: vm.availableSubjects[0]?.id ?? '',
          },
    )
  }, [dialog, form, vm.availableClasses, vm.availableSubjects])

  return (
    <Box>
      <PageHeader
        title={t('materials.title')}
        subtitle={t('materials.subtitle')}
        gradient="teal"
        icon={<LibraryBooksRoundedIcon sx={{ fontSize: 30 }} />}
        action={
          vm.canManage ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddRoundedIcon />}
              onClick={() => setDialog({ open: true, item: null })}
            >
              {t('materials.addMaterial')}
            </Button>
          ) : null
        }
      />

      <AcademicContextBar />

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              size="small"
              fullWidth
              value={vm.search}
              onChange={(event) => vm.setSearch(event.target.value)}
              placeholder={t('common.search')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            {vm.canManage ? (
              <TextField
                size="small"
                select
                label={t('materials.filterByClass')}
                value={vm.classFilter}
                onChange={(event) => vm.setClassFilter(event.target.value)}
                sx={{ minWidth: { md: 200 } }}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {vm.availableClasses.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}
            <TextField
              size="small"
              select
              label={t('materials.filterBySubject')}
              value={vm.subjectFilter}
              onChange={(event) => vm.setSubjectFilter(event.target.value)}
              sx={{ minWidth: { md: 220 } }}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              {vm.availableSubjects.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {vm.loading ? (
        <LoadingSkeleton variant="cards" count={6} />
      ) : vm.materials.length === 0 ? (
        <EmptyState
          title={t('materials.noMaterials')}
          description={t('materials.noMaterialsHint')}
          actionLabel={vm.canManage ? t('materials.addMaterial') : undefined}
          onAction={vm.canManage ? () => setDialog({ open: true, item: null }) : undefined}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          }}
        >
          {vm.materials.map((material) => {
            const color = vm.subjectColorOf(material.subjectId)
            return (
              <Card key={material.id} sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 2.5, flex: 1 }}>
                  <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 3,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: alpha(color, 0.14),
                        color,
                        flexShrink: 0,
                      }}
                    >
                      {typeIcon[material.type]}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                        {material.title}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                        <Chip
                          size="small"
                          label={vm.subjectNameOf(material.subjectId)}
                          sx={{ bgcolor: alpha(color, 0.14), color, fontWeight: 700 }}
                        />
                        <Chip size="small" variant="outlined" label={vm.classNameOf(material.classId)} />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={t('materials.meetingLabel', { meeting: material.meeting })}
                        />
                      </Stack>
                    </Box>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: 60,
                    }}
                  >
                    {material.description}
                  </Typography>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 1.5 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(material.publishedAt, locale)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('materials.viewCount', { count: material.viewCount })}
                    </Typography>
                  </Stack>
                </CardContent>

                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ px: 2, pb: 2 }}
                >
                  <Button
                    size="small"
                    startIcon={<VisibilityRoundedIcon />}
                    onClick={() => {
                      setPreview(material)
                      void vm.registerView(material.id)
                    }}
                  >
                    {t('common.view')}
                  </Button>
                  {vm.canManage ? (
                    <Box>
                      <Tooltip title={t('common.edit')}>
                        <IconButton size="small" onClick={() => setDialog({ open: true, item: material })}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.delete')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setConfirm({ open: true, item: material })}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : null}
                </Stack>
              </Card>
            )
          })}
        </Box>
      )}

      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 800 }}>{preview?.title}</DialogTitle>
        <DialogContent dividers>
          {preview?.type === 'video' && preview.youtubeUrl ? (
            <Box
              sx={{
                position: 'relative',
                pt: '56.25%',
                borderRadius: 3,
                overflow: 'hidden',
                mb: 2,
              }}
            >
              <Box
                component="iframe"
                src={youtubeEmbedUrl(preview.youtubeUrl) ?? preview.youtubeUrl}
                title={preview.title}
                allowFullScreen
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                }}
              />
            </Box>
          ) : null}
          <Typography variant="body2" sx={{ lineHeight: 1.9, whiteSpace: 'pre-line' }}>
            {preview?.description}
          </Typography>
          {preview && preview.attachments.length > 0 ? (
            <Box sx={{ mt: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                {t('materials.attachments')}
              </Typography>
              <Stack spacing={1}>
                {preview.attachments.map((attachment) => (
                  <Stack
                    key={attachment.id}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ p: 1.25, borderRadius: 2, bgcolor: 'action.hover' }}
                  >
                    {typeIcon[attachment.type]}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        {attachment.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(attachment.sizeKb)}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<DownloadRoundedIcon />}
                      onClick={() => notify(t('materials.downloadStarted'), 'info')}
                    >
                      {t('common.download')}
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPreview(null)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, item: null })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {dialog.item ? t('materials.editMaterial') : t('materials.addMaterial')}
        </DialogTitle>
        <Box
          component="form"
          noValidate
          onSubmit={form.handleSubmit(async (values) => {
            const ok = dialog.item
              ? await vm.updateMaterial(dialog.item.id, values)
              : await vm.createMaterial(values)
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
                    label={t('materials.materialTitle')}
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  />
                )}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  control={form.control}
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
                      {vm.availableSubjects.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </TextField>
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
                      {vm.availableClasses.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Stack>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <TextField {...field} select label={t('materials.type')} fullWidth>
                    <MenuItem value="pdf">{t('materials.typePdf')}</MenuItem>
                    <MenuItem value="image">{t('materials.typeImage')}</MenuItem>
                    <MenuItem value="video">{t('materials.typeVideo')}</MenuItem>
                    <MenuItem value="link">{t('materials.typeLink')}</MenuItem>
                    <MenuItem value="text">{t('materials.typeText')}</MenuItem>
                    <MenuItem value="ppt">{t('materials.typePpt')}</MenuItem>
                    <MenuItem value="doc">{t('materials.typeDoc')}</MenuItem>
                  </TextField>
                )}
              />
              {selectedType === 'video' ? (
                <Controller
                  control={form.control}
                  name="youtubeUrl"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={t('materials.youtubeUrl')}
                      fullWidth
                      placeholder="https://www.youtube.com/watch?v=..."
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                    />
                  )}
                />
              ) : (
                <Controller
                  control={form.control}
                  name="attachmentName"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={`${t('materials.fileName')} (${t('common.optional')})`}
                      fullWidth
                    />
                  )}
                />
              )}
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('common.description')}
                    fullWidth
                    multiline
                    rows={4}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
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
        message={t('materials.deleteConfirm', { name: confirm.item?.title ?? '' })}
        confirmLabel={t('common.delete')}
        loading={vm.saving}
        onConfirm={async () => {
          if (confirm.item) await vm.deleteMaterial(confirm.item.id)
          setConfirm({ open: false, item: null })
        }}
        onCancel={() => setConfirm({ open: false, item: null })}
      />
    </Box>
  )
}


