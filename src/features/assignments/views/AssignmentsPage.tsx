import { useEffect, useMemo, useState } from 'react'
import {
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
  Divider,
  FormControlLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded'
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import AcademicContextBar from '@/components/common/AcademicContextBar'
import PageHeader from '@/components/common/PageHeader'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { formatDateTime, toDateTimeLocalValue, daysUntil } from '@/lib/format'
import { useLocaleStore } from '@/store/localeStore'
import type {
  AssignmentFieldType,
  AssignmentWithStats,
  Submission,
  SubmissionStatus,
} from '../models/types'
import {
  assignmentSchema,
  createField,
  FIELD_TYPES,
  submissionSchema,
  useAssignmentsViewModel,
  type AssignmentFormValues,
  type SubmissionFormValues,
} from '../viewmodels/useAssignmentsViewModel'

const statusColor: Record<SubmissionStatus, 'default' | 'info' | 'success' | 'warning'> = {
  pending: 'default',
  submitted: 'info',
  graded: 'success',
  late: 'warning',
}

const statusKey: Record<SubmissionStatus, string> = {
  pending: 'assignments.statusPending',
  submitted: 'assignments.statusSubmitted',
  graded: 'assignments.statusGraded',
  late: 'assignments.statusLate',
}

export default function AssignmentsPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)
  const vm = useAssignmentsViewModel()

  const [dialog, setDialog] = useState<{ open: boolean; item: AssignmentWithStats | null }>({
    open: false,
    item: null,
  })
  const [confirm, setConfirm] = useState<{ open: boolean; item: AssignmentWithStats | null }>({
    open: false,
    item: null,
  })
  const [reviewing, setReviewing] = useState<AssignmentWithStats | null>(null)
  const [grading, setGrading] = useState<Submission | null>(null)
  const [gradeScore, setGradeScore] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')
  const [submitting, setSubmitting] = useState<AssignmentWithStats | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      subjectId: '',
      classId: '',
      meeting: 1,
      dueDate: '',
      maxScore: 100,
      allowFileUpload: true,
      allowTextAnswer: true,
      published: true,
      fields: [],
    },
  })

  const submissionForm = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { textAnswer: '', fileName: '' },
  })

  useEffect(() => {
    if (!dialog.open) return
    form.reset(
      dialog.item
        ? {
            title: dialog.item.title,
            description: dialog.item.description,
            subjectId: dialog.item.subjectId,
            classId: dialog.item.classId,
            meeting: dialog.item.meeting,
            dueDate: toDateTimeLocalValue(dialog.item.dueDate),
            maxScore: dialog.item.maxScore,
            allowFileUpload: dialog.item.allowFileUpload,
            allowTextAnswer: dialog.item.allowTextAnswer,
            published: dialog.item.published,
            fields: dialog.item.fields,
          }
        : {
            title: '',
            description: '',
            subjectId: vm.availableSubjects[0]?.id ?? '',
            classId: vm.availableClasses[0]?.id ?? '',
            meeting: 1,
            dueDate: '',
            maxScore: 100,
            allowFileUpload: true,
            allowTextAnswer: true,
            published: true,
            fields: [],
          },
    )
  }, [dialog, form, vm.availableClasses, vm.availableSubjects])

  useEffect(() => {
    if (!submitting) return
    const existing = vm.mySubmissionFor(submitting.id)
    submissionForm.reset({
      textAnswer: existing?.textAnswer ?? '',
      fileName: existing?.files[0]?.name ?? '',
    })
    setAnswers(existing?.answers ?? {})
  }, [submitting, submissionForm, vm])

  const reviewSubmissions = useMemo(
    () => (reviewing ? vm.submissionsFor(reviewing.id) : []),
    [reviewing, vm],
  )

  const dueLabel = (assignment: AssignmentWithStats) => {
    const days = daysUntil(assignment.dueDate)
    if (days < 0) return t('dashboard.overdue')
    if (days === 0) return t('dashboard.dueToday')
    return t('dashboard.dueIn', { count: days })
  }

  return (
    <Box>
      <PageHeader
        title={t('assignments.title')}
        subtitle={t('assignments.subtitle')}
        gradient="violet"
        icon={<AssignmentRoundedIcon sx={{ fontSize: 30 }} />}
        action={
          vm.canManage ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddRoundedIcon />}
              onClick={() => setDialog({ open: true, item: null })}
            >
              {t('assignments.addAssignment')}
            </Button>
          ) : null
        }
      />

      <AcademicContextBar />

      {vm.canManage ? (
        <Card sx={{ mb: 2.5 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                size="small"
                select
                label={t('common.class')}
                value={vm.classFilter}
                onChange={(event) => vm.setClassFilter(event.target.value)}
                fullWidth
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {vm.availableClasses.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                select
                label={t('common.subject')}
                value={vm.subjectFilter}
                onChange={(event) => vm.setSubjectFilter(event.target.value)}
                fullWidth
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
      ) : null}

      {vm.loading ? (
        <LoadingSkeleton variant="cards" count={4} />
      ) : vm.assignments.length === 0 ? (
        <EmptyState
          title={t('assignments.noAssignments')}
          description={t('assignments.noAssignmentsHint')}
          actionLabel={vm.canManage ? t('assignments.addAssignment') : undefined}
          onAction={vm.canManage ? () => setDialog({ open: true, item: null }) : undefined}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          }}
        >
          {vm.assignments.map((assignment) => {
            const color = vm.subjectColorOf(assignment.subjectId)
            const mySubmission = vm.mySubmissionFor(assignment.id)
            const progress =
              assignment.totalStudents === 0
                ? 0
                : Math.round((assignment.submittedCount / assignment.totalStudents) * 100)
            const overdue = daysUntil(assignment.dueDate) < 0

            return (
              <Card key={assignment.id}>
                <Box sx={{ height: 5, bgcolor: color }} />
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                        {assignment.title}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.75 }} flexWrap="wrap" useFlexGap>
                        <Chip
                          size="small"
                          label={vm.subjectNameOf(assignment.subjectId)}
                          sx={{ bgcolor: alpha(color, 0.14), color, fontWeight: 700 }}
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={vm.classNameOf(assignment.classId)}
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={t('assignments.meetingLabel', { meeting: assignment.meeting })}
                        />
                        <Chip
                          size="small"
                          color={overdue ? 'error' : 'default'}
                          icon={<EventRoundedIcon />}
                          label={dueLabel(assignment)}
                        />
                        {!assignment.published ? (
                          <Chip size="small" color="warning" label={t('assignments.draft')} />
                        ) : null}
                      </Stack>
                    </Box>
                    {vm.canManage ? (
                      <Box sx={{ flexShrink: 0 }}>
                        <Tooltip title={t('common.edit')}>
                          <IconButton
                            size="small"
                            onClick={() => setDialog({ open: true, item: assignment })}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setConfirm({ open: true, item: assignment })}
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : null}
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 1.5,
                    }}
                  >
                    {assignment.description}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {t('assignments.dueDate')}: {formatDateTime(assignment.dueDate, locale)}
                  </Typography>

                  {vm.canManage ? (
                    <Box sx={{ mt: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {t('assignments.progressLabel', {
                            submitted: assignment.submittedCount,
                            total: assignment.totalStudents,
                          })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('assignments.gradedLabel', { graded: assignment.gradedCount })}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        startIcon={<FactCheckRoundedIcon />}
                        sx={{ mt: 1.5 }}
                        onClick={() => setReviewing(assignment)}
                      >
                        {t('assignments.reviewSubmissions')}
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 1.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Chip
                          size="small"
                          color={statusColor[mySubmission?.status ?? 'pending']}
                          label={t(statusKey[mySubmission?.status ?? 'pending'])}
                          sx={{ fontWeight: 700 }}
                        />
                        {mySubmission?.status === 'graded' ? (
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {mySubmission.score} / {assignment.maxScore}
                          </Typography>
                        ) : null}
                      </Stack>
                      {mySubmission?.feedback ? (
                        <Typography variant="caption" color="text.secondary">
                          {t('assignments.feedback')}: {mySubmission.feedback}
                        </Typography>
                      ) : null}
                      {vm.isStudent ? (
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          startIcon={<SendRoundedIcon />}
                          sx={{ mt: 1.5 }}
                          onClick={() => setSubmitting(assignment)}
                        >
                          {mySubmission && mySubmission.status !== 'pending'
                            ? t('assignments.resubmit')
                            : t('assignments.submitAssignment')}
                        </Button>
                      ) : null}
                    </Box>
                  )}
                </CardContent>
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
          {dialog.item ? t('assignments.editAssignment') : t('assignments.addAssignment')}
        </DialogTitle>
        <Box
          component="form"
          noValidate
          onSubmit={form.handleSubmit(async (values) => {
            const ok = dialog.item
              ? await vm.updateAssignment(dialog.item.id, values)
              : await vm.createAssignment(values)
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
                    label={t('assignments.assignmentTitle')}
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
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  control={form.control}
                  name="dueDate"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="datetime-local"
                      label={t('assignments.dueDate')}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="maxScore"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      label={t('assignments.maxScore')}
                      fullWidth
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                    />
                  )}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Controller
                  control={form.control}
                  name="meeting"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      label={t('assignments.meeting')}
                      fullWidth
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label={t('assignments.published')}
                    />
                  )}
                />
              </Stack>
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
              <Stack direction="row" spacing={2}>
                <Controller
                  control={form.control}
                  name="allowFileUpload"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label={t('assignments.allowFileUpload')}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="allowTextAnswer"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label={t('assignments.allowTextAnswer')}
                    />
                  )}
                />
              </Stack>
              <Divider />
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {t('assignments.questions')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('assignments.questionsHint')}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => {
                    const current = form.getValues('fields')
                    form.setValue('fields', [...current, createField()], { shouldDirty: true })
                  }}
                >
                  {t('assignments.addField')}
                </Button>
              </Stack>
              {(form.watch('fields') ?? []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('assignments.noFields')}
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {(form.watch('fields') ?? []).map((field, index) => (
                    <Card key={field.id} variant="outlined">
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                          <Chip size="small" label={`${t('assignments.question')} ${index + 1}`} />
                          <Box sx={{ flex: 1 }} />
                          <Tooltip title={t('assignments.moveUp')}>
                            <span>
                              <IconButton
                                size="small"
                                disabled={index === 0}
                                onClick={() => {
                                  const current = [...form.getValues('fields')]
                                  ;[current[index - 1], current[index]] = [current[index], current[index - 1]]
                                  form.setValue('fields', current, { shouldDirty: true })
                                }}
                              >
                                <ArrowUpwardRoundedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={t('assignments.moveDown')}>
                            <span>
                              <IconButton
                                size="small"
                                disabled={index === (form.watch('fields') ?? []).length - 1}
                                onClick={() => {
                                  const current = [...form.getValues('fields')]
                                  ;[current[index + 1], current[index]] = [current[index], current[index + 1]]
                                  form.setValue('fields', current, { shouldDirty: true })
                                }}
                              >
                                <ArrowDownwardRoundedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={t('common.delete')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                const current = form.getValues('fields').filter((item) => item.id !== field.id)
                                form.setValue('fields', current, { shouldDirty: true })
                              }}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        <Stack spacing={1.5}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                            <TextField
                              size="small"
                              label={t('assignments.fieldLabel')}
                              fullWidth
                              value={field.label}
                              onChange={(event) => {
                                const current = form.getValues('fields').map((item) =>
                                  item.id === field.id ? { ...item, label: event.target.value } : item,
                                )
                                form.setValue('fields', current, { shouldDirty: true })
                              }}
                            />
                            <TextField
                              size="small"
                              select
                              label={t('assignments.fieldType')}
                              value={field.type}
                              sx={{ minWidth: 190 }}
                              onChange={(event) => {
                                const type = event.target.value as AssignmentFieldType
                                const current = form.getValues('fields').map((item) =>
                                  item.id === field.id
                                    ? {
                                        ...item,
                                        type,
                                        options:
                                          type === 'multipleChoice' || type === 'checkbox' || type === 'dropdown'
                                            ? item.options.length > 0
                                              ? item.options
                                              : ['']
                                            : [],
                                      }
                                    : item,
                                )
                                form.setValue('fields', current, { shouldDirty: true })
                              }}
                            >
                              {FIELD_TYPES.map((type) => (
                                <MenuItem key={type} value={type}>
                                  {t(`assignments.fieldType_${type}`)}
                                </MenuItem>
                              ))}
                            </TextField>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={field.required}
                                  onChange={(event) => {
                                    const current = form.getValues('fields').map((item) =>
                                      item.id === field.id
                                        ? { ...item, required: event.target.checked }
                                        : item,
                                    )
                                    form.setValue('fields', current, { shouldDirty: true })
                                  }}
                                />
                              }
                              label={t('assignments.required')}
                            />
                          </Stack>
                          {field.type === 'multipleChoice' ||
                          field.type === 'checkbox' ||
                          field.type === 'dropdown' ? (
                            <Stack spacing={1}>
                              {field.options.map((option, optionIndex) => (
                                <Stack key={optionIndex} direction="row" spacing={1} alignItems="center">
                                  <TextField
                                    size="small"
                                    fullWidth
                                    label={`${t('assignments.option')} ${optionIndex + 1}`}
                                    value={option}
                                    onChange={(event) => {
                                      const current = form.getValues('fields').map((item) =>
                                        item.id === field.id
                                          ? {
                                              ...item,
                                              options: item.options.map((value, i) =>
                                                i === optionIndex ? event.target.value : value,
                                              ),
                                            }
                                          : item,
                                      )
                                      form.setValue('fields', current, { shouldDirty: true })
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      const current = form.getValues('fields').map((item) =>
                                        item.id === field.id
                                          ? {
                                              ...item,
                                              options: item.options.filter((_, i) => i !== optionIndex),
                                            }
                                          : item,
                                      )
                                      form.setValue('fields', current, { shouldDirty: true })
                                    }}
                                  >
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              ))}
                              <Button
                                size="small"
                                startIcon={<AddRoundedIcon />}
                                onClick={() => {
                                  const current = form.getValues('fields').map((item) =>
                                    item.id === field.id
                                      ? { ...item, options: [...item.options, ''] }
                                      : item,
                                  )
                                  form.setValue('fields', current, { shouldDirty: true })
                                }}
                              >
                                {t('assignments.addOption')}
                              </Button>
                            </Stack>
                          ) : null}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
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

      <Dialog open={Boolean(reviewing)} onClose={() => setReviewing(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('assignments.submissions')} — {reviewing?.title}
        </DialogTitle>
        <DialogContent dividers>
          {grading ? (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {vm.studentNameOf(grading.studentId)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {formatDateTime(grading.submittedAt, locale)}
              </Typography>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'action.hover', mb: 2 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {grading.textAnswer || t('common.noData')}
                </Typography>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  type="number"
                  label={t('assignments.score')}
                  value={gradeScore}
                  onChange={(event) => setGradeScore(event.target.value)}
                  sx={{ maxWidth: { sm: 160 } }}
                  helperText={`0 - ${reviewing?.maxScore ?? 100}`}
                />
                <TextField
                  label={t('assignments.feedback')}
                  value={gradeFeedback}
                  onChange={(event) => setGradeFeedback(event.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Stack>
              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button color="inherit" onClick={() => setGrading(null)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="contained"
                  disabled={vm.saving || gradeScore === ''}
                  onClick={async () => {
                    const ok = await vm.gradeSubmission(
                      grading.id,
                      Number(gradeScore),
                      gradeFeedback,
                    )
                    if (ok) setGrading(null)
                  }}
                >
                  {t('assignments.gradeSubmission')}
                </Button>
              </Stack>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.student')}</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {t('assignments.submittedAt')}
                  </TableCell>
                  <TableCell align="right">{t('assignments.score')}</TableCell>
                  <TableCell align="right">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviewSubmissions.map((submission) => (
                  <TableRow key={submission.id} hover>
                    <TableCell>{vm.studentNameOf(submission.studentId)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={statusColor[submission.status]}
                        label={t(statusKey[submission.status])}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {submission.submittedAt
                        ? formatDateTime(submission.submittedAt, locale)
                        : t('assignments.notSubmitted')}
                    </TableCell>
                    <TableCell align="right">
                      {submission.score === null ? '-' : submission.score}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        disabled={submission.status === 'pending'}
                        onClick={() => {
                          setGrading(submission)
                          setGradeScore(submission.score === null ? '' : String(submission.score))
                          setGradeFeedback(submission.feedback)
                        }}
                      >
                        {t('assignments.gradeSubmission')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => {
              setGrading(null)
              setReviewing(null)
            }}
          >
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(submitting)} onClose={() => setSubmitting(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>{t('assignments.submitAssignment')}</DialogTitle>
        <Box
          component="form"
          noValidate
          onSubmit={submissionForm.handleSubmit(async (values) => {
            if (!submitting) return
            const ok = await vm.submitAssignment(submitting.id, values, answers)
            if (ok) setSubmitting(null)
          })}
        >
          <DialogContent dividers>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {submitting?.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('assignments.dueDate')}: {formatDateTime(submitting?.dueDate ?? null, locale)}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              {submitting?.fields.map((field, index) => (
                <Box key={field.id}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>
                    {index + 1}. {field.label}
                    {field.required ? ' *' : ''}
                  </Typography>
                  {field.type === 'longAnswer' ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={String(answers[field.id] ?? '')}
                      onChange={(event) =>
                        setAnswers((previous) => ({ ...previous, [field.id]: event.target.value }))
                      }
                    />
                  ) : field.type === 'multipleChoice' || field.type === 'dropdown' ? (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={String(answers[field.id] ?? '')}
                      onChange={(event) =>
                        setAnswers((previous) => ({ ...previous, [field.id]: event.target.value }))
                      }
                    >
                      {field.options.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : field.type === 'checkbox' ? (
                    <Stack>
                      {field.options.map((option) => {
                        const selected = Array.isArray(answers[field.id])
                          ? (answers[field.id] as string[])
                          : []
                        return (
                          <FormControlLabel
                            key={option}
                            control={
                              <Checkbox
                                checked={selected.includes(option)}
                                onChange={(event) =>
                                  setAnswers((previous) => {
                                    const current = Array.isArray(previous[field.id])
                                      ? (previous[field.id] as string[])
                                      : []
                                    return {
                                      ...previous,
                                      [field.id]: event.target.checked
                                        ? [...current, option]
                                        : current.filter((item) => item !== option),
                                    }
                                  })
                                }
                              />
                            }
                            label={option}
                          />
                        )
                      })}
                    </Stack>
                  ) : field.type === 'fileUpload' ? (
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="nama-file.pdf"
                      value={String(answers[field.id] ?? '')}
                      onChange={(event) =>
                        setAnswers((previous) => ({ ...previous, [field.id]: event.target.value }))
                      }
                    />
                  ) : (
                    <TextField
                      fullWidth
                      size="small"
                      type={
                        field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'
                      }
                      InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                      value={String(answers[field.id] ?? '')}
                      onChange={(event) =>
                        setAnswers((previous) => ({ ...previous, [field.id]: event.target.value }))
                      }
                    />
                  )}
                </Box>
              ))}
              {(submitting?.fields.length ?? 0) === 0 ? (
              <Controller
                control={submissionForm.control}
                name="textAnswer"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('assignments.textAnswer')}
                    fullWidth
                    multiline
                    rows={5}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ''}
                  />
                )}
              />
              ) : null}
              {submitting?.allowFileUpload && (submitting?.fields.length ?? 0) === 0 ? (
                <Controller
                  control={submissionForm.control}
                  name="fileName"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={`${t('assignments.uploadFile')} (${t('common.optional')})`}
                      fullWidth
                      placeholder="tugas-matematika.pdf"
                    />
                  )}
                />
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button color="inherit" onClick={() => setSubmitting(null)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={vm.saving}>
              {vm.saving ? t('common.saving') : t('common.submit')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={confirm.open}
        title={t('common.confirm')}
        message={t('assignments.deleteConfirm', { name: confirm.item?.title ?? '' })}
        confirmLabel={t('common.delete')}
        loading={vm.saving}
        onConfirm={async () => {
          if (confirm.item) await vm.deleteAssignment(confirm.item.id)
          setConfirm({ open: false, item: null })
        }}
        onCancel={() => setConfirm({ open: false, item: null })}
      />
    </Box>
  )
}






