import { Box, Button, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import { gradients } from '@/theme'

export default function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Stack
      component={motion.div}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '70vh', textAlign: 'center', px: 3 }}
    >
      <Box
        sx={{
          fontSize: { xs: 96, md: 140 },
          fontWeight: 900,
          lineHeight: 1,
          background: gradients.primary,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        404
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        {t('notFound.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
        {t('notFound.message')}
      </Typography>
      <Button
        variant="contained"
        size="large"
        startIcon={<HomeRoundedIcon />}
        onClick={() => navigate('/dashboard')}
      >
        {t('notFound.backHome')}
      </Button>
    </Stack>
  )
}
