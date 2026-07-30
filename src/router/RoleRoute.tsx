import { Navigate, Outlet } from 'react-router-dom'
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import LockPersonRoundedIcon from '@mui/icons-material/LockPersonRounded'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { UserRole } from '@/features/auth/models/types'
import { useAuthStore } from '@/store/authStore'

interface RoleRouteProps {
  allowed: UserRole[]
}

export default function RoleRoute({ allowed }: RoleRouteProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  if (!user) return <Navigate to="/login" replace />

  if (!allowed.includes(user.role)) {
    return (
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'warning.main',
                color: '#fff',
              }}
            >
              <LockPersonRoundedIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h5">{t('errors.unauthorized')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('roles.' + user.role)}
            </Typography>
            <Button variant="contained" onClick={() => navigate('/dashboard', { replace: true })}>
              {t('notFound.backHome')}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return <Outlet />
}
