import type { ReactNode } from 'react'
import { Box, Stack, Typography, alpha } from '@mui/material'
import { motion } from 'framer-motion'
import { gradients, type GradientKey } from '@/theme'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  gradient?: GradientKey
  action?: ReactNode
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  gradient = 'primary',
  action,
}: PageHeaderProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        px: { xs: 2.5, md: 4 },
        py: { xs: 3, md: 3.5 },
        mb: 3,
        color: '#fff',
        background: gradients[gradient],
        boxShadow: '0 12px 30px rgba(63, 81, 181, 0.22)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: -60,
          top: -70,
          width: 220,
          height: 220,
          borderRadius: '50%',
          bgcolor: alpha('#FFFFFF', 0.12),
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: 70,
          bottom: -90,
          width: 170,
          height: 170,
          borderRadius: '50%',
          bgcolor: alpha('#FFFFFF', 0.08),
        }}
      />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {icon ? (
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha('#FFFFFF', 0.2),
                backdropFilter: 'blur(6px)',
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          ) : null}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.5, maxWidth: 620 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        </Stack>
        {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
      </Stack>
    </Box>
  )
}
