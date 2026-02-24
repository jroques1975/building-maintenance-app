import React, { useEffect, useState, useMemo } from 'react'
import {
  Box, Typography, Paper, Button, Grid, Card, CardContent, Chip,
  Alert, Tabs, Tab, CircularProgress,
} from '@mui/material'
import { Assignment as WorkIcon, CheckCircle, Schedule, Build } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../store'
import workOrderService from '../services/workOrderService'
import { WorkOrder, UpdateWorkOrderDto } from '@shared/types'

const MaintenanceDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const [tabValue, setTabValue] = useState(0)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await workOrderService.getMyWorkOrders()
      setWorkOrders(res.data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load work orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const stats = useMemo(() => ({
    total: workOrders.length,
    inProgress: workOrders.filter(w => w.status === 'IN_PROGRESS').length,
    scheduled: workOrders.filter(w => w.status === 'SCHEDULED').length,
    completed: workOrders.filter(w => w.status === 'COMPLETED').length,
  }), [workOrders])

  const filtered = useMemo(() => {
    if (tabValue === 0) return workOrders.filter(w => !['COMPLETED', 'CANCELLED'].includes(w.status))
    if (tabValue === 1) return workOrders.filter(w => w.status === 'IN_PROGRESS')
    if (tabValue === 2) return workOrders.filter(w => w.status === 'COMPLETED')
    return workOrders
  }, [workOrders, tabValue])

  const handleStatusUpdate = async (id: string, status: WorkOrder['status']) => {
    setUpdatingId(id)
    try {
      const update: UpdateWorkOrderDto = { status }
      if (status === 'IN_PROGRESS') update.startDate = new Date().toISOString()
      if (status === 'COMPLETED') update.completedDate = new Date().toISOString()
      await workOrderService.updateWorkOrder(id, update)
      setWorkOrders(prev => prev.map(w => w.id === id ? { ...w, status } : w))
    } catch (e: any) {
      setError(e?.message || 'Failed to update work order')
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'default'
      case 'SCHEDULED': return 'info'
      case 'IN_PROGRESS': return 'warning'
      case 'ON_HOLD': return 'secondary'
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Maintenance Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome, {user?.firstName}! Here's your assigned work and schedule.
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Assignments', value: stats.total, color: 'primary.main' },
          { label: 'In Progress', value: stats.inProgress, color: 'warning.main' },
          { label: 'Scheduled', value: stats.scheduled, color: 'info.main' },
          { label: 'Completed', value: stats.completed, color: 'success.main' },
        ].map(s => (
          <Grid item xs={12} sm={6} md={3} key={s.label}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="body2" color="text.secondary">{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="fullWidth">
          <Tab label="Active Work" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>

      {/* Work Orders List */}
      {loading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : filtered.length === 0 ? (
        <Alert severity="info">No work orders found for this filter.</Alert>
      ) : (
        <Grid container spacing={3}>
          {filtered.map(order => (
            <Grid item xs={12} md={6} key={order.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <WorkIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        {order.title}
                      </Typography>
                      {order.building && (
                        <Typography variant="body2" color="text.secondary">
                          {order.building.name}
                          {order.unit ? ` · Unit ${order.unit.unitNumber}` : ''}
                        </Typography>
                      )}
                      {order.estimatedHours != null && (
                        <Typography variant="body2" color="text.secondary">
                          Est. {order.estimatedHours}h
                          {order.actualHours != null ? ` · Actual ${order.actualHours}h` : ''}
                        </Typography>
                      )}
                      {order.scheduledDate && (
                        <Typography variant="body2" color="text.secondary">
                          Scheduled: {new Date(order.scheduledDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Chip label={order.status.replace('_', ' ')} color={getStatusColor(order.status) as any} size="small" />
                      <Chip label={order.priority} color={getPriorityColor(order.priority) as any} size="small" variant="outlined" />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {order.description.substring(0, 120)}{order.description.length > 120 ? '…' : ''}
                  </Typography>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {order.status === 'PENDING' && (
                      <Button
                        size="small" variant="outlined" startIcon={<Schedule />}
                        onClick={() => handleStatusUpdate(order.id, 'SCHEDULED')}
                        disabled={updatingId === order.id}
                      >
                        Mark Scheduled
                      </Button>
                    )}
                    {order.status === 'SCHEDULED' && (
                      <Button
                        size="small" variant="contained" startIcon={<Build />}
                        onClick={() => handleStatusUpdate(order.id, 'IN_PROGRESS')}
                        disabled={updatingId === order.id}
                      >
                        Start Work
                      </Button>
                    )}
                    {order.status === 'IN_PROGRESS' && (
                      <Button
                        size="small" variant="contained" color="success" startIcon={<CheckCircle />}
                        onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                        disabled={updatingId === order.id}
                      >
                        Complete
                      </Button>
                    )}
                    {updatingId === order.id && <CircularProgress size={20} sx={{ alignSelf: 'center' }} />}
                    <Button
                      size="small" variant="text"
                      onClick={() => navigate(`/work-orders/${order.id}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default MaintenanceDashboard
