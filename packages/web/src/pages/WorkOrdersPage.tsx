import React, { useEffect, useState, useMemo } from 'react'
import {
  Box, Typography, Button, Card, CardContent, Chip, Grid, Alert,
  CircularProgress, Tabs, Tab, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
  Stack,
} from '@mui/material'
import { Add as AddIcon, Build as BuildIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import workOrderService from '../services/workOrderService'
import { WorkOrder, CreateWorkOrderDto, UpdateWorkOrderDto, WorkOrderStatus } from '@shared/types'
import { tokenService } from '../services/authService'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const STATUSES: WorkOrderStatus[] = ['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']

const STATUS_COLOR: Record<string, any> = {
  PENDING: 'default', SCHEDULED: 'info', IN_PROGRESS: 'warning',
  ON_HOLD: 'secondary', COMPLETED: 'success', CANCELLED: 'error',
}

const PRIORITY_COLOR: Record<string, any> = {
  LOW: 'success', MEDIUM: 'info', HIGH: 'warning', URGENT: 'error',
}

interface StaffMember { id: string; firstName: string; lastName: string; role: string }
interface Building { id: string; name: string; address: string }

const WorkOrdersPage: React.FC = () => {
  const navigate = useNavigate()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState(0) // 0=All, 1=Active, 2=Completed

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [form, setForm] = useState<CreateWorkOrderDto>({
    title: '', description: '', buildingId: '', priority: 'MEDIUM',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [buildingIssues, setBuildingIssues] = useState<Array<{ id: string; title: string; status: string }>>([])
  const [issuesLoading, setIssuesLoading] = useState(false)

  // Inline status update state
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })

  const load = async (p: number = page) => {
    setLoading(true)
    setError(null)
    try {
      const res = await workOrderService.getWorkOrders({ page: String(p), limit: '20' })
      setWorkOrders(res.data)
      setMeta({ total: res.meta.total, page: res.meta.page, totalPages: res.meta.totalPages })
    } catch (e: any) {
      setError(e?.message || 'Failed to load work orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page) }, [page])

  // Load staff + buildings when create dialog opens
  useEffect(() => {
    if (!createOpen) return
    const token = tokenService.getToken()
    if (!token) return

    Promise.all([
      fetch(`${API_BASE}/issues/assignable-staff`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()).then(j => j?.data?.staff ?? []).catch(() => []),
      workOrderService.getBuildings().catch(() => []),
    ]).then(([s, b]) => {
      setStaff(s)
      setBuildings(b)
    })
  }, [createOpen])

  // Load issues for selected building
  useEffect(() => {
    const buildingId = form.buildingId
    if (!buildingId || !createOpen) {
      setBuildingIssues([])
      return
    }
    setIssuesLoading(true)
    const token = tokenService.getToken()
    if (!token) { setIssuesLoading(false); return }
    fetch(`${API_BASE}/issues?buildingId=${buildingId}&limit=50&status=PENDING&status=IN_REVIEW&status=SCHEDULED&status=IN_PROGRESS`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => setBuildingIssues((j?.data?.issues ?? []).map((i: any) => ({ id: i.id, title: i.title, status: i.status }))))
      .catch(() => setBuildingIssues([]))
      .finally(() => setIssuesLoading(false))
  }, [form.buildingId, createOpen])

  const filtered = useMemo(() => {
    if (tab === 1) return workOrders.filter(w => !['COMPLETED', 'CANCELLED'].includes(w.status))
    if (tab === 2) return workOrders.filter(w => w.status === 'COMPLETED')
    return workOrders
  }, [workOrders, tab])

  const stats = useMemo(() => ({
    total: meta.total,
    active: workOrders.filter(w => !['COMPLETED', 'CANCELLED'].includes(w.status)).length,
    completed: workOrders.filter(w => w.status === 'COMPLETED').length,
    urgent: workOrders.filter(w => w.priority === 'URGENT').length,
  }), [workOrders, meta.total])

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.buildingId) {
      setFormError('Title, description, and building are required')
      return
    }
    setCreating(true)
    setFormError(null)
    try {
      await workOrderService.createWorkOrder(form)
      setCreateOpen(false)
      setForm({ title: '', description: '', buildingId: '', priority: 'MEDIUM' })
      setBuildingIssues([])
      setPage(1)
      await load(1)
    } catch (e: any) {
      setFormError(e?.message || 'Failed to create work order')
    } finally {
      setCreating(false)
    }
  }

  const handleStatusChange = async (id: string, status: WorkOrderStatus) => {
    setUpdatingId(id)
    try {
      const update: UpdateWorkOrderDto = { status }
      if (status === 'IN_PROGRESS') update.startDate = new Date().toISOString()
      if (status === 'COMPLETED') update.completedDate = new Date().toISOString()
      await workOrderService.updateWorkOrder(id, update)
      setWorkOrders(prev => prev.map(w => w.id === id ? { ...w, status } : w))
    } catch (e: any) {
      setError(e?.message || 'Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Work Orders</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track maintenance work
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          New Work Order
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total', value: stats.total, color: 'primary.main' },
          { label: 'Active', value: stats.active, color: 'warning.main' },
          { label: 'Completed', value: stats.completed, color: 'success.main' },
          { label: 'Urgent', value: stats.urgent, color: 'error.main' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" sx={{ color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={`All (${workOrders.length})`} />
        <Tab label={`Active (${stats.active})`} />
        <Tab label={`Completed (${stats.completed})`} />
      </Tabs>

      {/* List */}
      {loading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filtered.length === 0 ? (
        <Alert severity="info">No work orders found.</Alert>
      ) : (
        <Grid container spacing={2}>
          {filtered.map(wo => (
            <Grid item xs={12} md={6} key={wo.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1, mr: 1 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                        onClick={() => navigate(`/work-orders/${wo.id}`)}
                      >
                        <BuildIcon fontSize="small" color="action" />
                        {wo.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {wo.building?.name || wo.buildingId}
                        {wo.unit ? ` · Unit ${wo.unit.unitNumber}` : ''}
                        {wo.scheduledDate ? ` · ${new Date(wo.scheduledDate).toLocaleDateString()}` : ''}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <Chip label={wo.priority} size="small" color={PRIORITY_COLOR[wo.priority]} variant="outlined" />
                      <Chip label={wo.status.replace('_', ' ')} size="small" color={STATUS_COLOR[wo.status]} />
                    </Stack>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {wo.description.substring(0, 120)}{wo.description.length > 120 ? '…' : ''}
                  </Typography>

                  {wo.assignedTo && (
                    <Typography variant="caption" color="text.secondary">
                      Assigned to: {wo.assignedTo.firstName} {wo.assignedTo.lastName}
                    </Typography>
                  )}

                  {/* Status updater */}
                  <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={wo.status}
                        onChange={e => handleStatusChange(wo.id, e.target.value as WorkOrderStatus)}
                        disabled={updatingId === wo.id}
                        displayEmpty
                      >
                        {STATUSES.map(s => (
                          <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {updatingId === wo.id && <CircularProgress size={18} />}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            size="small"
            disabled={page <= 1 || loading}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Typography variant="body2" color="text.secondary">
            Page {page} of {meta.totalPages} ({meta.total} total)
          </Typography>
          <Button
            variant="outlined"
            size="small"
            disabled={page >= meta.totalPages || loading}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </Stack>
      )}

      {/* Create Work Order Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Work Order</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Title"
              required
              fullWidth
              size="small"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />

            <TextField
              label="Description"
              required
              fullWidth
              multiline
              rows={3}
              size="small"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />

            <FormControl fullWidth size="small" required>
              <InputLabel>Building</InputLabel>
              <Select
                value={form.buildingId}
                label="Building"
                onChange={e => setForm(f => ({ ...f, buildingId: e.target.value, issueId: undefined }))}
              >
                {buildings.map(b => (
                  <MenuItem key={b.id} value={b.id}>{b.name} — {b.address}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" disabled={!form.buildingId || issuesLoading}>
              <InputLabel>Related Issue (optional)</InputLabel>
              <Select
                value={form.issueId ?? ''}
                label="Related Issue (optional)"
                onChange={e => setForm(f => ({ ...f, issueId: e.target.value || undefined }))}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {buildingIssues.map(i => (
                  <MenuItem key={i.id} value={i.id}>
                    {i.title} <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>({i.status.replace(/_/g, ' ')})</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Assign to</InputLabel>
              <Select
                value={form.assignedToId ?? ''}
                label="Assign to"
                onChange={e => setForm(f => ({ ...f, assignedToId: e.target.value || undefined }))}
              >
                <MenuItem value=""><em>Unassigned</em></MenuItem>
                {staff.map(s => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={form.priority ?? 'MEDIUM'}
                label="Priority"
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))}
              >
                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Scheduled date"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={form.scheduledDate ? form.scheduledDate.slice(0, 10) : ''}
              onChange={e =>
                setForm(f => ({ ...f, scheduledDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))
              }
            />

            <TextField
              label="Estimated hours"
              type="number"
              fullWidth
              size="small"
              inputProps={{ min: 0, step: 0.5 }}
              value={form.estimatedHours ?? ''}
              onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined }))}
            />

            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={2}
              size="small"
              value={form.notes ?? ''}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value || undefined }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={creating}>
            {creating ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default WorkOrdersPage
