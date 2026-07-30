import { create } from 'zustand'
import type { AlertColor } from '@mui/material'

interface SnackbarState {
  open: boolean
  message: string
  severity: AlertColor
  notify: (message: string, severity?: AlertColor) => void
  close: () => void
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  open: false,
  message: '',
  severity: 'success',
  notify: (message, severity = 'success') => set({ open: true, message, severity }),
  close: () => set({ open: false }),
}))
