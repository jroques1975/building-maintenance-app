import React from 'react'
import { Card, CardContent, CardHeader, Button, Grid, Box, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import GroupIcon from '@mui/icons-material/Group'
import EmailIcon from '@mui/icons-material/Email'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { useAppSelector, useAppDispatch } from '../../store'
import { addActivity } from '../../store/dashboardSlice'

const QuickActions: React.FC = () => {
  const { filteredIssues, issues, filter } = useAppSelector((state) => state.dashboard)
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const actions = [
    { icon: <AddIcon />, label: 'New Issue', color: 'primary' },
    { icon: <GroupIcon />, label: 'Assign Bulk', color: 'secondary' },
    { icon: <EmailIcon />, label: 'Send Update', color: 'warning' },
    { icon: <AssessmentIcon />, label: 'Generate Report', color: 'success' },
  ]

  const handleActionClick = (action: string) => {
    alert(`${action} clicked - (Simulated action)`)
  }

  const handleExport = () => {
    // Determine current filter type for metadata (matches DashboardPage mapping)
    let filterType = 'all'
    if (filter.assigneeId && user && filter.assigneeId === user.id) {
      filterType = 'mine'
    } else if (filter.priority === 'high') {
      filterType = 'urgent'
    }
    
    const exportData = {
      issues: filteredIssues,
      metadata: {
        exportedAt: new Date().toISOString(),
        filterApplied: filterType,
        totalIssues: issues.length,
        filteredIssues: filteredIssues.length,
        version: '1.0'
      }
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    
    const exportFileName = `dashboard-export-${new Date().toISOString().split('T')[0]}-filter-${filterType}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileName)
    linkElement.click()

    // Log activity
    dispatch(addActivity({
      id: `export-${Date.now()}`,
      action: `Dashboard data exported (filter: ${filterType}, ${filteredIssues.length} issues)`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))

    alert(`Data exported successfully!\n\nFile: ${exportFileName}\nFilter: ${filterType}\nIssues exported: ${filteredIssues.length} (of ${issues.length} total)`)
  }

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
                onClick={() => handleActionClick(action.label)}
                sx={{
                  py: 1.5,
                  backgroundColor: `${action.color}.main`,
                  '&:hover': {
                    backgroundColor: `${action.color}.dark`,
                  },
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
            onClick={handleExport}
          >
            Export Data (JSON) - {filteredIssues.length} issues
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Exports currently filtered issues ({filteredIssues.length} of {issues.length})
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default QuickActions