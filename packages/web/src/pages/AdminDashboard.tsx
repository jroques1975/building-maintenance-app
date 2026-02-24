import React, { useEffect, useState } from 'react'
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
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  People as PeopleIcon,
  Apartment as BuildingIcon,
  Assignment as IssueIcon,
  Work as WorkIcon,
} from '@mui/icons-material'
import { useAppSelector } from '../store'
import { useNavigate } from 'react-router-dom'
import { tokenService } from '../services/authService'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function authFetch(path: string) {
  const token = tokenService.getToken()
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

interface Building {
  id: string
  name: string
  address: string
  totalUnits: number
  _count: { units: number; issues: number; workOrders: number; users: number }
}

interface UserRow {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

const ROLE_COLOR: Record<string, any> = {
  TENANT: 'success', MAINTENANCE: 'warning', MANAGER: 'info',
  ADMIN: 'error', SUPER_ADMIN: 'secondary', BUILDING_OWNER: 'primary',
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [users, setUsers] = useState<UserRow[]>([])
  const [issueStats, setIssueStats] = useState<{ open: number; total: number; urgent: number } | null>(null)
  const [workOrderStats, setWorkOrderStats] = useState<{ active: number; total: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [buildingsJson, usersJson, issuesJson, woJson] = await Promise.allSettled([
          authFetch('/buildings'),
          authFetch('/users?limit=10'),
          authFetch('/issues/stats/summary'),
          authFetch('/work-orders/stats/summary'),
        ])

        if (buildingsJson.status === 'fulfilled') {
          setBuildings(buildingsJson.value?.data?.buildings ?? [])
        }
        if (usersJson.status === 'fulfilled') {
          setUsers(usersJson.value?.data?.users ?? [])
        }
        if (issuesJson.status === 'fulfilled') {
          const d = issuesJson.value?.data ?? {}
          const byStatus: { status: string; _count: number }[] = d.byStatus ?? []
          const byPriority: { priority: string; _count: number }[] = d.byPriority ?? []
          const openStatuses = ['PENDING', 'IN_REVIEW', 'SCHEDULED', 'IN_PROGRESS']
          const open = byStatus.filter(s => openStatuses.includes(s.status)).reduce((n, s) => n + s._count, 0)
          const total = byStatus.reduce((n, s) => n + s._count, 0)
          const urgent = byPriority.find(p => p.priority === 'URGENT')?._count ?? 0
          setIssueStats({ open, total, urgent })
        }
        if (woJson.status === 'fulfilled') {
          const d = woJson.value?.data ?? {}
          const byStatus: { status: string; _count: number }[] = d.byStatus ?? []
          const total = byStatus.reduce((n, s) => n + s._count, 0)
          const active = byStatus
            .filter(s => ['PENDING', 'SCHEDULED', 'IN_PROGRESS'].includes(s.status))
            .reduce((n, s) => n + s._count, 0)
          setWorkOrderStats({ active, total })
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome, {user?.firstName}! System overview and management controls.
      </Typography>

      {loading && <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* System Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BuildingIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{buildings.length}</Typography>
              <Typography variant="body2" color="text.secondary">Buildings</Typography>
              <Typography variant="caption" color="text.secondary">Managed properties</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{users.length}</Typography>
              <Typography variant="body2" color="text.secondary">Users</Typography>
              <Typography variant="caption" color="text.secondary">Active members</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <IssueIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{issueStats?.total ?? '—'}</Typography>
              <Typography variant="body2" color="text.secondary">Total Issues</Typography>
              <Typography variant="caption" color="error.main">
                {issueStats != null ? `${issueStats.open} open` : ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WorkIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{workOrderStats?.total ?? '—'}</Typography>
              <Typography variant="body2" color="text.secondary">Work Orders</Typography>
              <Typography variant="caption" color="warning.main">
                {workOrderStats != null ? `${workOrderStats.active} active` : ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Two Column Layout */}
      <Grid container spacing={3}>
        {/* Users Table */}
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
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.slice(0, 8).map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <Typography variant="body2">{u.firstName} {u.lastName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={u.role} color={ROLE_COLOR[u.role] ?? 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary">No users found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Buildings Table */}
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
                    <TableCell align="right">Issues</TableCell>
                    <TableCell align="right">Work Orders</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buildings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <Typography variant="body2">{b.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{b.address}</Typography>
                      </TableCell>
                      <TableCell align="right">{b._count.units}</TableCell>
                      <TableCell align="right">
                        <Chip label={b._count.issues} size="small" color="warning" />
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={b._count.workOrders} size="small" color="info" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {buildings.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">No buildings found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => navigate('/work-orders')}>Work Orders</Button>
          <Button variant="outlined" onClick={() => navigate('/issues')}>All Issues</Button>
          <Button variant="outlined" onClick={() => navigate('/buildings')}>Buildings</Button>
          <Button variant="outlined" onClick={() => navigate('/users')}>Users</Button>
          <Button variant="outlined" onClick={() => navigate('/operator-continuity')}>Portfolio</Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default AdminDashboard
