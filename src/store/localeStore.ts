import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n, { type AppLocale } from '@/i18n/config'

interface LocaleState {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  toggleLocale: () => void
}

const applyLocale = (locale: AppLocale) => {
  void i18n.changeLanguage(locale)
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale
  }
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: (i18n.resolvedLanguage as AppLocale) ?? 'id',
      setLocale: (locale) => {
        applyLocale(locale)
        set({ locale })
      },
      toggleLocale: () => {
        const next: AppLocale = get().locale === 'id' ? 'en' : 'id'
        applyLocale(next)
        set({ locale: next })
      },
    }),
    {
      name: 'edulite-locale',
      onRehydrateStorage: () => (state) => {
        if (state?.locale) applyLocale(state.locale)
      },
    },
  ),
)
