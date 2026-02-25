import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Stack,
} from '@mui/material'
import { Add as AddIcon, Assignment as IssueIcon, CameraAlt as CameraIcon, Close as CloseIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../store'
import issueService from '../services/issueService'
import { uploadPhoto, UploadedAttachment } from '../services/uploadService'
import { Issue, Priority } from '@shared/types'

const TenantDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const [openNewIssue, setOpenNewIssue] = useState(false)
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM' as Priority,
    location: '',
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])

  // Photo state for new issue dialog
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refresh = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await issueService.getMyIssues()
      setIssues(res.data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load your requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const stats = useMemo(() => {
    const total = issues.length
    const inProgress = issues.filter(i => i.status === 'IN_PROGRESS').length
    const scheduled = issues.filter(i => i.status === 'SCHEDULED').length
    const completed = issues.filter(i => i.status === 'COMPLETED').length
    return { total, inProgress, scheduled, completed }
  }, [issues])

  const handleOpenNewIssue = () => setOpenNewIssue(true)
  const handleCloseNewIssue = () => {
    setOpenNewIssue(false)
    setPhotos([])
    setPhotoPreviews([])
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = 4 - photos.length
    const toAdd = files.slice(0, remaining)
    setPhotos(prev => [...prev, ...toAdd])
    setPhotoPreviews(prev => [
      ...prev,
      ...toAdd.map(f => URL.createObjectURL(f)),
    ])
    // reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemovePhoto = (i: number) => {
    URL.revokeObjectURL(photoPreviews[i])
    setPhotos(prev => prev.filter((_, idx) => idx !== i))
    setPhotoPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmitIssue = async () => {
    try {
      setError(null)
      const buildingId = user?.buildingId
      const unitId = user?.unitId

      if (!buildingId) {
        throw new Error('We could not determine your building. Ask management to assign your unit/building.')
      }

      // Upload photos first (if any)
      let attachments: UploadedAttachment[] = []
      if (photos.length > 0) {
        setUploadingPhotos(true)
        attachments = await Promise.all(photos.map(f => uploadPhoto(f, buildingId)))
        setUploadingPhotos(false)
      }

      await issueService.createIssue({
        title: newIssue.title,
        description: newIssue.description,
        category: newIssue.category,
        priority: newIssue.priority,
        buildingId,
        unitId: unitId || undefined,
        location: newIssue.location || undefined,
        ...(attachments.length > 0 ? { attachments } : {}),
      })

      handleCloseNewIssue()
      setNewIssue({ title: '', description: '', category: 'OTHER', priority: 'MEDIUM' as Priority, location: '' })
      await refresh()
    } catch (e: any) {
      setUploadingPhotos(false)
      setError(e?.message || 'Failed to submit request')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'default'
      case 'IN_PROGRESS': return 'warning'
      case 'SCHEDULED': return 'info'
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
      <Typography variant="h4" gutterBottom>
        Tenant Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome back, {user?.firstName}! Here's an overview of your maintenance requests.
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Total Issues', value: stats.total, color: 'primary.main' },
          { label: 'In Progress', value: stats.inProgress, color: 'warning.main' },
          { label: 'Scheduled', value: stats.scheduled, color: 'info.main' },
          { label: 'Completed', value: stats.completed, color: 'success.main' },
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

      {/* Action Bar */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          My Maintenance Requests
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenNewIssue}
        >
          New Request
        </Button>
      </Box>

      {/* Issues List */}
      {isLoading ? (
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {issues.map((issue) => (
            <Grid item xs={12} key={issue.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <IssueIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        {issue.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Submitted on {new Date(issue.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={issue.status}
                        color={getStatusColor(issue.status) as any}
                        size="small"
                      />
                      <Chip
                        label={issue.priority}
                        color={getPriorityColor(issue.priority) as any}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <Button size="small" variant="text" onClick={() => navigate(`/issues/${issue.id}`)}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* No Issues Message */}
      {!isLoading && !error && issues.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          You haven't submitted any maintenance requests yet. Click "New Request" to get started.
        </Alert>
      )}

      {/* New Issue Dialog */}
      <Dialog open={openNewIssue} onClose={handleCloseNewIssue} maxWidth="sm" fullWidth>
        <DialogTitle>Submit New Maintenance Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Issue Title"
            fullWidth
            variant="outlined"
            value={newIssue.title}
            onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newIssue.description}
            onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Location (e.g. Kitchen, Living Room, Bathroom)"
            fullWidth
            variant="outlined"
            value={newIssue.location}
            onChange={(e) => setNewIssue({...newIssue, location: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Category"
            select
            fullWidth
            SelectProps={{ native: true }}
            variant="outlined"
            value={newIssue.category}
            onChange={(e) => setNewIssue({...newIssue, category: e.target.value})}
          >
            <option value="HVAC">HVAC</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="APPLIANCE">Appliance</option>
            <option value="STRUCTURAL">Structural</option>
            <option value="SECURITY">Security</option>
            <option value="CLEANING">Cleaning</option>
            <option value="PEST_CONTROL">Pest Control</option>
            <option value="OTHER">Other</option>
          </TextField>
          <TextField
            margin="dense"
            label="Priority"
            select
            fullWidth
            SelectProps={{ native: true }}
            variant="outlined"
            value={newIssue.priority}
            onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value as any as import('@shared/types').Priority })}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </TextField>
          {/* Photo picker */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Photos (up to 4)
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {photoPreviews.map((src, i) => (
                <Box key={i} sx={{ position: 'relative', width: 72, height: 72 }}>
                  <Box
                    component="img"
                    src={src}
                    sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemovePhoto(i)}
                    sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', p: 0.25 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              {photos.length < 4 && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CameraIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ width: 72, height: 72, flexDirection: 'column', gap: 0.5, fontSize: 10 }}
                >
                  Add
                </Button>
              )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewIssue}>Cancel</Button>
          <Button onClick={handleSubmitIssue} variant="contained" disabled={uploadingPhotos}>
            {uploadingPhotos ? <CircularProgress size={20} /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default TenantDashboard