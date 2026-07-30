import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded'
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded'
import PageHeader from '@/components/common/PageHeader'
import { daysUntil, formatDate } from '@/lib/format'
import { useLocaleStore } from '@/store/localeStore'
import type { AssignmentWithStats } from '@/features/assignments/models/types'
import type { Announcement } from '@/features/announcements/models/types'
import type { Material } from '@/features/materials/models/types'

export function greetingKey(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'dashboard.greetingMorning'
  if (hour < 18) return 'dashboard.greetingAfternoon'
  return 'dashboard.greetingEvening'
}

export function DashboardHeader({ name }: { name: string }) {
  const { t } = useTranslation()
  return (
    <PageHeader
      title={`${t(greetingKey())}, ${name}`}
      subtitle={t('dashboard.welcomeSubtitle')}
      gradient="primary"
    />
  )
}

interface UpcomingAssignmentsProps {
  assignments: AssignmentWithStats[]
  subjectNameOf: (id: string | null | undefined) => string
  subjectColorOf: (id: string | null | undefined) => string
}

export function UpcomingAssignments({
  assignments,
  subjectNameOf,
  subjectColorOf,
}: UpcomingAssignmentsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <AssignmentRoundedIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, flex: 1 }}>
            {t('dashboard.upcomingAssignments')}
          </Typography>
        </Stack>
        {assignments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('dashboard.noUpcoming')}
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {assignments.map((item) => {
              const days = daysUntil(item.dueDate)
              const color = subjectColorOf(item.subjectId)
              return (
                <Stack
                  key={item.id}
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  onClick={() => navigate('/assignments')}
                  sx={{
                    p: 1.25,
                    borderRadius: 3,
                    cursor: 'pointer',
                    bgcolor: 'action.hover',
                    transition: 'transform .18s ease',
                    '&:hover': { transform: 'translateX(4px)' },
                  }}
                >
                  <Box sx={{ width: 6, height: 40, borderRadius: 3, bgcolor: color }} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {subjectNameOf(item.subjectId)}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    color={days < 0 ? 'error' : days === 0 ? 'warning' : 'default'}
                    label={
                      days < 0
                        ? t('dashboard.overdue')
                        : days === 0
                          ? t('dashboard.dueToday')
                          : t('dashboard.dueIn', { count: days })
                    }
                  />
                </Stack>
              )
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

export function RecentAnnouncements({ announcements }: { announcements: Announcement[] }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const locale = useLocaleStore((state) => state.locale)
  const navigate = useNavigate()

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <CampaignRoundedIcon color="secondary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, flex: 1 }}>
            {t('dashboard.recentAnnouncements')}
          </Typography>
        </Stack>
        {announcements.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('announcements.noAnnouncements')}
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {announcements.slice(0, 4).map((item) => (
              <Box
                key={item.id}
                onClick={() => navigate('/announcements')}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  cursor: 'pointer',
                  bgcolor: alpha(theme.palette.secondary.main, 0.08),
                  transition: 'transform .18s ease',
                  '&:hover': { transform: 'translateX(4px)' },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                  {item.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.content}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                  {formatDate(item.publishedAt, locale)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

interface LatestMaterialsProps {
  materials: Material[]
  subjectNameOf: (id: string | null | undefined) => string
  subjectColorOf: (id: string | null | undefined) => string
}

export function LatestMaterials({
  materials,
  subjectNameOf,
  subjectColorOf,
}: LatestMaterialsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <LibraryBooksRoundedIcon sx={{ color: '#0F9B8E' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, flex: 1 }}>
            {t('dashboard.latestMaterials')}
          </Typography>
        </Stack>
        {materials.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('materials.noMaterials')}
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {materials.slice(0, 4).map((item) => (
              <Stack
                key={item.id}
                direction="row"
                spacing={1.5}
                alignItems="center"
                onClick={() => navigate('/materials')}
                sx={{
                  p: 1.25,
                  borderRadius: 3,
                  cursor: 'pointer',
                  bgcolor: 'action.hover',
                  transition: 'transform .18s ease',
                  '&:hover': { transform: 'translateX(4px)' },
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 40,
                    borderRadius: 3,
                    bgcolor: subjectColorOf(item.subjectId),
                  }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {subjectNameOf(item.subjectId)}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
