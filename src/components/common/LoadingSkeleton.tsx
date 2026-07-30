import { Box, Card, CardContent, Skeleton, Stack } from '@mui/material'

interface LoadingSkeletonProps {
  variant?: 'cards' | 'table' | 'list' | 'detail'
  count?: number
}

export default function LoadingSkeleton({ variant = 'cards', count = 6 }: LoadingSkeletonProps) {
  if (variant === 'table') {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 1, mb: 1.5 }} />
          {Array.from({ length: count }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={36} sx={{ borderRadius: 1, mb: 1 }} />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (variant === 'list') {
    return (
      <Stack spacing={1.5}>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index}>
            <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Skeleton variant="circular" width={44} height={44} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="45%" height={22} />
                <Skeleton variant="text" width="75%" height={18} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    )
  }

  if (variant === 'detail') {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 4 }} />
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 4 }} />
      </Stack>
    )
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <Skeleton variant="rounded" width={44} height={44} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" height={22} />
                <Skeleton variant="text" width="40%" height={16} />
              </Box>
            </Stack>
            <Skeleton variant="text" height={16} />
            <Skeleton variant="text" height={16} width="85%" />
            <Skeleton variant="rectangular" height={32} sx={{ mt: 2, borderRadius: 1 }} />
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
