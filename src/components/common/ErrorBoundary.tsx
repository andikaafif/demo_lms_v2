import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded'
import i18n from '@/i18n/config'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  message: string
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('EduLite render error:', error, info.componentStack)
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          bgcolor: 'background.default',
        }}
      >
        <Card sx={{ maxWidth: 460, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Stack spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'error.main',
                  color: '#fff',
                }}
              >
                <ReportProblemRoundedIcon sx={{ fontSize: 38 }} />
              </Box>
              <Typography variant="h5">{i18n.t('errors.boundaryTitle')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {i18n.t('errors.boundaryMessage')}
              </Typography>
              {this.state.message ? (
                <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                  {this.state.message}
                </Typography>
              ) : null}
              <Button variant="contained" onClick={this.handleReload}>
                {i18n.t('errors.reload')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    )
  }
}
