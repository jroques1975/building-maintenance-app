import React from 'react'
import { Card, CardContent, CardHeader, Grid, Box, Typography, LinearProgress } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'

interface PerformanceMetricsProps {
  stats: {
    avgResponseTime: string
    avgCompletionTime: string
    tenantSatisfaction: number
    costPerUnit: number
  }
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ stats }) => {
  const metrics = [
    {
      title: 'Avg Response Time',
      value: stats.avgResponseTime,
      target: '6h',
      progress: 70,
      status: 'good' as const,
      description: 'Time from report to first response',
    },
    {
      title: 'Avg Completion Time',
      value: stats.avgCompletionTime,
      target: '2d',
      progress: 90,
      status: 'good' as const,
      description: 'Time from report to resolution',
    },
    {
      title: 'Tenant Satisfaction',
      value: `${stats.tenantSatisfaction}%`,
      target: '90%',
      progress: stats.tenantSatisfaction,
      status: stats.tenantSatisfaction >= 90 ? 'good' : 'warning' as const,
      description: 'Based on post-resolution surveys',
    },
    {
      title: 'Cost Per Unit',
      value: `$${stats.costPerUnit}`,
      target: '$50',
      progress: (stats.costPerUnit / 50) * 100,
      status: stats.costPerUnit <= 50 ? 'good' : 'warning' as const,
      description: 'Monthly maintenance cost per unit',
    },
  ]

  const getStatusColor = (status: 'good' | 'warning') => {
    return status === 'good' ? 'success' : 'warning'
  }

  const getStatusIcon = (status: 'good' | 'warning') => {
    return status === 'good' ? <TrendingUpIcon /> : <TrendingDownIcon />
  }

  return (
    <Card>
      <CardHeader title="Performance Metrics" />
      <CardContent>
        <Grid container spacing={3}>
          {metrics.map((metric) => (
            <Grid item xs={12} sm={6} md={3} key={metric.title}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {metric.title}
                  </Typography>
                  <Box sx={{ color: `${getStatusColor(metric.status)}.main` }}>
                    {getStatusIcon(metric.status)}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', my: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    / {metric.target} target
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(metric.progress, 100)}
                  color={getStatusColor(metric.status)}
                  sx={{ height: 6, borderRadius: 3, mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {metric.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Performance Insights:</strong> All metrics are within or exceeding targets.
            Focus areas: Continue monitoring AC issues during heat wave, consider preventative
            maintenance for aging building systems.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default PerformanceMetrics