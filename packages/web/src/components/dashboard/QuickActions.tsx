import React from 'react'
import { Card, CardContent, CardHeader, Button, Grid, Box, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../store'
import { fetchDashboardData } from '../../store/dashboardSlice'

const QuickActions: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { filteredIssues, issues, filter } = useAppSelector((state) => state.dashboard)
  const { user } = useAppSelector((state) => state.auth)

  const handleRefresh = () => {
    dispatch(fetchDashboardData())
  }

  const handleExport = () => {
    let filterType = 'all'
    if (filter.assignedToId && user && filter.assignedToId === user.id) {
      filterType = 'mine'
    } else if (filter.priority === 'URGENT') {
      filterType = 'urgent'
    }

    const exportData = {
      issues: filteredIssues,
      metadata: {
        exportedAt: new Date().toISOString(),
        filterApplied: filterType,
        totalIssues: issues.length,
        filteredIssues: filteredIssues.length,
        version: '1.0',
      },
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileName = `issues-export-${new Date().toISOString().split('T')[0]}-${filterType}.json`

    const link = document.createElement('a')
    link.setAttribute('href', dataUri)
    link.setAttribute('download', exportFileName)
    link.click()
  }

  const actions = [
    {
      icon: <AddIcon />,
      label: 'New Work Order',
      color: 'primary',
      onClick: () => navigate('/work-orders'),
    },
    {
      icon: <RefreshIcon />,
      label: 'Refresh Data',
      color: 'secondary',
      onClick: handleRefresh,
    },
  ]

  return (
    <Card>
      <CardHeader title="Quick Actions" />
      <CardContent>
        <Grid container spacing={2}>
          {actions.map((action) => (
            <Grid item xs={6} key={action.label}>
              <Button
                fullWidth
                variant="contained"
                startIcon={action.icon}
                onClick={action.onClick}
                sx={{
                  py: 1.5,
                  backgroundColor: `${action.color}.main`,
                  '&:hover': { backgroundColor: `${action.color}.dark` },
                }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AssessmentIcon />}
            onClick={handleExport}
          >
            Export Issues (JSON) — {filteredIssues.length}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Exports currently filtered issues ({filteredIssues.length} of {issues.length} total)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default QuickActions
