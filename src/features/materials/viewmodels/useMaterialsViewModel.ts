import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { api, buildQuery } from '@/lib/api'
import { useSnackbarStore } from '@/store/snackbarStore'
import { useRoleScope } from '@/hooks/useRoleScope'
import { useAcademicContext } from '@/hooks/useAcademicContext'
import { useReferenceData } from '@/hooks/useReferenceData'
import { classIdOfStudent, classesForScope } from '@/lib/scope'
import type { Material, MaterialInput, MaterialType } from '../models/types'

export const materialSchema = z
  .object({
    title: z.string().min(1, 'materials.validation.titleRequired'),
    description: z.string().min(1, 'materials.validation.descriptionRequired'),
    subjectId: z.string().min(1, 'materials.validation.subjectRequired'),
    classId: z.string().min(1, 'materials.validation.classRequired'),
    meeting: z
      .number({ invalid_type_error: 'materials.validation.meetingRange' })
      .int()
      .min(1, 'materials.validation.meetingRange')
      .max(52, 'materials.validation.meetingRange'),
    textbook: z.string(),
    linkLabel: z.string(),
    linkUrl: z.string(),
    type: z.enum(['pdf', 'image', 'video', 'link', 'text', 'ppt', 'doc']),
    youtubeUrl: z.string().optional(),
    attachmentName: z.string().optional(),
  })
  .refine((values) => values.type !== 'video' || Boolean(values.youtubeUrl?.trim()), {
    message: 'materials.validation.youtubeRequired',
    path: ['youtubeUrl'],
  })

export type MaterialFormValues = z.infer<typeof materialSchema>

interface MaterialsViewModel {
  materials: Material[]
  loading: boolean
  saving: boolean
  canManage: boolean
  search: string
  classFilter: string
  subjectFilter: string
  availableClasses: ReturnType<typeof useReferenceData>['classes']
  availableSubjects: ReturnType<typeof useReferenceData>['subjects']
  setSearch: (value: string) => void
  setClassFilter: (value: string) => void
  setSubjectFilter: (value: string) => void
  reload: () => Promise<void>
  createMaterial: (values: MaterialFormValues) => Promise<boolean>
  updateMaterial: (id: string, values: MaterialFormValues) => Promise<boolean>
  deleteMaterial: (id: string) => Promise<boolean>
  registerView: (id: string) => Promise<void>
  subjectNameOf: (id: string | null | undefined) => string
  subjectColorOf: (id: string | null | undefined) => string
  classNameOf: (id: string | null | undefined) => string
  teacherNameOf: (id: string | null | undefined) => string
}

const sizeForType = (type: MaterialType): number => {
  switch (type) {
    case 'pdf':
      return 780
    case 'image':
      return 1650
    case 'ppt':
      return 3200
    case 'doc':
      return 540
    default:
      return 220
  }
}

export function useMaterialsViewModel(): MaterialsViewModel {
  const { t } = useTranslation()
  const notify = useSnackbarStore((state) => state.notify)
  const scope = useRoleScope()
  const academic = useAcademicContext()
  const reference = useReferenceData()

  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')

  const ownClassId = useMemo(
    () => classIdOfStudent(reference.students, scope.studentId),
    [reference.students, scope.studentId],
  )

  const effectiveClassId = scope.isReadOnly ? ownClassId : classFilter

  const availableClasses = useMemo(
    () => classesForScope(reference.classes, reference.subjectAssignments, reference.students, scope),
    [reference.classes, reference.students, reference.subjectAssignments, scope],
  )

  const load = useCallback(async () => {
    if (scope.isReadOnly && !ownClassId) {
      setMaterials([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const query = buildQuery({
        classId: effectiveClassId,
        subjectId: subjectFilter,
        search,
        academicYearId: academic.academicYearId,
        periodId: academic.periodId,
      })
      setMaterials(await api.get<Material[]>(`/api/materials${query}`))
    } catch {
      notify(t('errors.generic'), 'error')
    } finally {
      setLoading(false)
    }
  }, [
    academic.academicYearId,
    academic.periodId,
    effectiveClassId,
    notify,
    ownClassId,
    scope.isReadOnly,
    search,
    subjectFilter,
    t,
  ])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 200)
    return () => window.clearTimeout(timer)
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

  const toInput = useCallback(
    (values: MaterialFormValues): MaterialInput => ({
      title: values.title,
      description: values.description,
      subjectId: values.subjectId,
      classId: values.classId,
      teacherId: scope.teacherId ?? 't-1',
      academicYearId: academic.academicYearId,
      periodId: academic.periodId,
      meeting: values.meeting,
      textbook: values.textbook,
      links:
        values.linkUrl.trim().length > 0
          ? [
              {
                id: `link-${Date.now()}`,
                label: values.linkLabel.trim() || values.linkUrl,
                url: values.linkUrl,
              },
            ]
          : [],
      type: values.type,
      youtubeUrl: values.youtubeUrl ?? '',
      attachments: values.attachmentName
        ? [
            {
              id: `att-${Date.now()}`,
              name: values.attachmentName,
              type: values.type,
              url: `/files/${values.attachmentName.toLowerCase().replace(/\s+/g, '-')}`,
              sizeKb: sizeForType(values.type),
            },
          ]
        : [],
    }),
    [academic.academicYearId, academic.periodId, scope.teacherId],
  )

  return {
    materials,
    loading: loading || reference.loading,
    saving,
    canManage: scope.isAdmin || scope.isTeacher,
    search,
    classFilter,
    subjectFilter,
    availableClasses,
    availableSubjects: reference.subjects,
    setSearch,
    setClassFilter,
    setSubjectFilter,
    reload: load,
    createMaterial: (values) =>
      run(() => api.post('/api/materials', toInput(values)), 'materials.createSuccess'),
    updateMaterial: (id, values) =>
      run(() => api.put(`/api/materials/${id}`, toInput(values)), 'materials.updateSuccess'),
    deleteMaterial: (id) =>
      run(() => api.delete(`/api/materials/${id}`), 'materials.deleteSuccess'),
    registerView: async (id) => {
      await api.post(`/api/materials/${id}/view`).catch(() => undefined)
    },
    subjectNameOf: reference.subjectNameOf,
    subjectColorOf: reference.subjectColorOf,
    classNameOf: reference.classNameOf,
    teacherNameOf: reference.teacherNameOf,
  }
}
