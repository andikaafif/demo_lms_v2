export type MaterialType = 'pdf' | 'image' | 'video' | 'link' | 'text'

export interface MaterialAttachment {
  id: string
  name: string
  type: MaterialType
  url: string
  sizeKb: number
}

export interface Material {
  id: string
  title: string
  description: string
  subjectId: string
  classId: string
  teacherId: string
  type: MaterialType
  youtubeUrl?: string
  attachments: MaterialAttachment[]
  publishedAt: string
  viewCount: number
}

export type MaterialInput = Omit<Material, 'id' | 'publishedAt' | 'viewCount'>
