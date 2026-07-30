import { alpha, createTheme, type Theme } from '@mui/material/styles'
import type { PaletteMode } from '@mui/material'

export const BRAND = {
  primary: '#3F51B5',
  primaryDark: '#303F9F',
  primaryLight: '#7986CB',
  secondary: '#FFC107',
  secondaryDark: '#FFA000',
  backgroundLight: '#F5F7FA',
  backgroundDark: '#121212',
} as const

export const gradients = {
  primary: 'linear-gradient(135deg, #3F51B5 0%, #5C6BC0 50%, #7986CB 100%)',
  secondary: 'linear-gradient(135deg, #FFA000 0%, #FFC107 60%, #FFD54F 100%)',
  teal: 'linear-gradient(135deg, #00695C 0%, #009688 60%, #4DB6AC 100%)',
  rose: 'linear-gradient(135deg, #AD1457 0%, #E91E63 60%, #F06292 100%)',
  violet: 'linear-gradient(135deg, #4527A0 0%, #673AB7 60%, #9575CD 100%)',
  ocean: 'linear-gradient(135deg, #0D47A1 0%, #1976D2 60%, #64B5F6 100%)',
  forest: 'linear-gradient(135deg, #1B5E20 0%, #388E3C 60%, #81C784 100%)',
  sunset: 'linear-gradient(135deg, #BF360C 0%, #F4511E 60%, #FF8A65 100%)',
} as const

export type GradientKey = keyof typeof gradients

export const statusColors = {
  present: '#2E7D32',
  sick: '#F9A825',
  permission: '#1976D2',
  absent: '#D32F2F',
} as const

export function createAppTheme(mode: PaletteMode): Theme {
  const isLight = mode === 'light'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: BRAND.primary,
        dark: BRAND.primaryDark,
        light: BRAND.primaryLight,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: BRAND.secondary,
        dark: BRAND.secondaryDark,
        light: '#FFD54F',
        contrastText: '#1A237E',
      },
      success: { main: statusColors.present },
      warning: { main: statusColors.sick },
      info: { main: statusColors.permission },
      error: { main: statusColors.absent },
      background: {
        default: isLight ? BRAND.backgroundLight : BRAND.backgroundDark,
        paper: isLight ? '#FFFFFF' : '#1E1E1E',
      },
      text: {
        primary: isLight ? '#1A1F36' : '#ECEFF1',
        secondary: isLight ? '#5A6478' : '#B0BEC5',
      },
      divider: isLight ? '#E3E8EF' : 'rgba(255,255,255,0.12)',
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: "'Nunito', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      h1: { fontWeight: 800, fontSize: '2.25rem', letterSpacing: '-0.5px' },
      h2: { fontWeight: 800, fontSize: '1.875rem', letterSpacing: '-0.4px' },
      h3: { fontWeight: 700, fontSize: '1.5rem' },
      h4: { fontWeight: 700, fontSize: '1.3rem' },
      h5: { fontWeight: 700, fontSize: '1.125rem' },
      h6: { fontWeight: 700, fontSize: '1rem' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 700, textTransform: 'none' },
      body2: { lineHeight: 1.65 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: isLight ? '#C7D0DD' : '#3A3A3A',
            borderRadius: 8,
          },
          body: { transition: 'background-color .3s ease' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: { borderRadius: 16 },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${isLight ? '#E3E8EF' : 'rgba(255,255,255,0.10)'}`,
            boxShadow: isLight
              ? '0 2px 10px rgba(17, 24, 39, 0.05)'
              : '0 2px 10px rgba(0, 0, 0, 0.45)',
            transition: 'transform .22s ease, box-shadow .22s ease',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 12, paddingInline: 18, paddingBlock: 9 },
          containedPrimary: {
            '&:hover': { backgroundColor: BRAND.primaryDark },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 700 },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 700, minHeight: 48 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 800,
            backgroundColor: isLight ? alpha(BRAND.primary, 0.06) : 'rgba(255,255,255,0.04)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            '&.Mui-selected': {
              backgroundColor: alpha(BRAND.primary, isLight ? 0.12 : 0.24),
              '&:hover': { backgroundColor: alpha(BRAND.primary, isLight ? 0.18 : 0.3) },
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: 8, fontSize: '0.75rem', fontWeight: 600 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 18 },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12, fontWeight: 600 },
        },
      },
    },
  })
}
