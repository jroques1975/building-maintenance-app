import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material'
import { Assignment as WorkIcon, CheckCircle, Schedule, Build } from '@mui/icons-material'
import { useAppSelector } from '../store'

const MaintenanceDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth)
  const [tabValue, setTabValue] = useState(0)

  // Mock work orders
  const mockWorkOrders = [
    { id: '1', title: 'AC Repair - Unit 301', status: 'IN_PROGRESS', priority: 'URGENT', estimatedHours: 3, progress: 60 },
    { id: '2', title: 'Kitchen Faucet Replacement', status: 'SCHEDULED', priority: 'HIGH', scheduledDate: '2024-02-20', progress: 0 },
    { id: '3', title: 'Electrical Outlet Repair', status: 'PENDING', priority: 'MEDIUM', progress: 0 },
    { id: '4', title: 'Elevator Inspection', status: 'COMPLETED', priority: 'MEDIUM', completedDate: '2024-02-18', progress: 100 },
  ]

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'default'
      case 'SCHEDULED': return 'info'
      case 'IN_PROGRESS': return 'warning'
      case 'COMPLETED': return 'success'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'success'
      case 'MEDIUM': return 'info'
      case 'HIGH': return 'warning'
      case 'URGENT': return 'error'
      default: return 'default'
    }
  }

  const filteredWorkOrders = mockWorkOrders.filter((order) => {
    if (tabValue === 0) return order.status !== 'COMPLETED'
    if (tabValue === 1) return order.status === 'IN_PROGRESS'
    if (tabValue === 2) return order.status === 'COMPLETED'
    return true
  })

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Maintenance Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome, {user?.firstName}! Here's your assigned work and schedule.
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              4
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Assignments
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="warning">
              1
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Progress
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="info">
              1
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Scheduled
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="success">
              1
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Active Work" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>

      {/* Work Orders List */}
      <Grid container spacing={3}>
        {filteredWorkOrders.map((order) => (
          <Grid item xs={12} md={6} key={order.id}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      <WorkIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      {order.title}
                    </Typography>
                    {order.estimatedHours && (
                      <Typography variant="body2" color="text.secondary">
                        Estimated: {order.estimatedHours} hours
                      </Typography>
                    )}
                    {order.scheduledDate && (
                      <Typography variant="body2" color="text.secondary">
                        Scheduled: {order.scheduledDate}
                      </Typography>
                    )}
                    {order.completedDate && (
                      <Typography variant="body2" color="text.secondary">
                        Completed: {order.completedDate}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                    <Chip 
                      label={order.priority} 
                      color={getPriorityColor(order.priority) as any}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                {/* Progress Bar */}
                {order.status === 'IN_PROGRESS' && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Progress: {order.progress}%
                    </Typography>
                    <LinearProgress variant="determinate" value={order.progress} />
                  </Box>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {order.status === 'PENDING' && (
                    <Button size="small" variant="contained" startIcon={<Schedule />}>
                      Schedule
                    </Button>
                  )}
                  {order.status === 'SCHEDULED' && (
                    <Button size="small" variant="contained" startIcon={<Build />}>
                      Start Work
                    </Button>
                  )}
                  {order.status === 'IN_PROGRESS' && (
                    <Button size="small" variant="contained" startIcon={<CheckCircle />}>
                      Complete
                    </Button>
                  )}
                  <Button size="small" variant="outlined">
                    Details
                  </Button>
                  <Button size="small" variant="text">
                    Notes
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Work Orders Message */}
      {filteredWorkOrders.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No work orders found for the selected filter.
        </Alert>
      )}

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="outlined" startIcon={<Schedule />}>
              View Schedule
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="outlined" startIcon={<Build />}>
              Request Parts
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="outlined">
              Time Sheet
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="outlined">
              Reports
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Information Alert */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <strong>Maintenance Dashboard</strong> - This view is for maintenance staff and technicians.
        You can see assigned work orders, update their status, and track your progress.
      </Alert>
    </Box>
  )
}

export default MaintenanceDashboard