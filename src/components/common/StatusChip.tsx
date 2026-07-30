import { Chip, type ChipProps } from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import SickRoundedIcon from '@mui/icons-material/SickRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import { useTranslation } from 'react-i18next'
import type { AttendanceStatus } from '@/features/attendance/models/types'
import { statusColors } from '@/theme'

interface StatusChipProps extends Omit<ChipProps, 'color' | 'label'> {
  status: AttendanceStatus
  showIcon?: boolean
}

const iconByStatus = {
  present: <CheckCircleRoundedIcon fontSize="small" />,
  sick: <SickRoundedIcon fontSize="small" />,
  permission: <EventAvailableRoundedIcon fontSize="small" />,
  absent: <CancelRoundedIcon fontSize="small" />,
}

export default function StatusChip({ status, showIcon = true, ...rest }: StatusChipProps) {
  const { t } = useTranslation()

  return (
    <Chip
      size="small"
      icon={showIcon ? iconByStatus[status] : undefined}
      label={t(`attendance.${status}`)}
      {...rest}
      sx={{
        bgcolor: `${statusColors[status]}1F`,
        color: statusColors[status],
        borderColor: statusColors[status],
        '& .MuiChip-icon': { color: statusColors[status] },
        ...rest.sx,
      }}
    />
  )
}
