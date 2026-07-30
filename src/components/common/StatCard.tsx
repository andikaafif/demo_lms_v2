import type { ReactNode } from 'react'
import { Box, Card, CardContent, Stack, Typography, alpha, useTheme } from '@mui/material'

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  color?: string
  caption?: string
  onClick?: () => void
}

export default function StatCard({ label, value, icon, color, caption, onClick }: StatCardProps) {
  const theme = useTheme()
  const accent = color ?? theme.palette.primary.main

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 14px 28px ${alpha(accent, 0.22)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              color: accent,
              bgcolor: alpha(accent, 0.14),
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {label}
            </Typography>
            {caption ? (
              <Typography variant="caption" sx={{ color: accent, fontWeight: 700 }}>
                {caption}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
