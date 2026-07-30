import { NavLink, useLocation } from 'react-router-dom'
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { navItemsForRole, type NavItem } from './navConfig'

export const SIDEBAR_WIDTH = 268
export const SIDEBAR_WIDTH_COLLAPSED = 76

interface SidebarProps {
  open: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}

const SECTION_LABELS: Record<NavItem['section'], string> = {
  main: 'nav.sectionMain',
  academic: 'nav.sectionAcademic',
  management: 'nav.sectionManagement',
}

export default function Sidebar({ open, mobileOpen, onCloseMobile }: SidebarProps) {
  const theme = useTheme()
  const { t } = useTranslation()
  const location = useLocation()
  const role = useAuthStore((state) => state.user?.role) ?? 'student'
  const items = navItemsForRole(role)

  const sections: NavItem['section'][] = ['main', 'academic', 'management']

  const renderList = (collapsed: boolean) => (
    <Box sx={{ px: collapsed ? 1 : 1.5, py: 2, overflowX: 'hidden' }}>
      {sections.map((section) => {
        const sectionItems = items.filter((item) => item.section === section)
        if (sectionItems.length === 0) return null
        return (
          <Box key={section} sx={{ mb: 1.5 }}>
            {!collapsed ? (
              <Typography
                variant="overline"
                sx={{
                  px: 1.5,
                  color: 'text.secondary',
                  fontWeight: 800,
                  letterSpacing: 1,
                  fontSize: 11,
                }}
              >
                {t(SECTION_LABELS[section])}
              </Typography>
            ) : (
              <Divider sx={{ my: 1.5 }} />
            )}
            <List disablePadding sx={{ mt: collapsed ? 0 : 0.5 }}>
              {sectionItems.map((item) => {
                const Icon = item.icon
                const selected =
                  location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                return (
                  <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
                    <Tooltip title={collapsed ? t(item.labelKey) : ''} placement="right">
                      <ListItemButton
                        component={NavLink}
                        to={item.path}
                        selected={selected}
                        onClick={onCloseMobile}
                        sx={{
                          minHeight: 46,
                          px: collapsed ? 1.5 : 2,
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          color: selected ? 'primary.main' : 'text.primary',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: collapsed ? 0 : 40,
                            color: selected ? 'primary.main' : 'text.secondary',
                          }}
                        >
                          <Icon />
                        </ListItemIcon>
                        {!collapsed ? (
                          <ListItemText
                            primary={t(item.labelKey)}
                            primaryTypographyProps={{
                              fontWeight: selected ? 800 : 600,
                              fontSize: 14.5,
                              noWrap: true,
                            }}
                          />
                        ) : null}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                )
              })}
            </List>
          </Box>
        )
      })}
    </Box>
  )

  const brandFooter = (collapsed: boolean) =>
    collapsed ? null : (
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Stack
          spacing={0.5}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {t('common.appName')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('common.tagline')} · v1.0.0
          </Typography>
        </Stack>
      </Box>
    )

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_COLLAPSED,
          flexShrink: 0,
          transition: theme.transitions.create('width', { duration: 220 }),
          '& .MuiDrawer-paper': {
            width: open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_COLLAPSED,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundImage: 'none',
            overflowX: 'hidden',
            transition: theme.transitions.create('width', { duration: 220 }),
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 60, md: 68 } }} />
        {renderList(!open)}
        {brandFooter(!open)}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            backgroundImage: 'none',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Toolbar sx={{ minHeight: 60 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              component="img"
              src="/icons/icon-192x192.svg"
              alt={t('common.appName')}
              sx={{ width: 34, height: 34, borderRadius: 2 }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                {t('common.appName')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('common.tagline')}
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
        <Divider />
        {renderList(false)}
        {brandFooter(false)}
      </Drawer>
    </>
  )
}
