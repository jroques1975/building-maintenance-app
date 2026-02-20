import React from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'
import { SxProps, Theme } from '@mui/material/styles'

interface StatsCardProps {
  title: string
  value: number
  subtitle: string
  color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, color }) => {
  const colorMap: Record<string, SxProps<Theme>> = {
    primary: { color: 'primary.main' },
    secondary: { color: 'secondary.main' },
    error: { color: 'error.main' },
    warning: { color: 'warning.main' },
    info: { color: 'info.main' },
    success: { color: 'success.main' },
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
          <Typography variant="h3" sx={{ ...colorMap[color], fontWeight: 600 }}>
            {value}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default StatsCard