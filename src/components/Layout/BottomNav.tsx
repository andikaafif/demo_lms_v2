import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  BottomNavigation,
  BottomNavigationAction,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  useTheme,
} from '@mui/material'
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { BOTTOM_NAV_LIMIT, navItemsForRole } from './navConfig'

export const BOTTOM_NAV_HEIGHT = 62

export default function BottomNav() {
  const theme = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const role = useAuthStore((state) => state.user?.role) ?? 'student'
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null)

  const items = navItemsForRole(role)
  const primaryItems = items.slice(0, BOTTOM_NAV_LIMIT)
  const overflowItems = items.slice(BOTTOM_NAV_LIMIT)

  const activeIndex = primaryItems.findIndex(
    (item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
  )

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        display: { xs: 'block', md: 'none' },
        borderTop: `1px solid ${theme.palette.divider}`,
        borderRadius: 0,
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation
        showLabels
        value={activeIndex === -1 ? false : activeIndex}
        sx={{ height: BOTTOM_NAV_HEIGHT, bgcolor: 'transparent' }}
      >
        {primaryItems.map((item) => {
          const Icon = item.icon
          return (
            <BottomNavigationAction
              key={item.key}
              label={t(item.labelKey)}
              icon={<Icon />}
              onClick={() => navigate(item.path)}
              sx={{
                minWidth: 0,
                '& .MuiBottomNavigationAction-label': { fontSize: 11, fontWeight: 700 },
              }}
            />
          )
        })}
        {overflowItems.length > 0 ? (
          <BottomNavigationAction
            label={t('common.more')}
            icon={<MoreHorizRoundedIcon />}
            onClick={(event) => setMoreAnchor(event.currentTarget as HTMLElement)}
            sx={{
              minWidth: 0,
              '& .MuiBottomNavigationAction-label': { fontSize: 11, fontWeight: 700 },
            }}
          />
        ) : null}
      </BottomNavigation>

      <Menu
        anchorEl={moreAnchor}
        open={Boolean(moreAnchor)}
        onClose={() => setMoreAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {overflowItems.map((item) => {
          const Icon = item.icon
          return (
            <MenuItem
              key={item.key}
              selected={location.pathname.startsWith(item.path)}
              onClick={() => {
                setMoreAnchor(null)
                navigate(item.path)
              }}
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t(item.labelKey)}</ListItemText>
            </MenuItem>
          )
        })}
      </Menu>
    </Paper>
  )
}
