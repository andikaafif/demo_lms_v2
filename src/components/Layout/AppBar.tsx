import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  AppBar as MuiAppBar,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useLocaleStore } from '@/store/localeStore'
import { useSnackbarStore } from '@/store/snackbarStore'
import { getInitials } from '@/lib/format'
import type { AppLocale } from '@/i18n/config'

interface AppBarProps {
  title: string
  sidebarOpen: boolean
  onToggleSidebar: () => void
  isDark: boolean
  onToggleTheme: () => void
}

export default function AppBar({
  title,
  sidebarOpen,
  onToggleSidebar,
  isDark,
  onToggleTheme,
}: AppBarProps) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const navigate = useNavigate()
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)
  const notify = useSnackbarStore((state) => state.notify)

  const [userMenu, setUserMenu] = useState<null | HTMLElement>(null)
  const [langMenu, setLangMenu] = useState<null | HTMLElement>(null)

  const initials = useMemo(() => getInitials(user?.name ?? 'EduLite'), [user?.name])

  const handleLogout = () => {
    setUserMenu(null)
    logout()
    notify(t('auth.logoutSuccess'), 'info')
    navigate('/login', { replace: true })
  }

  const handleSelectLocale = (next: AppLocale) => {
    setLocale(next)
    setLangMenu(null)
  }

  return (
    <MuiAppBar
      position="fixed"
      elevation={0}
      color="inherit"
      sx={{
        zIndex: (t2) => t2.zIndex.drawer + 1,
        backdropFilter: 'blur(10px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.88),
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: { xs: 60, md: 68 } }}>
        <IconButton
          onClick={onToggleSidebar}
          edge="start"
          aria-label={t('common.menu')}
          sx={{ color: 'text.primary' }}
        >
          {sidebarOpen && isDesktop ? <MenuOpenRoundedIcon /> : <MenuRoundedIcon />}
        </IconButton>

        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
          <Box
            component="img"
            src="/icons/icon-192x192.svg"
            alt={t('common.appName')}
            sx={{ width: 36, height: 36, borderRadius: 2, display: { xs: 'none', sm: 'block' } }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {t('common.appName')} · {t('common.tagline')}
            </Typography>
          </Box>
        </Stack>

        <Tooltip title={t('common.language')}>
          <IconButton onClick={(event) => setLangMenu(event.currentTarget)} sx={{ color: 'text.primary' }}>
            <TranslateRoundedIcon />
          </IconButton>
        </Tooltip>
        <Menu anchorEl={langMenu} open={Boolean(langMenu)} onClose={() => setLangMenu(null)}>
          <MenuItem selected={locale === 'id'} onClick={() => handleSelectLocale('id')}>
            🇮🇩&nbsp;&nbsp;Bahasa Indonesia
          </MenuItem>
          <MenuItem selected={locale === 'en'} onClick={() => handleSelectLocale('en')}>
            🇬🇧&nbsp;&nbsp;English
          </MenuItem>
        </Menu>

        <Tooltip title={isDark ? t('common.lightMode') : t('common.darkMode')}>
          <IconButton onClick={onToggleTheme} sx={{ color: 'text.primary' }}>
            {isDark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title={user?.name ?? ''}>
          <IconButton onClick={(event) => setUserMenu(event.currentTarget)} sx={{ ml: 0.5 }}>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                fontSize: 15,
                fontWeight: 800,
                bgcolor: user?.avatarColor ?? theme.palette.primary.main,
              }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={userMenu}
          open={Boolean(userMenu)}
          onClose={() => setUserMenu(null)}
          slotProps={{ paper: { sx: { minWidth: 250, mt: 1 } } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap component="div">
              {user?.email}
            </Typography>
            <Chip
              size="small"
              label={t(`roles.${user?.role ?? 'student'}`)}
              color="primary"
              sx={{ mt: 1 }}
            />
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setUserMenu(null)
              navigate('/school-profile')
            }}
          >
            <ListItemIcon>
              <PersonRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('nav.schoolProfile')}</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>{t('common.logout')}</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </MuiAppBar>
  )
}
