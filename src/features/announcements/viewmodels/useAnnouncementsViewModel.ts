import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { api, buildQuery } from '@/lib/api'
import { useSnackbarStore } from '@/store/snackbarStore'
import { useRoleScope } from '@/hooks/useRoleScope'
import type { Announcement } from '../models/types'

export const announcementSchema = z.object({
  title: z.string().min(1, 'announcements.validation.titleRequired'),
  content: z.string().min(1, 'announcements.validation.contentRequired'),
  audience: z.enum(['all', 'teachers', 'students', 'parents']),
  priority: z.enum(['normal', 'important', 'urgent']),
  pinned: z.boolean(),
})

export type AnnouncementFormValues = z.infer<typeof announcementSchema>

interface AnnouncementsViewModel {
  announcements: Announcement[]
  loading: boolean
  saving: boolean
  canManage: boolean
  reload: () => Promise<void>
  createAnnouncement: (values: AnnouncementFormValues) => Promise<boolean>
  updateAnnouncement: (id: string, values: AnnouncementFormValues) => Promise<boolean>
  deleteAnnouncement: (id: string) => Promise<boolean>
}

export function useAnnouncementsViewModel(): AnnouncementsViewModel {
  const { t } = useTranslation()
  const notify = useSnackbarStore((state) => state.notify)
  const scope = useRoleScope()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setAnnouncements(
        await api.get<Announcement[]>(`/api/announcements${buildQuery({ role: scope.role })}`),
      )
    } catch {
      notify(t('errors.generic'), 'error')
    } finally {
      setLoading(false)
    }
  }, [notify, scope.role, t])

  useEffect(() => {
    void load()
  }, [load])

  const run = useCallback(
    async (action: () => Promise<unknown>, successKey: string) => {
      setSaving(true)
      try {
        await action()
        await load()
        notify(t(successKey), 'success')
        return true
      } catch {
        notify(t('errors.generic'), 'error')
        return false
      } finally {
        setSaving(false)
      }
    },
    [load, notify, t],
  )

  return {
    announcements,
    loading,
    saving,
    canManage: scope.isAdmin || scope.isTeacher,
    reload: load,
    createAnnouncement: (values) =>
      run(
        () => api.post('/api/announcements', { ...values, authorId: scope.userId }),
        'announcements.createSuccess',
      ),
    updateAnnouncement: (id, values) =>
      run(
        () => api.put(`/api/announcements/${id}`, { ...values, authorId: scope.userId }),
        'announcements.updateSuccess',
      ),
    deleteAnnouncement: (id) =>
      run(() => api.delete(`/api/announcements/${id}`), 'announcements.deleteSuccess'),
  }
}
