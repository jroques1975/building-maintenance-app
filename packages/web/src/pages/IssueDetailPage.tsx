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
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Issue } from '@shared/types'
import issueService from '../services/issueService'

const IssueDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [issue, setIssue] = useState<Issue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!id) return
      setIsLoading(true)
      setError(null)
      try {
        const data = await issueService.getIssue(id)
        setIssue(data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load issue')
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [id])

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
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!issue) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Alert severity="warning">Issue not found.</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Typography variant="h4" gutterBottom>
        {issue.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Submitted on {new Date(issue.createdAt).toLocaleString()}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={issue.status} size="small" />
          <Chip label={issue.priority} size="small" variant="outlined" />
          <Chip label={issue.category} size="small" />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" paragraph>
          {issue.description}
        </Typography>

        {issue.location && (
          <>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Location
            </Typography>
            <Typography variant="body2" paragraph>
              {issue.location}
            </Typography>
          </>
        )}

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Assignment
        </Typography>
        <Typography variant="body2">
          {issue.assignedToId ? `Assigned to: ${issue.assignedToId}` : 'Unassigned'}
        </Typography>
      </Paper>

      <Alert severity="info" sx={{ mt: 3 }}>
        Issue detail is now connected to the real API. Next we’ll add manager actions (assign/status/work orders) here.
      </Alert>
    </Box>
  )
}

export default IssueDetailPage
