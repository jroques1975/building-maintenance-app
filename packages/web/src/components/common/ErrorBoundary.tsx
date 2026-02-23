import React from 'react'
import { Alert, Box, Typography } from '@mui/material'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
  message?: string
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, message: String(error?.message || error) }
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('UI crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            The UI hit an error and stopped rendering.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {this.state.message}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
            Open the browser console for full details.
          </Typography>
        </Box>
      )
    }

    return this.props.children
  }
}
