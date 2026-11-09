import { Box, Card, CardContent, Chip, Stack, Typography, alpha } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import PageHeader from '@/components/common/PageHeader'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import AcademicContextBar from '@/components/common/AcademicContextBar'
import { useScheduleViewModel } from '../viewmodels/useScheduleViewModel'

export default function SchedulePage() {
  const { t } = useTranslation()
  const vm = useScheduleViewModel()

  return (
    <Box>
      <PageHeader
        title={t('schedule.title')}
        subtitle={t('schedule.subtitle')}
        gradient="ocean"
        icon={<CalendarMonthRoundedIcon sx={{ fontSize: 30 }} />}
      />

      <AcademicContextBar />

      {vm.loading ? (
        <LoadingSkeleton variant="cards" count={5} />
      ) : vm.entries.length === 0 ? (
        <EmptyState title={t('schedule.noSchedule')} description={t('schedule.noScheduleHint')} />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          }}
        >
          {vm.days.map((day) => {
            const dayEntries = vm.entries.filter((entry) => entry.dayOfWeek === day.value)
            if (dayEntries.length === 0) return null
            return (
              <Card key={day.value}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                    {t(day.labelKey)}
                  </Typography>
                  <Stack spacing={1.25}>
                    {dayEntries.map((entry) => (
                      <Box
                        key={entry.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          borderLeft: `4px solid ${entry.subjectColor}`,
                          bgcolor: alpha(entry.subjectColor, 0.08),
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {entry.subjectName}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${entry.startTime} - ${entry.endTime}`}
                            sx={{ fontWeight: 700 }}
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {entry.className} · {entry.room}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entry.teacherName} · {t('schedule.meeting', { meeting: entry.meeting })}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
