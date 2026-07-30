import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import AppBar from './AppBar'
import BottomNav, { BOTTOM_NAV_HEIGHT } from './BottomNav'
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED } from './Sidebar'
import { findNavItem } from './navConfig'
import { resolveMode, useThemeStore } from '@/store/themeStore'
import PageTransition from '@/components/common/PageTransition'

export default function MainLayout() {
  const theme = useTheme()
  const { t } = useTranslation()
  const location = useLocation()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  const preference = useThemeStore((state) => state.preference)
  const toggleMode = useThemeStore((state) => state.toggleMode)
  const isDark = resolveMode(preference, systemPrefersDark) === 'dark'

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const navItem = findNavItem(location.pathname)
  const pageTitle = navItem ? t(navItem.labelKey) : t('common.appName')

  const handleToggleSidebar = () => {
    if (isDesktop) setSidebarOpen((previous) => !previous)
    else setMobileOpen((previous) => !previous)
  }

  const sidebarWidth = sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_COLLAPSED

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        title={pageTitle}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        isDark={isDark}
        onToggleTheme={() => toggleMode(systemPrefersDark)}
      />
      <Sidebar
        open={sidebarOpen}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { md: `calc(100% - ${sidebarWidth}px)` },
          transition: theme.transitions.create('width', { duration: 220 }),
          pb: { xs: `${BOTTOM_NAV_HEIGHT + 16}px`, md: 4 },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 60, md: 68 } }} />
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </Box>
      </Box>
      <BottomNav />
    </Box>
  )
}
