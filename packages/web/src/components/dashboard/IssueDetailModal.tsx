import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  TextField,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { Issue } from '@shared/types'
import issueService from '../../services/issueService'
import { tokenService } from '../../services/authService'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const ISSUE_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

interface IssueDetailModalProps {
  open: boolean
  issue: Issue | null
  onClose: () => void
  onRefresh: () => void
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  open,
  issue,
  onClose,
  onRefresh,
}) => {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [assigneeId, setAssigneeId] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Load staff when modal opens
  useEffect(() => {
    if (!open) return
    setError(null)
    setSuccessMsg(null)
    setAssigneeId(issue?.assignedToId ?? '')
    setNewStatus(issue?.status ?? '')
    setNoteContent('')

    const token = tokenService.getToken()
    if (!token) return

    setStaffLoading(true)
    fetch(`${API_BASE}/issues/assignable-staff`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => setStaff(json?.data?.staff ?? []))
      .catch(() => setStaff([]))
      .finally(() => setStaffLoading(false))
  }, [open, issue?.assignedToId, issue?.status])

  if (!issue) return null

  const clearMessages = () => {
    setError(null)
    setSuccessMsg(null)
  }

  const handleAssign = async () => {
    if (!assigneeId) return
    clearMessages()
    setSubmitting(true)
    try {
      await issueService.assignIssue(issue.id, assigneeId)
      setSuccessMsg('Issue assigned successfully')
      onRefresh()
    } catch (e: any) {
      setError(e?.message || 'Failed to assign issue')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!newStatus) return
    clearMessages()
    setSubmitting(true)
    try {
      await issueService.updateIssueStatus(issue.id, newStatus)
      setSuccessMsg('Status updated successfully')
      onRefresh()
    } catch (e: any) {
      setError(e?.message || 'Failed to update status')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return
    clearMessages()
    setSubmitting(true)
    const token = tokenService.getToken()
    try {
      const res = await fetch(`${API_BASE}/issues/${issue.id}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: noteContent.trim() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to save note')
      }
      setNoteContent('')
      setSuccessMsg('Note saved')
    } catch (e: any) {
      setError(e?.message || 'Failed to save note')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkComplete = async () => {
    clearMessages()
    setSubmitting(true)
    try {
      await issueService.updateIssueStatus(issue.id, 'COMPLETED')
      setSuccessMsg('Issue marked as completed')
      onRefresh()
    } catch (e: any) {
      setError(e?.message || 'Failed to complete issue')
    } finally {
      setSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': case 'HIGH': return 'error'
      case 'MEDIUM': return 'warning'
      case 'LOW': return 'success'
      default: return 'default'
    }
  }

  const staffMatch = staff.find(s => s.id === issue.assignedToId)
  const assignedStaffName = staffMatch
    ? `${staffMatch.firstName} ${staffMatch.lastName}`
    : issue.assignedTo
      ? `${issue.assignedTo.firstName} ${issue.assignedTo.lastName}`
      : issue.assignedToId || 'Unassigned'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">
            #{issue.id.slice(0, 8)} - {issue.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Created: {new Date(issue.createdAt).toLocaleString()}
          </Typography>
        </Box>
        <Button onClick={onClose} size="small" sx={{ minWidth: 'auto' }}>
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {error && <Alert severity="error" onClose={clearMessages}>{error}</Alert>}
          {successMsg && <Alert severity="success" onClose={clearMessages}>{successMsg}</Alert>}

          {/* Description */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>SUMMARY</Typography>
            <Typography variant="body1">{issue.description}</Typography>
          </Box>

          <Divider />

          {/* Metadata */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Unit</Typography>
              <Typography variant="body1">{issue.unitId || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Category</Typography>
              <Typography variant="body1">{issue.category}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Priority</Typography>
              <br />
              <Chip label={issue.priority} size="small" color={getPriorityColor(issue.priority) as any} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Current Status</Typography>
              <Typography variant="body1">{issue.status}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Assigned To</Typography>
              <Typography variant="body1">{assignedStaffName}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Last Updated</Typography>
              <Typography variant="body1">{new Date(issue.updatedAt).toLocaleString()}</Typography>
            </Box>
          </Box>

          <Divider />

          {/* Assign */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>ASSIGN</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Staff member</InputLabel>
                <Select
                  value={assigneeId}
                  label="Staff member"
                  onChange={e => setAssigneeId(e.target.value)}
                  disabled={staffLoading || submitting}
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
                disabled={!assigneeId || submitting}
              >
                {submitting ? <CircularProgress size={16} /> : 'Assign'}
              </Button>
            </Stack>
          </Box>

          {/* Status */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>UPDATE STATUS</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  label="Status"
                  onChange={e => setNewStatus(e.target.value)}
                  disabled={submitting}
                >
                  {ISSUE_STATUSES.map(s => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                size="small"
                onClick={handleStatusUpdate}
                disabled={!newStatus || newStatus === issue.status || submitting}
              >
                {submitting ? <CircularProgress size={16} /> : 'Update'}
              </Button>
            </Stack>
          </Box>

          <Divider />

          {/* Notes */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>ADD NOTE</Typography>
            <TextField
              multiline
              rows={3}
              placeholder="Add a note or comment..."
              fullWidth
              variant="outlined"
              size="small"
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              disabled={submitting}
            />
            <Button
              size="small"
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={handleSaveNote}
              disabled={!noteContent.trim() || submitting}
            >
              Save Note
            </Button>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">Close</Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleMarkComplete}
          disabled={issue.status === 'COMPLETED' || submitting}
        >
          Mark Complete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default IssueDetailModal
