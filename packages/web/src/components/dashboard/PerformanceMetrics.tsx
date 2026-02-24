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
  // Parse avgCompletionTime (e.g. "1.8d" or "14h") into hours for progress vs 48h target
  const parseHours = (val: string): number | null => {
    if (!val || val === '—') return null
    const dMatch = val.match(/^([\d.]+)d$/)
    if (dMatch) return parseFloat(dMatch[1]) * 24
    const hMatch = val.match(/^([\d.]+)h$/)
    if (hMatch) return parseFloat(hMatch[1])
    return null
  }
  const completionHours = parseHours(stats.avgCompletionTime)
  // Target: 48h (2 days). Progress = how close to target (100% = at or under target)
  const completionProgress = completionHours !== null ? Math.max(0, Math.min(100, (1 - completionHours / 48) * 100 + 50)) : 0
  const completionStatus = completionHours !== null && completionHours <= 48 ? 'good' as const : 'warning' as const

  const metrics = [
    {
      title: 'Avg Completion Time',
      value: stats.avgCompletionTime,
      target: '2d',
      progress: completionProgress,
      status: completionStatus,
      description: 'Time from report to resolution',
    },
    {
      title: 'Tenant Satisfaction',
      value: stats.tenantSatisfaction > 0 ? `${stats.tenantSatisfaction}%` : '—',
      target: '90%',
      progress: stats.tenantSatisfaction,
      status: (stats.tenantSatisfaction === 0 || stats.tenantSatisfaction >= 90 ? 'good' : 'warning') as 'good' | 'warning',
      description: 'Based on post-resolution surveys',
    },
    {
      title: 'Cost Per Unit',
      value: stats.costPerUnit > 0 ? `$${stats.costPerUnit}` : '—',
      target: '$50',
      progress: stats.costPerUnit > 0 ? Math.min((stats.costPerUnit / 50) * 100, 100) : 0,
      status: (stats.costPerUnit === 0 || stats.costPerUnit <= 50 ? 'good' : 'warning') as 'good' | 'warning',
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
            <Grid item xs={12} sm={6} md={4} key={metric.title}>
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
      </CardContent>
    </Card>
  )
}

export default PerformanceMetrics