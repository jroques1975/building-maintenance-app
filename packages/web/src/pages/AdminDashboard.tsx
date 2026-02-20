import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
} from '@mui/material'
import { 
  People as PeopleIcon,
  Apartment as BuildingIcon,
  Assignment as IssueIcon,
  Work as WorkIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { useAppSelector } from '../store'

const AdminDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth)

  // Mock system stats
  const systemStats = {
    totalUsers: 24,
    activeUsers: 22,
    totalBuildings: 3,
    totalIssues: 156,
    openIssues: 24,
    totalWorkOrders: 89,
    activeWorkOrders: 12,
    tenantSatisfaction: 94,
  }

  // Mock recent users
  const recentUsers = [
    { id: '1', name: 'Maria Rodriguez', email: 'tenant.maria@example.com', role: 'TENANT', status: 'active', lastLogin: '2024-02-19' },
    { id: '2', name: 'James Wilson', email: 'maintenance.jim@miamiproperties.com', role: 'MAINTENANCE', status: 'active', lastLogin: '2024-02-19' },
    { id: '3', name: 'Sarah Williams', email: 'manager.oceanview@miamiproperties.com', role: 'MANAGER', status: 'active', lastLogin: '2024-02-18' },
    { id: '4', name: 'Michael Johnson', email: 'admin@miamiproperties.com', role: 'ADMIN', status: 'active', lastLogin: '2024-02-19' },
  ]

  // Mock buildings
  const buildings = [
    { id: '1', name: 'Ocean View Towers', units: 150, occupied: 142, issues: 12, workOrders: 8 },
    { id: '2', name: 'Brickell Financial Center', units: 300, occupied: 285, issues: 18, workOrders: 12 },
    { id: '3', name: 'Coral Gables Villas', units: 48, occupied: 45, issues: 4, workOrders: 3 },
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'TENANT': return 'success'
      case 'MAINTENANCE': return 'warning'
      case 'MANAGER': return 'info'
      case 'ADMIN': return 'error'
      case 'SUPER_ADMIN': return 'secondary'
      case 'BUILDING_OWNER': return 'primary'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome, {user?.firstName}! System overview and management controls.
      </Typography>

      {/* System Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{systemStats.totalUsers}</Typography>
              <Typography variant="body2" color="text.secondary">Total Users</Typography>
              <Typography variant="caption" color="success.main">
                {systemStats.activeUsers} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BuildingIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{systemStats.totalBuildings}</Typography>
              <Typography variant="body2" color="text.secondary">Buildings</Typography>
              <Typography variant="caption" color="text.secondary">
                Managed properties
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <IssueIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{systemStats.totalIssues}</Typography>
              <Typography variant="body2" color="text.secondary">Total Issues</Typography>
              <Typography variant="caption" color="error.main">
                {systemStats.openIssues} open
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WorkIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{systemStats.totalWorkOrders}</Typography>
              <Typography variant="body2" color="text.secondary">Work Orders</Typography>
              <Typography variant="caption" color="warning.main">
                {systemStats.activeWorkOrders} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Bar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          System Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<AddIcon />}>
            Add User
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />}>
            Add Building
          </Button>
          <Button variant="contained" startIcon={<AddIcon />}>
            System Settings
          </Button>
        </Box>
      </Box>

      {/* Two Column Layout */}
      <Grid container spacing={3}>
        {/* Left Column - Users Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ mr: 1 }} /> Recent Users
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={getRoleColor(user.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          color={user.status === 'active' ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button fullWidth sx={{ mt: 2 }}>View All Users</Button>
          </Paper>
        </Grid>

        {/* Right Column - Buildings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <BuildingIcon sx={{ mr: 1 }} /> Buildings Overview
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Building</TableCell>
                    <TableCell align="right">Units</TableCell>
                    <TableCell align="right">Occupancy</TableCell>
                    <TableCell align="right">Active Issues</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buildings.map((building) => (
                    <TableRow key={building.id}>
                      <TableCell>
                        <Typography variant="body2">{building.name}</Typography>
                      </TableCell>
                      <TableCell align="right">{building.units}</TableCell>
                      <TableCell align="right">
                        {Math.round((building.occupied / building.units) * 100)}%
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Chip label={building.issues} size="small" color="warning" />
                          <Chip label={building.workOrders} size="small" color="info" variant="outlined" />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button fullWidth sx={{ mt: 2 }}>Manage Buildings</Button>
          </Paper>
        </Grid>

        {/* Full Width - System Health */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Health & Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">API Response Time</Typography>
                  <Typography variant="h5">142ms</Typography>
                  <Typography variant="caption" color="success.main">Within SLA</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Database Connections</Typography>
                  <Typography variant="h5">12/50</Typography>
                  <Typography variant="caption" color="success.main">Normal</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Uptime</Typography>
                  <Typography variant="h5">99.95%</Typography>
                  <Typography variant="caption" color="success.main">30 days</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Tenant Satisfaction</Typography>
                  <Typography variant="h5">{systemStats.tenantSatisfaction}%</Typography>
                  <Typography variant="caption" color="success.main">Excellent</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Information Alert */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          Admin Controls
        </Typography>
        <Typography variant="body2" paragraph>
          As an administrator, you have full system access. You can manage users, buildings, system settings,
          and monitor overall performance. Use the controls above to manage the platform.
        </Typography>
        <Button variant="contained" sx={{ backgroundColor: 'white', color: 'primary.main' }}>
          Access Admin Settings
        </Button>
      </Paper>
    </Box>
  )
}

export default AdminDashboard