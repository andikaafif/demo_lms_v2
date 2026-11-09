import { useEffect, useMemo } from 'react'
import {
  ACADEMIC_PERIODS,
  ACADEMIC_YEARS,
  ACTIVE_ACADEMIC_CONTEXT,
  academicPeriodName,
  academicYearName,
  periodsForYear,
} from '@/features/academic/models/catalog'
import type { AcademicContext } from '@/features/academic/models/types'
import { useAcademicStore } from '@/store/academicStore'

export interface AcademicContextValue {
  years: typeof ACADEMIC_YEARS
  periods: ReturnType<typeof periodsForYear>
  academicYearId: string
  periodId: string
  academicYearLabel: string
  periodLabel: string
  context: AcademicContext
  isActiveContext: boolean
  setAcademicYear: (academicYearId: string) => void
  setPeriod: (periodId: string) => void
  resetToActive: () => void
}

/** Shared academic year + period selection used by every periodic module. */
export function useAcademicContext(): AcademicContextValue {
  const academicYearId = useAcademicStore((state) => state.academicYearId)
  const periodId = useAcademicStore((state) => state.periodId)
  const setAcademicYear = useAcademicStore((state) => state.setAcademicYear)
  const setPeriod = useAcademicStore((state) => state.setPeriod)
  const resetToActive = useAcademicStore((state) => state.resetToActive)

  const periods = useMemo(() => periodsForYear(academicYearId), [academicYearId])

  useEffect(() => {
    if (periods.length === 0) return
    if (!periods.some((period) => period.id === periodId)) {
      setPeriod(periods[0].id)
    }
  }, [periodId, periods, setPeriod])

  return {
    years: ACADEMIC_YEARS,
    periods,
    academicYearId,
    periodId,
    academicYearLabel: academicYearName(academicYearId),
    periodLabel: academicPeriodName(periodId),
    context: { academicYearId, periodId },
    isActiveContext:
      academicYearId === ACTIVE_ACADEMIC_CONTEXT.academicYearId &&
      periodId === ACTIVE_ACADEMIC_CONTEXT.periodId,
    setAcademicYear,
    setPeriod,
    resetToActive,
  }
}

export const allPeriods = ACADEMIC_PERIODS
