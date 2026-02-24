import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Card,
  CardContent,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Build as WOIcon, Comment as CommentIcon } from '@mui/icons-material'
import { Issue } from '@shared/types'
import issueService from '../services/issueService'
import { useAppSelector } from '../store'
import { tokenService } from '../services/authService'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const STATUS_COLOR: Record<string, any> = {
  PENDING: 'default', IN_REVIEW: 'info', SCHEDULED: 'info',
  IN_PROGRESS: 'warning', COMPLETED: 'success', CANCELLED: 'error',
}

const PRIORITY_COLOR: Record<string, any> = {
  LOW: 'success', MEDIUM: 'info', HIGH: 'warning', URGENT: 'error',
}

interface StaffMember { id: string; firstName: string; lastName: string; role: string }

const IssueDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAppSelector((state) => state.auth)

  const [issue, setIssue] = useState<Issue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Manager action state
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [assigneeId, setAssigneeId] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [note, setNote] = useState('')
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isManager = user && ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)

  const loadIssue = async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await issueService.getIssue(id)
      setIssue(data)
      setAssigneeId(data.assignedToId ?? '')
      setNewStatus(data.status)
    } catch (e: any) {
      setError(e?.message || 'Failed to load issue')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadIssue() }, [id])

  // Load staff for manager actions
  useEffect(() => {
    if (!isManager) return
    const token = tokenService.getToken()
    if (!token) return
    fetch(`${API_BASE}/issues/assignable-staff`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => setStaff(j?.data?.staff ?? []))
      .catch(() => {})
  }, [isManager])

  if (isLoading) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!issue) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
        <Alert severity="warning">Issue not found.</Alert>
      </Box>
    )
  }

  const handleAssign = async () => {
    setActionSubmitting(true)
    setActionMsg(null)
    try {
      await issueService.assignIssue(issue.id, assigneeId)
      setActionMsg({ type: 'success', text: 'Assigned successfully' })
      await loadIssue()
    } catch (e: any) {
      setActionMsg({ type: 'error', text: e?.message || 'Failed to assign' })
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleStatusUpdate = async () => {
    setActionSubmitting(true)
    setActionMsg(null)
    try {
      await issueService.updateIssueStatus(issue.id, newStatus)
      setActionMsg({ type: 'success', text: 'Status updated' })
      await loadIssue()
    } catch (e: any) {
      setActionMsg({ type: 'error', text: e?.message || 'Failed to update status' })
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleSaveNote = async () => {
    if (!note.trim()) return
    setActionSubmitting(true)
    setActionMsg(null)
    const token = tokenService.getToken()
    try {
      const res = await fetch(`${API_BASE}/issues/${issue.id}/comments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note.trim() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to save note')
      }
      setNote('')
      setActionMsg({ type: 'success', text: 'Note saved' })
    } catch (e: any) {
      setActionMsg({ type: 'error', text: e?.message || 'Failed to save note' })
    } finally {
      setActionSubmitting(false)
    }
  }

  const assignedName = issue.assignedTo
    ? `${issue.assignedTo.firstName} ${issue.assignedTo.lastName}`
    : issue.assignedToId ? issue.assignedToId : 'Unassigned'

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Typography variant="h4" gutterBottom>{issue.title}</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Submitted {new Date(issue.createdAt).toLocaleString()}
        {issue.submittedBy ? ` by ${issue.submittedBy.firstName} ${issue.submittedBy.lastName}` : ''}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Status/priority chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={issue.status.replace('_', ' ')} color={STATUS_COLOR[issue.status]} size="small" />
          <Chip label={issue.priority} color={PRIORITY_COLOR[issue.priority]} size="small" variant="outlined" />
          <Chip label={issue.category} size="small" variant="outlined" />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Metadata grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Building</Typography>
            <Typography variant="body2">{issue.building?.name || issue.buildingId}</Typography>
          </Box>
          {(issue.unit || issue.unitId) && (
            <Box>
              <Typography variant="caption" color="text.secondary">Unit</Typography>
              <Typography variant="body2">
                {issue.unit?.unitNumber ? `Unit ${issue.unit.unitNumber}` : issue.unitId}
              </Typography>
            </Box>
          )}
          {issue.location && (
            <Box>
              <Typography variant="caption" color="text.secondary">Location</Typography>
              <Typography variant="body2">{issue.location}</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">Assigned To</Typography>
            <Typography variant="body2">{assignedName}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Last Updated</Typography>
            <Typography variant="body2">{new Date(issue.updatedAt).toLocaleDateString()}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Description</Typography>
        <Typography variant="body1">{issue.description}</Typography>
      </Paper>

      {/* Linked Work Orders */}
      {issue.workOrders && issue.workOrders.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WOIcon fontSize="small" />
            Linked Work Orders ({issue.workOrders.length})
          </Typography>
          <Stack spacing={1.5}>
            {issue.workOrders.map(wo => (
              <Card
                key={wo.id}
                variant="outlined"
                sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
                onClick={() => navigate(`/work-orders/${wo.id}`)}
              >
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2">{wo.title}</Typography>
                      {wo.assignedTo && (
                        <Typography variant="caption" color="text.secondary">
                          {wo.assignedTo.firstName} {wo.assignedTo.lastName}
                          {wo.scheduledDate ? ` · ${new Date(wo.scheduledDate).toLocaleDateString()}` : ''}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <Chip
                        label={wo.priority}
                        size="small"
                        color={PRIORITY_COLOR[wo.priority] ?? 'default'}
                        variant="outlined"
                      />
                      <Chip
                        label={wo.status.replace(/_/g, ' ')}
                        size="small"
                        color={STATUS_COLOR[wo.status] ?? 'default'}
                      />
                    </Stack>
                  </Box>
                  {wo.estimatedHours != null && (
                    <Typography variant="caption" color="text.secondary">
                      Est: {wo.estimatedHours}h
                      {wo.actualHours != null ? ` · Actual: ${wo.actualHours}h` : ''}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Comments */}
      {issue.comments && issue.comments.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CommentIcon fontSize="small" />
            Comments ({issue.comments.length})
          </Typography>
          <Stack spacing={2}>
            {issue.comments.map(c => (
              <Box key={c.id} sx={{ display: 'flex', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.light' }}>
                  {c.author.firstName[0]}{c.author.lastName[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2">
                      {c.author.firstName} {c.author.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(c.createdAt).toLocaleString()}
                    </Typography>
                    <Chip label={c.author.role} size="small" variant="outlined" sx={{ ml: 'auto', fontSize: 10 }} />
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{c.content}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Manager actions */}
      {isManager && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Manage Issue</Typography>

          {actionMsg && (
            <Alert
              severity={actionMsg.type}
              onClose={() => setActionMsg(null)}
              sx={{ mb: 2 }}
            >
              {actionMsg.text}
            </Alert>
          )}

          <Stack spacing={2}>
            {/* Assign */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Assign</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel>Staff member</InputLabel>
                  <Select
                    value={assigneeId}
                    label="Staff member"
                    onChange={e => setAssigneeId(e.target.value)}
                    disabled={actionSubmitting}
                  >
                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                    {staff.map(s => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.role})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAssign}
                  disabled={actionSubmitting}
                >
                  {actionSubmitting ? <CircularProgress size={16} /> : 'Assign'}
                </Button>
              </Stack>
            </Box>

            {/* Status */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Update Status</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newStatus}
                    label="Status"
                    onChange={e => setNewStatus(e.target.value)}
                    disabled={actionSubmitting}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleStatusUpdate}
                  disabled={actionSubmitting || newStatus === issue.status}
                >
                  {actionSubmitting ? <CircularProgress size={16} /> : 'Update'}
                </Button>
              </Stack>
            </Box>

            {/* Note */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Add Note</Typography>
              <TextField
                multiline
                rows={3}
                placeholder="Add a comment or note..."
                fullWidth
                size="small"
                value={note}
                onChange={e => setNote(e.target.value)}
                disabled={actionSubmitting}
              />
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                onClick={handleSaveNote}
                disabled={!note.trim() || actionSubmitting}
              >
                Save Note
              </Button>
            </Box>
          </Stack>
        </Paper>
      )}
    </Box>
  )
}

export default IssueDetailPage
