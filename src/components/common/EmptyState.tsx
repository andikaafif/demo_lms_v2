import type { ReactNode } from 'react'
import { Box, Button, Stack, Typography, alpha, useTheme } from '@mui/material'
import InboxRoundedIcon from '@mui/icons-material/InboxRounded'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme()

  return (
    <Stack
      spacing={1.5}
      alignItems="center"
      sx={{
        py: { xs: 6, md: 8 },
        px: 3,
        textAlign: 'center',
        borderRadius: 4,
        border: `1px dashed ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.03 : 0.06),
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          color: 'primary.main',
        }}
      >
        {icon ?? <InboxRoundedIcon sx={{ fontSize: 36 }} />}
      </Box>
      <Typography variant="h6">{title}</Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  )
}
