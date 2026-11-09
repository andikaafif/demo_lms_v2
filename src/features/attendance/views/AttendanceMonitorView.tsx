import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import { formatDate } from '@/lib/format'
import { statusColors } from '@/theme'
import { useLocaleStore } from '@/store/localeStore'
import type { AttendanceStatus } from '../models/types'
import { useAttendanceMonitorViewModel } from '../viewmodels/useAttendanceMonitorViewModel'

const STATUSES: AttendanceStatus[] = ['present', 'sick', 'permission', 'absent']

export default function AttendanceMonitorView() {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)
  const vm = useAttendanceMonitorViewModel()
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <Box>
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
            <TextField
              size="small"
              type="date"
              label={t('common.date')}
              value={vm.date}
              onChange={(event) => vm.setDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 170 }}
            />
            <TextField
              size="small"
              select
              label={t('common.class')}
              value={vm.classFilter}
              onChange={(event) => vm.setClassFilter(event.target.value)}
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              {vm.classes.map((item) => (
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
              sx={{ minWidth: 190 }}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              {vm.subjects.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label={t('common.search')}
              value={vm.search}
              onChange={(event) => vm.setSearch(event.target.value)}
              sx={{ minWidth: 200, flex: 1 }}
            />
            <Button
              size="small"
              variant="outlined"
              startIcon={<RestartAltRoundedIcon />}
              onClick={vm.resetFilters}
            >
              {t('common.reset')}
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadRoundedIcon />}
              onClick={vm.exportCsv}
              disabled={vm.rows.length === 0}
            >
              {t('attendance.exportCsv')}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
            {t('attendance.monitorTitle')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('attendance.monitorHint')}
          </Typography>

          {vm.rows.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('attendance.noSessionsToday')}
            </Alert>
          ) : (
            <Box sx={{ overflowX: 'auto', mt: 1.5 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.class')}</TableCell>
                    <TableCell>{t('common.subject')}</TableCell>
                    <TableCell>{t('attendance.teacher')}</TableCell>
                    <TableCell>{t('attendance.schedule')}</TableCell>
                    <TableCell>{t('attendance.submitStatus')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vm.rows.map((row) => (
                    <TableRow key={row.sessionId} hover>
                      <TableCell>{row.className}</TableCell>
                      <TableCell>{row.subjectName}</TableCell>
                      <TableCell>{row.teacherName}</TableCell>
                      <TableCell>
                        {row.startTime} - {row.endTime}
                        <Typography variant="caption" color="text.secondary" display="block">
                          {t('schedule.meeting', { meeting: row.meeting })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={row.submitted ? 'success' : 'warning'}
                          label={
                            row.submitted
                              ? t('attendance.submitted')
                              : t('attendance.notSubmitted')
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          startIcon={<VisibilityRoundedIcon />}
                          onClick={async () => {
                            await vm.openDetail(row.sessionId)
                            setDetailOpen(true)
                          }}
                        >
                          {t('common.view')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false)
          vm.closeDetail()
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('attendance.detailTitle')}
          {vm.detail ? ` · ${formatDate(vm.detail.date, locale)}` : ''}
        </DialogTitle>
        <DialogContent dividers>
          {vm.detailLoading || !vm.detail ? (
            <Typography variant="body2">{t('common.loading')}</Typography>
          ) : (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip size="small" label={vm.subjectNameOf(vm.detail.subjectId)} />
                <Chip
                  size="small"
                  color={vm.detail.submitted ? 'success' : 'warning'}
                  label={
                    vm.detail.submitted ? t('attendance.submitted') : t('attendance.notSubmitted')
                  }
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${vm.detail.startTime} - ${vm.detail.endTime}`}
                />
              </Stack>

              {!vm.detail.canOverride ? (
                <Alert severity="info">{t('attendance.overrideLocked')}</Alert>
              ) : (
                <Alert severity="warning">{t('attendance.overrideUnlocked')}</Alert>
              )}

              <Stack spacing={1.25}>
                {vm.detail.entries.map((entry) => (
                  <Stack
                    key={entry.studentId}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    alignItems={{ sm: 'center' }}
                    sx={{ p: 1.25, borderRadius: 2, bgcolor: 'action.hover' }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>
                      {vm.studentNameOf(entry.studentId)}
                    </Typography>
                    <ToggleButtonGroup
                      exclusive
                      size="small"
                      disabled={!vm.detail?.canOverride}
                      value={vm.overrideEntries[entry.studentId]?.status ?? entry.status}
                      onChange={(_, value: AttendanceStatus | null) => {
                        if (value) vm.setOverrideStatus(entry.studentId, value)
                      }}
                    >
                      {STATUSES.map((status) => (
                        <ToggleButton
                          key={status}
                          value={status}
                          sx={{
                            px: 1.25,
                            fontWeight: 700,
                            '&.Mui-selected': {
                              bgcolor: alpha(statusColors[status], 0.18),
                              color: statusColors[status],
                            },
                          }}
                        >
                          {t(`attendance.${status}`)}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Stack>
                ))}
              </Stack>

              {vm.detail.audit.length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    {t('attendance.auditTrail')}
                  </Typography>
                  <Stack spacing={0.75}>
                    {vm.detail.audit.map((audit) => (
                      <Typography key={audit.id} variant="caption" color="text.secondary">
                        {vm.studentNameOf(audit.studentId)}: {t(`attendance.${audit.oldStatus}`)} →{' '}
                        {t(`attendance.${audit.newStatus}`)} · {audit.reason} · {audit.updatedByName}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              ) : null}

              <TextField
                label={t('attendance.overrideReason')}
                fullWidth
                multiline
                rows={2}
                value={vm.overrideReason}
                onChange={(event) => vm.setOverrideReason(event.target.value)}
                disabled={!vm.detail.canOverride}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => {
              setDetailOpen(false)
              vm.closeDetail()
            }}
          >
            {t('common.close')}
          </Button>
          <Button
            variant="contained"
            disabled={!vm.detail?.canOverride || vm.saving}
            onClick={() => void vm.saveOverride()}
          >
            {vm.saving ? t('common.saving') : t('attendance.saveOverride')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
