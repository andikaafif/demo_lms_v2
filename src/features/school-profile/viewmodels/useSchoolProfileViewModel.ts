import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { api } from '@/lib/api'
import { useSnackbarStore } from '@/store/snackbarStore'
import type { SchoolProfile } from '../models/types'

export const schoolProfileSchema = z.object({
  name: z.string().min(1, 'school.validation.nameRequired'),
  npsn: z.string().regex(/^\d{8}$/, 'school.validation.npsnLength'),
  address: z.string().min(1, 'school.validation.addressRequired'),
  phone: z.string().min(1, 'school.validation.phoneRequired'),
  email: z.string().email('school.validation.emailInvalid'),
  website: z.string().url('school.validation.urlInvalid').or(z.literal('')),
  principalName: z.string().min(1, 'school.validation.principalRequired'),
  accreditation: z.enum(['A', 'B', 'C', 'Belum Terakreditasi']),
  description: z.string().min(1, 'school.validation.nameRequired'),
  establishedYear: z
    .number({ invalid_type_error: 'school.validation.yearInvalid' })
    .int()
    .min(1900, 'school.validation.yearInvalid')
    .max(new Date().getFullYear(), 'school.validation.yearInvalid'),
})

export type SchoolProfileFormValues = z.infer<typeof schoolProfileSchema>

interface SchoolProfileViewModel {
  school: SchoolProfile | null
  loading: boolean
  saving: boolean
  error: string | null
  reload: () => Promise<void>
  save: (values: SchoolProfileFormValues) => Promise<boolean>
}

export function useSchoolProfileViewModel(): SchoolProfileViewModel {
  const { t } = useTranslation()
  const notify = useSnackbarStore((state) => state.notify)
  const [school, setSchool] = useState<SchoolProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSchool(await api.get<SchoolProfile>('/api/school'))
    } catch {
      setError('errors.generic')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const save = useCallback(
    async (values: SchoolProfileFormValues) => {
      setSaving(true)
      try {
        const updated = await api.put<SchoolProfile>('/api/school', values)
        setSchool(updated)
        notify(t('school.updateSuccess'), 'success')
        return true
      } catch {
        notify(t('errors.generic'), 'error')
        return false
      } finally {
        setSaving(false)
      }
    },
    [notify, t],
  )

  return { school, loading, saving, error, reload, save }
}
