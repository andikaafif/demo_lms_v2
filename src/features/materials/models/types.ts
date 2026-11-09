export type MaterialType = 'pdf' | 'image' | 'video' | 'link' | 'text' | 'ppt' | 'doc'

export interface MaterialAttachment {
  id: string
  name: string
  type: MaterialType
  url: string
  sizeKb: number
}

export interface MaterialLink {
  id: string
  label: string
  url: string
}

export interface Material {
  id: string
  title: string
  description: string
  subjectId: string
  classId: string
  teacherId: string
  academicYearId: string
  periodId: string
  /** Meeting/pertemuan number inside the period. */
  meeting: number
  textbook: string
  links: MaterialLink[]
  type: MaterialType
  youtubeUrl?: string
  attachments: MaterialAttachment[]
  publishedAt: string
  viewCount: number
}

export type MaterialInput = Omit<Material, 'id' | 'publishedAt' | 'viewCount'>
