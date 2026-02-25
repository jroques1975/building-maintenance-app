import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Typography, Paper, Chip, Button, Alert, CircularProgress,
  Divider, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { WorkOrder, WorkOrderStatus, UpdateWorkOrderDto } from '@shared/types'
import workOrderService from '../services/workOrderService'
import { useAppSelector } from '../store'

const STATUS_OPTIONS: WorkOrderStatus[] = ['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']

const STATUS_COLOR: Record<string, any> = {
  PENDING: 'default', SCHEDULED: 'info', IN_PROGRESS: 'warning',
  ON_HOLD: 'secondary', COMPLETED: 'success', CANCELLED: 'error',
}

const PRIORITY_COLOR: Record<string, any> = {
  LOW: 'success', MEDIUM: 'info', HIGH: 'warning', URGENT: 'error',
}

const WorkOrderDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAppSelector((state) => state.auth)

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<WorkOrderStatus>('PENDING')
  const [actualHours, setActualHours] = useState('')
  const [notes, setNotes] = useState('')
  const [updating, setUpdating] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isManager = user && ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)
  const isMaintenance = user?.role === 'MAINTENANCE'
  const canUpdate = isManager || isMaintenance

  const load = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await workOrderService.getWorkOrder(id)
      setWorkOrder(data)
      setNewStatus(data.status)
      setNotes(data.notes ?? '')
      setActualHours(data.actualHours != null ? String(data.actualHours) : '')
    } catch (e: any) {
      setError(e?.message || 'Failed to load work order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleUpdate = async () => {
    if (!workOrder) return
    setUpdating(true)
    setMsg(null)
    try {
      const update: UpdateWorkOrderDto = { status: newStatus }
      if (newStatus === 'IN_PROGRESS' && workOrder.status !== 'IN_PROGRESS') {
        update.startDate = new Date().toISOString()
      }
      if (newStatus === 'COMPLETED' && workOrder.status !== 'COMPLETED') {
        update.completedDate = new Date().toISOString()
      }
      if (actualHours) update.actualHours = parseFloat(actualHours)
      if (notes !== workOrder.notes) update.notes = notes
      await workOrderService.updateWorkOrder(workOrder.id, update)
      setMsg({ type: 'success', text: 'Work order updated' })
      await load()
    } catch (e: any) {
      setMsg({ type: 'error', text: e?.message || 'Failed to update' })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !workOrder) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
        <Alert severity="error">{error ?? 'Work order not found.'}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Typography variant="h4" gutterBottom>{workOrder.title}</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Created {new Date(workOrder.createdAt).toLocaleString()}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Status/priority chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={workOrder.status.replace('_', ' ')} color={STATUS_COLOR[workOrder.status]} size="small" />
          <Chip label={workOrder.priority} color={PRIORITY_COLOR[workOrder.priority]} size="small" variant="outlined" />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Metadata */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Building</Typography>
            <Typography variant="body2">{workOrder.building?.name ?? workOrder.buildingId}</Typography>
          </Box>
          {(workOrder.unit || workOrder.unitId) && (
            <Box>
              <Typography variant="caption" color="text.secondary">Unit</Typography>
              <Typography variant="body2">
                {workOrder.unit ? `Unit ${workOrder.unit.unitNumber}` : workOrder.unitId}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">Assigned To</Typography>
            <Typography variant="body2">
              {workOrder.assignedTo
                ? `${workOrder.assignedTo.firstName} ${workOrder.assignedTo.lastName}`
                : 'Unassigned'}
            </Typography>
          </Box>
          {workOrder.scheduledDate && (
            <Box>
              <Typography variant="caption" color="text.secondary">Scheduled</Typography>
              <Typography variant="body2">{new Date(workOrder.scheduledDate).toLocaleDateString()}</Typography>
            </Box>
          )}
          {workOrder.estimatedHours != null && (
            <Box>
              <Typography variant="caption" color="text.secondary">Est. Hours</Typography>
              <Typography variant="body2">{workOrder.estimatedHours}h</Typography>
            </Box>
          )}
          {workOrder.actualHours != null && (
            <Box>
              <Typography variant="caption" color="text.secondary">Actual Hours</Typography>
              <Typography variant="body2">{workOrder.actualHours}h</Typography>
            </Box>
          )}
          {workOrder.completedDate && (
            <Box>
              <Typography variant="caption" color="text.secondary">Completed</Typography>
              <Typography variant="body2">{new Date(workOrder.completedDate).toLocaleDateString()}</Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Description</Typography>
        <Typography variant="body1" paragraph>{workOrder.description}</Typography>

        {workOrder.notes && (
          <>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Notes</Typography>
            <Typography variant="body2">{workOrder.notes}</Typography>
          </>
        )}

        {workOrder.issue && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Related Issue</Typography>
            <Button
              variant="text"
              size="small"
              sx={{ p: 0, textAlign: 'left', textTransform: 'none' }}
              onClick={() => navigate(`/issues/${workOrder.issueId}`)}
            >
              {workOrder.issue.title}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              — {workOrder.issue.status.replace(/_/g, ' ')}
            </Typography>
          </>
        )}
      </Paper>

      {/* Update panel */}
      {canUpdate && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Update Work Order</Typography>

          {msg && (
            <Alert severity={msg.type} onClose={() => setMsg(null)} sx={{ mb: 2 }}>
              {msg.text}
            </Alert>
          )}

          <Stack spacing={2}>
            <FormControl size="small" sx={{ maxWidth: 220 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                label="Status"
                onChange={e => setNewStatus(e.target.value as WorkOrderStatus)}
                disabled={updating}
              >
                {STATUS_OPTIONS.map(s => (
                  <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Actual hours"
              type="number"
              size="small"
              sx={{ maxWidth: 160 }}
              inputProps={{ min: 0, step: 0.5 }}
              value={actualHours}
              onChange={e => setActualHours(e.target.value)}
              disabled={updating}
            />

            <TextField
              label="Notes"
              multiline
              rows={3}
              size="small"
              fullWidth
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={updating}
            />

            <Box>
              <Button
                variant="contained"
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? <CircularProgress size={20} /> : 'Save Changes'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      )}
    </Box>
  )
}

export default WorkOrderDetailPage
