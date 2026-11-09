export type PeriodType = 'odd' | 'even'

export interface AcademicYear {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
}

export interface AcademicPeriod {
  id: string
  academicYearId: string
  type: PeriodType
  name: string
  startDate: string
  endDate: string
  isActive: boolean
}

/** The academic context every periodic record must be traceable to. */
export interface AcademicContext {
  academicYearId: string
  periodId: string
}
