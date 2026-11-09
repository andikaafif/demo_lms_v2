import type { AcademicContext, AcademicPeriod, AcademicYear } from './types'

export const ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: 'ay-2024-2025',
    name: '2024/2025',
    startDate: '2024-07-01',
    endDate: '2025-06-30',
    isActive: false,
  },
  {
    id: 'ay-2025-2026',
    name: '2025/2026',
    startDate: '2025-07-01',
    endDate: '2026-06-30',
    isActive: true,
  },
  {
    id: 'ay-2026-2027',
    name: '2026/2027',
    startDate: '2026-07-01',
    endDate: '2027-06-30',
    isActive: false,
  },
]

export const ACADEMIC_PERIODS: AcademicPeriod[] = [
  {
    id: 'ap-2024-2025-odd',
    academicYearId: 'ay-2024-2025',
    type: 'odd',
    name: 'Ganjil',
    startDate: '2024-07-01',
    endDate: '2024-12-31',
    isActive: false,
  },
  {
    id: 'ap-2024-2025-even',
    academicYearId: 'ay-2024-2025',
    type: 'even',
    name: 'Genap',
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    isActive: false,
  },
  {
    id: 'ap-2025-2026-odd',
    academicYearId: 'ay-2025-2026',
    type: 'odd',
    name: 'Ganjil',
    startDate: '2025-07-01',
    endDate: '2025-12-31',
    isActive: true,
  },
  {
    id: 'ap-2025-2026-even',
    academicYearId: 'ay-2025-2026',
    type: 'even',
    name: 'Genap',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    isActive: false,
  },
  {
    id: 'ap-2026-2027-odd',
    academicYearId: 'ay-2026-2027',
    type: 'odd',
    name: 'Ganjil',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    isActive: false,
  },
  {
    id: 'ap-2026-2027-even',
    academicYearId: 'ay-2026-2027',
    type: 'even',
    name: 'Genap',
    startDate: '2027-01-01',
    endDate: '2027-06-30',
    isActive: false,
  },
]

/** Default context: the active academic year and its active period. */
export const ACTIVE_ACADEMIC_CONTEXT: AcademicContext = {
  academicYearId: 'ay-2025-2026',
  periodId: 'ap-2025-2026-odd',
}

export const periodsForYear = (academicYearId: string): AcademicPeriod[] =>
  ACADEMIC_PERIODS.filter((period) => period.academicYearId === academicYearId)

export const academicYearName = (academicYearId: string): string =>
  ACADEMIC_YEARS.find((year) => year.id === academicYearId)?.name ?? '-'

export const academicPeriodName = (periodId: string): string =>
  ACADEMIC_PERIODS.find((item) => item.id === periodId)?.name ?? '-'
