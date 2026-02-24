import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Card, CardContent, Grid, Alert, CircularProgress,
  Button, Chip, Stack, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { Apartment as BuildingIcon, ArrowBack as BackIcon } from '@mui/icons-material'
import { tokenService } from '../services/authService'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function authFetch(path: string) {
  const token = tokenService.getToken()
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).message || `Request failed (${res.status})`)
  }
  return res.json()
}

interface Unit {
  id: string
  unitNumber: string
  type: string
  squareFeet?: number
  bedrooms?: number
  bathrooms?: number
  currentTenant?: { id: string; firstName: string; lastName: string; email: string; phone?: string }
}

interface StaffUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  phone?: string
}

interface RecentIssue {
  id: string
  title: string
  category: string
  priority: string
  status: string
  createdAt: string
}

interface RecentWorkOrder {
  id: string
  title: string
  status: string
  priority: string
  scheduledDate?: string
  completedDate?: string
}

interface Building {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  yearBuilt?: number
  floors?: number
  totalUnits?: number
  notes?: string
  createdAt: string
  units: Unit[]
  users: StaffUser[]
  issues: RecentIssue[]
  workOrders: RecentWorkOrder[]
}

const STATUS_COLOR: Record<string, any> = {
  PENDING: 'default', IN_REVIEW: 'info', SCHEDULED: 'info',
  IN_PROGRESS: 'warning', COMPLETED: 'success', CANCELLED: 'error',
}
const PRIORITY_COLOR: Record<string, any> = {
  LOW: 'success', MEDIUM: 'info', HIGH: 'warning', URGENT: 'error',
}
const ROLE_COLOR: Record<string, any> = {
  TENANT: 'success', MAINTENANCE: 'warning', MANAGER: 'info',
  ADMIN: 'error', SUPER_ADMIN: 'secondary',
}
const ROLE_LABEL: Record<string, string> = {
  TENANT: 'Tenant', MAINTENANCE: 'Maintenance', MANAGER: 'Manager',
  ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin',
}

const BuildingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [building, setBuilding] = useState<Building | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState(0)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const json = await authFetch(`/buildings/${id}`)
        setBuilding(json?.data?.building ?? null)
      } catch (e: any) {
        setError(e?.message || 'Failed to load building')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
  }
  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
  }
  if (!building) {
    return <Alert severity="warning">Building not found.</Alert>
  }

  const occupiedUnits = building.units.filter(u => !!u.currentTenant).length

  return (
    <Box>
      {/* Back button */}
      <Button startIcon={<BackIcon />} onClick={() => navigate('/buildings')} sx={{ mb: 2 }}>
        Back to Buildings
      </Button>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">
          <BuildingIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          {building.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {building.address}, {building.city}, {building.state} {building.zipCode}
        </Typography>
      </Box>

      {/* Info chips */}
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
        {building.yearBuilt && <Chip label={`Built ${building.yearBuilt}`} variant="outlined" size="small" />}
        {building.floors && <Chip label={`${building.floors} floor${building.floors !== 1 ? 's' : ''}`} variant="outlined" size="small" />}
        <Chip label={`${building.units.length} units (${occupiedUnits} occupied)`} variant="outlined" size="small" color="info" />
        <Chip label={`${building.users.length} staff`} variant="outlined" size="small" color="warning" />
        <Chip label={`${building.issues.length} recent issues`} variant="outlined" size="small" />
        <Chip label={`${building.workOrders.length} recent WOs`} variant="outlined" size="small" />
      </Stack>

      {building.notes && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Notes</Typography>
            <Typography variant="body2">{building.notes}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tab label={`Units (${building.units.length})`} />
        <Tab label={`Staff (${building.users.length})`} />
        <Tab label={`Recent Issues (${building.issues.length})`} />
        <Tab label={`Recent Work Orders (${building.workOrders.length})`} />
      </Tabs>

      {/* Units tab */}
      {tab === 0 && (
        building.units.length === 0 ? (
          <Alert severity="info">No units found for this building.</Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Unit</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Beds / Baths</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Contact</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {building.units.map(unit => (
                  <TableRow key={unit.id} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell><Typography variant="body2" fontWeight={600}>{unit.unitNumber}</Typography></TableCell>
                    <TableCell><Chip label={unit.type} size="small" variant="outlined" /></TableCell>
                    <TableCell>{unit.squareFeet ? `${unit.squareFeet} sqft` : '—'}</TableCell>
                    <TableCell>
                      {unit.bedrooms !== undefined ? `${unit.bedrooms}bd` : '—'}
                      {' / '}
                      {unit.bathrooms !== undefined ? `${unit.bathrooms}ba` : '—'}
                    </TableCell>
                    <TableCell>
                      {unit.currentTenant
                        ? `${unit.currentTenant.firstName} ${unit.currentTenant.lastName}`
                        : <Typography variant="caption" color="text.secondary">Vacant</Typography>
                      }
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {unit.currentTenant?.email ?? ''}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}

      {/* Staff tab */}
      {tab === 1 && (
        building.users.length === 0 ? (
          <Alert severity="info">No staff assigned to this building.</Alert>
        ) : (
          <Grid container spacing={2}>
            {building.users.map(user => (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Card variant="outlined">
                  <CardContent sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        {user.phone && (
                          <Typography variant="caption" color="text.secondary" display="block">{user.phone}</Typography>
                        )}
                      </Box>
                      <Chip
                        label={ROLE_LABEL[user.role] ?? user.role}
                        color={ROLE_COLOR[user.role] ?? 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}

      {/* Recent Issues tab */}
      {tab === 2 && (
        building.issues.length === 0 ? (
          <Alert severity="info">No recent issues for this building.</Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {building.issues.map(issue => (
                  <TableRow
                    key={issue.id}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, '&:last-child td': { border: 0 } }}
                    onClick={() => navigate(`/issues/${issue.id}`)}
                  >
                    <TableCell><Typography variant="body2">{issue.title}</Typography></TableCell>
                    <TableCell><Typography variant="caption">{issue.category}</Typography></TableCell>
                    <TableCell><Chip label={issue.priority} size="small" color={PRIORITY_COLOR[issue.priority]} variant="outlined" /></TableCell>
                    <TableCell><Chip label={issue.status.replace('_', ' ')} size="small" color={STATUS_COLOR[issue.status]} /></TableCell>
                    <TableCell><Typography variant="caption">{new Date(issue.createdAt).toLocaleDateString()}</Typography></TableCell>
                    <TableCell><Typography variant="caption" color="primary">View</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}

      {/* Recent Work Orders tab */}
      {tab === 3 && (
        building.workOrders.length === 0 ? (
          <Alert severity="info">No recent work orders for this building.</Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Scheduled</TableCell>
                  <TableCell>Completed</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {building.workOrders.map(wo => (
                  <TableRow
                    key={wo.id}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, '&:last-child td': { border: 0 } }}
                    onClick={() => navigate(`/work-orders/${wo.id}`)}
                  >
                    <TableCell><Typography variant="body2">{wo.title}</Typography></TableCell>
                    <TableCell><Chip label={wo.priority} size="small" color={PRIORITY_COLOR[wo.priority]} variant="outlined" /></TableCell>
                    <TableCell><Chip label={wo.status.replace('_', ' ')} size="small" color={STATUS_COLOR[wo.status]} /></TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {wo.scheduledDate ? new Date(wo.scheduledDate).toLocaleDateString() : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {wo.completedDate ? new Date(wo.completedDate).toLocaleDateString() : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell><Typography variant="caption" color="primary">View</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
    </Box>
  )
}

export default BuildingDetailPage
