import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PaletteMode } from '@mui/material'

type ThemePreference = PaletteMode | 'system'

interface ThemeState {
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
  toggleMode: (systemPrefersDark: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
      toggleMode: (systemPrefersDark) => {
        const current = get().preference
        const resolved = current === 'system' ? (systemPrefersDark ? 'dark' : 'light') : current
        set({ preference: resolved === 'dark' ? 'light' : 'dark' })
      },
    }),
    { name: 'edulite-theme' },
  ),
)

export const resolveMode = (
  preference: ThemePreference,
  systemPrefersDark: boolean,
): PaletteMode => {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light'
  return preference
}
