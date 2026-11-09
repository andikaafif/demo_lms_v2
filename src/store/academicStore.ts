import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ACTIVE_ACADEMIC_CONTEXT, periodsForYear } from '@/features/academic/models/catalog'

interface AcademicState {
  academicYearId: string
  periodId: string
  setAcademicYear: (academicYearId: string) => void
  setPeriod: (periodId: string) => void
  resetToActive: () => void
}

export const useAcademicStore = create<AcademicState>()(
  persist(
    (set) => ({
      academicYearId: ACTIVE_ACADEMIC_CONTEXT.academicYearId,
      periodId: ACTIVE_ACADEMIC_CONTEXT.periodId,

      setAcademicYear: (academicYearId) => {
        const periods = periodsForYear(academicYearId)
        const preferred = periods.find((period) => period.isActive) ?? periods[0]
        set({ academicYearId, periodId: preferred?.id ?? '' })
      },

      setPeriod: (periodId) => set({ periodId }),

      resetToActive: () =>
        set({
          academicYearId: ACTIVE_ACADEMIC_CONTEXT.academicYearId,
          periodId: ACTIVE_ACADEMIC_CONTEXT.periodId,
        }),
    }),
    { name: 'edulite-academic' },
  ),
)
