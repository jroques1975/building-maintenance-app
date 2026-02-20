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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { Add as AddIcon, Assignment as IssueIcon } from '@mui/icons-material'
import { useAppSelector } from '../store'

const TenantDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth)
  const [openNewIssue, setOpenNewIssue] = useState(false)
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
  })

  // Mock tenant issues
  const mockIssues = [
    { id: '1', title: 'AC not cooling', status: 'IN_PROGRESS', createdAt: '2024-02-19', priority: 'URGENT' },
    { id: '2', title: 'Leaking faucet', status: 'SCHEDULED', createdAt: '2024-02-18', priority: 'HIGH' },
    { id: '3', title: 'Broken light fixture', status: 'COMPLETED', createdAt: '2024-02-15', priority: 'MEDIUM' },
  ]

  const handleOpenNewIssue = () => setOpenNewIssue(true)
  const handleCloseNewIssue = () => setOpenNewIssue(false)

  const handleSubmitIssue = () => {
    console.log('Submit new issue:', newIssue)
    // In real implementation, dispatch an action to create issue
    handleCloseNewIssue()
    setNewIssue({ title: '', description: '', category: 'GENERAL', priority: 'MEDIUM' })
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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              3
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Issues
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
      <Grid container spacing={3}>
        {mockIssues.map((issue) => (
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
                      Submitted on {issue.createdAt}
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
                <Button size="small" variant="text">View Details</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Issues Message */}
      {mockIssues.length === 0 && (
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
            label="Category"
            select
            fullWidth
            SelectProps={{ native: true }}
            variant="outlined"
            value={newIssue.category}
            onChange={(e) => setNewIssue({...newIssue, category: e.target.value})}
          >
            <option value="GENERAL">General</option>
            <option value="HVAC">HVAC</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="APPLIANCE">Appliance</option>
          </TextField>
          <TextField
            margin="dense"
            label="Priority"
            select
            fullWidth
            SelectProps={{ native: true }}
            variant="outlined"
            value={newIssue.priority}
            onChange={(e) => setNewIssue({...newIssue, priority: e.target.value})}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewIssue}>Cancel</Button>
          <Button onClick={handleSubmitIssue} variant="contained">Submit Request</Button>
        </DialogActions>
      </Dialog>

      {/* Information Alert */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <strong>Tenant Dashboard</strong> - This is a simplified view for building tenants.
        You can submit new maintenance requests and track the status of existing ones.
      </Alert>
    </Box>
  )
}

export default TenantDashboard