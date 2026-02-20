import React from 'react'
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
  MenuItem,
  Stack,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AssignmentIcon from '@mui/icons-material/Assignment'
import UpdateIcon from '@mui/icons-material/Update'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Issue } from '@shared/types'

interface IssueDetailModalProps {
  open: boolean
  issue: Issue | null
  onClose: () => void
  onAction: (action: string, issueId: string, data?: any) => void
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  open,
  issue,
  onClose,
  onAction,
}) => {
  if (!issue) return null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'emergency':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open'
      case 'in_progress':
        return 'In Progress'
      case 'completed':
        return 'Completed'
      case 'closed':
        return 'Closed'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return '🟡'
      case 'completed':
      case 'closed':
        return '✅'
      default:
        return '⚪'
    }
  }

  const handleAssign = () => {
    const technician = prompt('Assign to technician (Tech J., Plumber M., etc.):', issue.assigneeId || '')
    if (technician !== null) {
      onAction('assign', issue.id, { assigneeId: technician })
    }
  }

  const handleUpdateStatus = () => {
    const newStatus = prompt('New status (open, in_progress, completed, closed):', issue.status)
    if (newStatus !== null) {
      onAction('update-status', issue.id, { status: newStatus })
    }
  }

  const handleAddNote = () => {
    const note = prompt('Add note:')
    if (note !== null) {
      onAction('add-note', issue.id, { note })
    }
  }

  const handleComplete = () => {
    if (confirm(`Mark issue #${issue.id} as completed?`)) {
      onAction('complete', issue.id)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">
            #{issue.id} - {issue.title}
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
          {/* Issue Summary */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              SUMMARY
            </Typography>
            <Typography variant="body1" paragraph>
              {issue.description}
            </Typography>
          </Box>

          <Divider />

          {/* Metadata Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Unit
              </Typography>
              <Typography variant="body1">
                {issue.unitNumber || 'N/A'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Category
              </Typography>
              <Typography variant="body1">
                {issue.category || 'N/A'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Priority
              </Typography>
              <Chip
                label={issue.priority}
                size="small"
                color={getPriorityColor(issue.priority)}
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body1">
                {getStatusIcon(issue.status)} {getStatusText(issue.status)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Assigned To
              </Typography>
              <Typography variant="body1">
                {issue.assigneeId || 'Unassigned'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {new Date(issue.updatedAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Quick Actions */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              QUICK ACTIONS
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<AssignmentIcon />}
                onClick={handleAssign}
                size="small"
              >
                Assign
              </Button>
              <Button
                variant="outlined"
                startIcon={<UpdateIcon />}
                onClick={handleUpdateStatus}
                size="small"
              >
                Update Status
              </Button>
              <Button
                variant="outlined"
                startIcon={<NoteAddIcon />}
                onClick={handleAddNote}
                size="small"
              >
                Add Note
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckCircleIcon />}
                onClick={handleComplete}
                size="small"
                color="success"
              >
                Mark Complete
              </Button>
            </Stack>
          </Box>

          {/* Notes Section (would be populated from API) */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              NOTES & COMMENTS
            </Typography>
            <TextField
              multiline
              rows={3}
              placeholder="Add a note or comment..."
              fullWidth
              variant="outlined"
              size="small"
            />
            <Button size="small" sx={{ mt: 1 }}>
              Save Note
            </Button>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() => onAction('save', issue.id)}
          color="primary"
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default IssueDetailModal