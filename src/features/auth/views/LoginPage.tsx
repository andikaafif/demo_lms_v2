import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useLocaleStore } from '@/store/localeStore'
import { useThemeStore } from '@/store/themeStore'
import { gradients } from '@/theme'
import { useAuthViewModel } from '../viewmodels/useAuthViewModel'

export default function LoginPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const user = useAuthStore((state) => state.user)
  const toggleLocale = useLocaleStore((state) => state.toggleLocale)
  const locale = useLocaleStore((state) => state.locale)
  const toggleMode = useThemeStore((state) => state.toggleMode)
  const [showPassword, setShowPassword] = useState(false)
  const { form, isLoading, error, demoAccounts, submit, fillDemoAccount } = useAuthViewModel()

  if (user) return <Navigate to="/dashboard" replace />

  const features = [t('auth.feature1'), t('auth.feature2'), t('auth.feature3')]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          p: 6,
          color: '#fff',
          background: gradients.primary,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            bgcolor: alpha('#FFFFFF', 0.08),
            top: -120,
            left: -140,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: alpha('#FFFFFF', 0.07),
            bottom: -110,
            right: -60,
          }}
        />
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ position: 'relative', zIndex: 1, maxWidth: 520 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 5 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha('#FFFFFF', 0.2),
              }}
            >
              <SchoolRoundedIcon sx={{ fontSize: 30 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>
                {t('common.appName')}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {t('common.tagline')}
              </Typography>
            </Box>
          </Stack>

          <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.15, mb: 2 }}>
            {t('auth.heroTitle')}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 4 }}>
            {t('auth.heroSubtitle')}
          </Typography>

          <Stack spacing={1.5}>
            {features.map((feature) => (
              <Stack key={feature} direction="row" spacing={1.5} alignItems="center">
                <CheckCircleRoundedIcon sx={{ opacity: 0.9 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {feature}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 3, sm: 5 },
        }}
      >
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mb: 2 }}>
          <Button
            size="small"
            color="inherit"
            startIcon={<TranslateRoundedIcon />}
            onClick={toggleLocale}
          >
            {locale.toUpperCase()}
          </Button>
          <IconButton
            size="small"
            onClick={() => toggleMode(theme.palette.mode === 'dark')}
            aria-label={t('common.darkMode')}
          >
            {theme.palette.mode === 'dark' ? (
              <LightModeRoundedIcon fontSize="small" />
            ) : (
              <DarkModeRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </Stack>

        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mb: 3, display: { md: 'none' } }}
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                background: gradients.primary,
                color: '#fff',
              }}
            >
              <SchoolRoundedIcon />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {t('common.appName')}
            </Typography>
          </Stack>

          <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
            {t('auth.loginTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('auth.loginSubtitle')}
          </Typography>

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error === 'invalidCredentials' ? t('auth.invalidCredentials') : t('errors.generic')}
            </Alert>
          ) : null}

          <Box component="form" onSubmit={form.handleSubmit(submit)} noValidate>
            <Stack spacing={2.2}>
              <Controller
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('auth.username')}
                    autoComplete="username"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ' '}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonRoundedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('auth.password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error ? t(fieldState.error.message ?? '') : ' '}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockRoundedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((value) => !value)}
                            edge="end"
                            size="small"
                            aria-label={t('auth.password')}
                          >
                            {showPassword ? (
                              <VisibilityOffRoundedIcon fontSize="small" />
                            ) : (
                              <VisibilityRoundedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ py: 1.4, fontSize: '1rem' }}
              >
                {isLoading ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {t('auth.demoAccounts')}
            </Typography>
          </Divider>

          <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary">
                {t('auth.demoHint')}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                {demoAccounts.map((account) => (
                  <Chip
                    key={account.username}
                    label={`${t(`roles.${account.role}`)} · ${account.username}`}
                    onClick={() =>
                      fillDemoAccount({
                        username: account.username,
                        password: account.password,
                      })
                    }
                    sx={{ fontWeight: 700 }}
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}
