import { useState } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import GradingRoundedIcon from '@mui/icons-material/GradingRounded'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'
import EqualizerRoundedIcon from '@mui/icons-material/EqualizerRounded'
import PageHeader from '@/components/common/PageHeader'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import StatCard from '@/components/common/StatCard'
import { useRoleScope } from '@/hooks/useRoleScope'
import AcademicContextBar from '@/components/common/AcademicContextBar'
import { useGradebookViewModel } from '../viewmodels/useGradebookViewModel'
import GradeRecapView from './GradeRecapView'
import AttitudeGradeView from './AttitudeGradeView'

function scoreColor(score: number | null, max: number): string {
  if (score === null) return 'text.disabled'
  const ratio = score / max
  if (ratio >= 0.85) return '#2E7D32'
  if (ratio >= 0.7) return '#1976D2'
  if (ratio >= 0.6) return '#F9A825'
  return '#D32F2F'
}

export default function GradebookPage() {
  const scope = useRoleScope()
  const { t } = useTranslation()
  const theme = useTheme()
  const vm = useGradebookViewModel()

  const [noteDialog, setNoteDialog] = useState<{ open: boolean; studentId: string; name: string }>({
    open: false,
    studentId: '',
    name: '',
  })
  const [noteValue, setNoteValue] = useState('')
  const [tab, setTab] = useState(0)

  const columns = vm.gradebook?.rows[0]?.items ?? []

  return (
    <Box>
      <PageHeader
        title={
          vm.isReadOnly
            ? scope.isParent
              ? t('gradebook.childGrades')
              : t('gradebook.myGrades')
            : t('gradebook.title')
        }
        subtitle={t('gradebook.subtitle')}
        gradient="ocean"
        icon={<GradingRoundedIcon sx={{ fontSize: 30 }} />}
      />

      <AcademicContextBar />

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label={t('gradebook.tabAssignments')} />
        <Tab label={t('gradebook.tabRecap')} />
        <Tab label={t('gradebook.tabAttitude')} />
      </Tabs>

      <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              size="small"
              select
              label={t('gradebook.selectClass')}
              value={vm.classId}
              onChange={(event) => vm.setClassId(event.target.value)}
              fullWidth
              disabled={vm.isReadOnly}
            >
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
              value={vm.subjectId}
              onChange={(event) => vm.setSubjectId(event.target.value)}
              fullWidth
            >
              <MenuItem value="">{t('gradebook.allSubjects')}</MenuItem>
              {vm.availableSubjects.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: vm.isReadOnly ? '1fr' : 'repeat(3, 1fr)',
          },
          mb: 2.5,
        }}
      >
        <StatCard
          label={vm.isReadOnly ? t('dashboard.myAverage') : t('gradebook.classAverage')}
          value={vm.gradebook?.classAverage ?? '-'}
          icon={<EqualizerRoundedIcon />}
          color={theme.palette.primary.main}
        />
        {vm.isReadOnly ? null : (
          <>
            <StatCard
              label={t('gradebook.highest')}
              value={vm.stats.highest ?? '-'}
              icon={<TrendingUpRoundedIcon />}
              color="#2E7D32"
            />
            <StatCard
              label={t('gradebook.lowest')}
              value={vm.stats.lowest ?? '-'}
              icon={<TrendingDownRoundedIcon />}
              color="#D32F2F"
            />
          </>
        )}
      </Box>

      {vm.loading ? (
        <LoadingSkeleton variant="table" count={8} />
      ) : !vm.gradebook || vm.gradebook.rows.length === 0 || columns.length === 0 ? (
        <EmptyState title={t('gradebook.noGrades')} description={t('gradebook.noGradesHint')} />
      ) : (
        <Card>
          <TableContainer sx={{ maxHeight: 620 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 180, position: 'sticky', left: 0, zIndex: 3, bgcolor: 'background.paper' }}>
                    {t('gradebook.studentName')}
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.assignmentId} align="center" sx={{ minWidth: 120 }}>
                      <Tooltip title={column.assignmentTitle}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            display: 'block',
                            maxWidth: 130,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {column.assignmentTitle}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  ))}
                  <TableCell align="center">{t('common.average')}</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>{t('gradebook.teacherNote')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vm.gradebook.rows.map((row) => (
                  <TableRow key={row.studentId} hover>
                    <TableCell sx={{ position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {row.studentName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.nis}
                      </Typography>
                    </TableCell>
                    {row.items.map((item) => (
                      <TableCell key={item.assignmentId} align="center">
                        {item.score === null ? (
                          <Typography variant="caption" color="text.disabled">
                            -
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 800, color: scoreColor(item.score, item.maxScore) }}
                          >
                            {item.score}
                          </Typography>
                        )}
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={row.average ?? '-'}
                        sx={{
                          fontWeight: 800,
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: 'primary.main',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                          {row.teacherNote || '-'}
                        </Typography>
                        {vm.canEditNotes ? (
                          <Tooltip title={t('gradebook.editNote')}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setNoteValue(row.teacherNote)
                                setNoteDialog({
                                  open: true,
                                  studentId: row.studentId,
                                  name: row.studentName,
                                })
                              }}
                            >
                              <EditNoteRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {vm.isReadOnly ? t('gradebook.readOnly') : t('gradebook.exportHint')}
            </Typography>
          </Box>
        </Card>
      )}
      </Box>

      {tab === 1 ? <GradeRecapView classId={vm.classId} /> : null}
      {tab === 2 ? <AttitudeGradeView classId={vm.classId} /> : null}

      <Dialog
        open={noteDialog.open}
        onClose={() => setNoteDialog({ open: false, studentId: '', name: '' })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('gradebook.teacherNote')} — {noteDialog.name}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            value={noteValue}
            onChange={(event) => setNoteValue(event.target.value)}
            label={t('common.note')}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setNoteDialog({ open: false, studentId: '', name: '' })}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={vm.saving}
            onClick={async () => {
              const ok = await vm.saveNote(noteDialog.studentId, noteValue)
              if (ok) setNoteDialog({ open: false, studentId: '', name: '' })
            }}
          >
            {vm.saving ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
