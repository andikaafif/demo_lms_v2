export type AnnouncementAudience = 'all' | 'teachers' | 'students' | 'parents'
export type AnnouncementPriority = 'normal' | 'important' | 'urgent'

export interface Announcement {
  id: string
  title: string
  content: string
  audience: AnnouncementAudience
  priority: AnnouncementPriority
  authorId: string
  authorName: string
  publishedAt: string
  pinned: boolean
}

export type AnnouncementInput = Omit<Announcement, 'id' | 'publishedAt' | 'authorName'>
