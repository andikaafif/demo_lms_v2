import { Box, Chip, MenuItem, Stack, TextField, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded'
import IconButton from '@mui/material/IconButton'
import { useAcademicContext } from '@/hooks/useAcademicContext'

interface AcademicContextBarProps {
  /** Hide the reset button when the module always follows the active context. */
  showReset?: boolean
  compact?: boolean
}

/** Academic year + period selector shared by every periodic module. */
export default function AcademicContextBar({
  showReset = true,
  compact = false,
}: AcademicContextBarProps) {
  const { t } = useTranslation()
  const academic = useAcademicContext()

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      sx={{ mb: compact ? 1.5 : 2.5 }}
    >
      <TextField
        select
        size="small"
        label={t('academic.academicYear')}
        value={academic.academicYearId}
        onChange={(event) => academic.setAcademicYear(event.target.value)}
        sx={{ minWidth: 180 }}
      >
        {academic.years.map((year) => (
          <MenuItem key={year.id} value={year.id}>
            {year.name}
            {year.isActive ? ` · ${t('academic.active')}` : ''}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label={t('academic.period')}
        value={academic.periodId}
        onChange={(event) => academic.setPeriod(event.target.value)}
        sx={{ minWidth: 160 }}
      >
        {academic.periods.map((period) => (
          <MenuItem key={period.id} value={period.id}>
            {period.name}
            {period.isActive ? ` · ${t('academic.active')}` : ''}
          </MenuItem>
        ))}
      </TextField>

      {academic.isActiveContext ? (
        <Chip size="small" color="success" variant="outlined" label={t('academic.activeContext')} />
      ) : (
        <Chip size="small" color="warning" variant="outlined" label={t('academic.historicalContext')} />
      )}

      {showReset && !academic.isActiveContext ? (
        <Tooltip title={t('academic.resetToActive')}>
          <IconButton size="small" onClick={academic.resetToActive} aria-label={t('academic.resetToActive')}>
            <RestoreRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null}

      <Box sx={{ flex: 1 }} />
    </Stack>
  )
}
