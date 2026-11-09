import { useState } from 'react'
import {
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
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import EmptyState from '@/components/common/EmptyState'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import type { AttitudeGrade } from '../models/types'
import { useGradebookViewModel } from '../viewmodels/useGradebookViewModel'

const GRADES: AttitudeGrade[] = ['A', 'B', 'C', 'D']

const gradeColor: Record<AttitudeGrade, 'success' | 'info' | 'warning' | 'error'> = {
  A: 'success',
  B: 'info',
  C: 'warning',
  D: 'error',
}

export default function AttitudeGradeView({ classId }: { classId: string }) {
  const { t } = useTranslation()
  const vm = useGradebookViewModel({ classId })
  const [dialog, setDialog] = useState<{ open: boolean; studentId: string; name: string }>({
    open: false,
    studentId: '',
    name: '',
  })
  const [grade, setGrade] = useState<AttitudeGrade>('B')
  const [note, setNote] = useState('')

  if (vm.loading) return <LoadingSkeleton variant="table" count={8} />
  if (!vm.attitude || vm.attitude.rows.length === 0) {
    return <EmptyState title={t('gradebook.noAttitude')} description={t('gradebook.noAttitudeHint')} />
  }

  return (
    <Card>
      <CardContent sx={{ p: 2.5, pb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          {t('gradebook.attitudeTitle')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('gradebook.attitudeHint')}
        </Typography>
      </CardContent>
      <TableContainer sx={{ maxHeight: 620 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>{t('gradebook.studentName')}</TableCell>
              <TableCell align="center">{t('gradebook.attitudeGrade')}</TableCell>
              <TableCell>{t('common.note')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vm.attitude.rows.map((row) => (
              <TableRow key={row.studentId} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {row.studentName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.nis}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip size="small" color={gradeColor[row.grade]} label={row.grade} />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {row.note || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {vm.canEditAttitude ? (
                    <Tooltip title={t('common.edit')}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setGrade(row.grade)
                          setNote(row.note)
                          setDialog({ open: true, studentId: row.studentId, name: row.studentName })
                        }}
                      >
                        <EditNoteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, studentId: '', name: '' })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('gradebook.attitudeGrade')} — {dialog.name}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              select
              label={t('gradebook.attitudeGrade')}
              value={grade}
              onChange={(event) => setGrade(event.target.value as AttitudeGrade)}
            >
              {GRADES.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={t('common.note')}
              multiline
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setDialog({ open: false, studentId: '', name: '' })}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={vm.saving}
            onClick={async () => {
              const ok = await vm.saveAttitude(dialog.studentId, grade, note)
              if (ok) setDialog({ open: false, studentId: '', name: '' })
            }}
          >
            {vm.saving ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}
