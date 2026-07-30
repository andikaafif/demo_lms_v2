import { useEffect, useMemo } from 'react'
import { Alert, CssBaseline, Snackbar, ThemeProvider, useMediaQuery } from '@mui/material'
import { RouterProvider } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { router } from '@/router'
import { createAppTheme } from '@/theme'
import { resolveMode, useThemeStore } from '@/store/themeStore'
import { useLocaleStore } from '@/store/localeStore'
import { useSnackbarStore } from '@/store/snackbarStore'

export default function App() {
  const { i18n } = useTranslation()
  const preference = useThemeStore((state) => state.preference)
  const locale = useLocaleStore((state) => state.locale)
  const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  const mode = resolveMode(preference, systemPrefersDark)
  const theme = useMemo(() => createAppTheme(mode), [mode])

  const snackbarOpen = useSnackbarStore((state) => state.open)
  const snackbarMessage = useSnackbarStore((state) => state.message)
  const snackbarSeverity = useSnackbarStore((state) => state.severity)
  const closeSnackbar = useSnackbarStore((state) => state.close)

  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale)
    }
    document.documentElement.lang = locale
  }, [i18n, locale])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme.palette.primary.main)
  }, [mode, theme.palette.primary.main])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3500}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}
