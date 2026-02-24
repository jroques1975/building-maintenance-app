import React, { useEffect, useState, useMemo } from 'react'
import {
  Box, Typography, Card, CardContent, Chip, Grid, Alert, CircularProgress,
  TextField, InputAdornment, Stack, Button, Tabs, Tab, Avatar,
} from '@mui/material'
import { Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material'
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

interface UserRecord {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  isActive: boolean
  position?: string
  employeeId?: string
  apartment?: string
  lastLoginAt?: string
  createdAt: string
  building?: { id: string; name: string; address: string }
  unit?: { id: string; unitNumber: string; type: string }
  _count?: { submittedIssues: number; assignedWorkOrders: number }
}

const ROLE_COLOR: Record<string, any> = {
  TENANT: 'success', MAINTENANCE: 'warning', MANAGER: 'info',
  ADMIN: 'error', SUPER_ADMIN: 'secondary', BUILDING_OWNER: 'primary',
}

const ROLE_LABEL: Record<string, string> = {
  TENANT: 'Tenant', MAINTENANCE: 'Maintenance', MANAGER: 'Manager',
  ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin', BUILDING_OWNER: 'Building Owner',
}

const ROLE_TABS = ['All', 'TENANT', 'MAINTENANCE', 'MANAGER', 'ADMIN']

function initials(u: UserRecord) {
  return `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase()
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleTab, setRoleTab] = useState(0)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const json = await authFetch('/users?limit=100')
      setUsers(json?.data?.users ?? [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let list = users
    const role = ROLE_TABS[roleTab]
    if (role !== 'All') {
      list = list.filter(u => u.role === role)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.building?.name ?? '').toLowerCase().includes(q) ||
        (u.position ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [users, roleTab, search])

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.isActive).length,
    tenants: users.filter(u => u.role === 'TENANT').length,
    staff: users.filter(u => ['MAINTENANCE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(u.role)).length,
  }), [users])

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Users</Typography>
          <Typography variant="body2" color="text.secondary">All users across your portfolio</Typography>
        </Box>
        <Button variant="outlined" onClick={load}>Refresh</Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total', value: stats.total, color: 'primary.main' },
          { label: 'Active', value: stats.active, color: 'success.main' },
          { label: 'Tenants', value: stats.tenants, color: 'info.main' },
          { label: 'Staff', value: stats.staff, color: 'warning.main' },
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

      {/* Tabs + Search */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems="center">
        <Tabs
          value={roleTab}
          onChange={(_, v) => setRoleTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
        >
          {ROLE_TABS.map((r) => (
            <Tab
              key={r}
              label={`${r === 'All' ? 'All' : ROLE_LABEL[r]} (${
                r === 'All' ? users.length : users.filter(u => u.role === r).length
              })`}
            />
          ))}
        </Tabs>
        <TextField
          size="small"
          placeholder="Search name, email, building…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 360 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {/* List */}
      {loading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filtered.length === 0 ? (
        <Alert severity="info">No users match the current filter.</Alert>
      ) : (
        <Grid container spacing={2}>
          {filtered.map(user => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                    <Avatar sx={{ bgcolor: `${ROLE_COLOR[user.role]}.main`, width: 40, height: 40, fontSize: 14 }}>
                      {initials(user)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {user.firstName} {user.lastName}
                        </Typography>
                        {!user.isActive && (
                          <Chip label="Inactive" size="small" color="default" />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {user.email}
                      </Typography>
                    </Box>
                    <Chip
                      label={ROLE_LABEL[user.role] ?? user.role}
                      color={ROLE_COLOR[user.role] ?? 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {/* Building / unit */}
                  {user.building && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                      {user.building.name}
                      {user.unit ? ` · Unit ${user.unit.unitNumber}` : ''}
                      {user.apartment && !user.unit ? ` · Apt ${user.apartment}` : ''}
                    </Typography>
                  )}

                  {/* Position / employee ID */}
                  {(user.position || user.employeeId) && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      {user.position ?? ''}{user.position && user.employeeId ? ' · ' : ''}{user.employeeId ? `#${user.employeeId}` : ''}
                    </Typography>
                  )}

                  {/* Counts */}
                  {user._count && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {user._count.submittedIssues > 0 && (
                        <Chip
                          label={`${user._count.submittedIssues} issue${user._count.submittedIssues !== 1 ? 's' : ''}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {user._count.assignedWorkOrders > 0 && (
                        <Chip
                          label={`${user._count.assignedWorkOrders} WO${user._count.assignedWorkOrders !== 1 ? 's' : ''}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  )}

                  {/* Last login */}
                  {user.lastLoginAt && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default UsersPage
