import React, { useEffect, useState, useMemo } from 'react'
import {
  Box, Typography, Card, CardContent, Chip, Grid, Alert, CircularProgress,
  TextField, InputAdornment, Stack, Button, Tabs, Tab, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem,
  Tooltip, IconButton,
} from '@mui/material'
import { Search as SearchIcon, Person as PersonIcon, Add as AddIcon, Block as BlockIcon } from '@mui/icons-material'
import { tokenService } from '../services/authService'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function authFetch(path: string, options: RequestInit = {}) {
  const token = tokenService.getToken()
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
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
  createdAt: string
  building?: { id: string; name: string; address: string }
  unit?: { id: string; unitNumber: string; type: string }
  _count?: { submittedIssues: number; assignedWorkOrders: number }
}

interface Building { id: string; name: string; address: string }

const ROLE_COLOR: Record<string, any> = {
  TENANT: 'success', MAINTENANCE: 'warning', MANAGER: 'info',
  ADMIN: 'error', SUPER_ADMIN: 'secondary', BUILDING_OWNER: 'primary',
}

const ROLE_LABEL: Record<string, string> = {
  TENANT: 'Tenant', MAINTENANCE: 'Maintenance', MANAGER: 'Manager',
  ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin', BUILDING_OWNER: 'Building Owner',
}

const ROLE_TABS = ['All', 'MANAGER', 'MAINTENANCE', 'ADMIN']

function initials(u: UserRecord) {
  return `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase()
}

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  role: 'MAINTENANCE', position: '', employeeId: '',
  buildingId: '', password: 'Password123!',
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleTab, setRoleTab] = useState(0)

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [formError, setFormError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  // Deactivate confirm dialog
  const [deactivateTarget, setDeactivateTarget] = useState<UserRecord | null>(null)
  const [deactivating, setDeactivating] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersJson, buildingsJson] = await Promise.allSettled([
        authFetch('/users?limit=100'),
        authFetch('/buildings'),
      ])
      if (usersJson.status === 'fulfilled') setUsers(usersJson.value?.data?.users ?? [])
      if (buildingsJson.status === 'fulfilled') setBuildings(buildingsJson.value?.data?.buildings ?? [])
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
    if (role !== 'All') list = list.filter(u => u.role === role)
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
    managers: users.filter(u => u.role === 'MANAGER').length,
    maintenance: users.filter(u => u.role === 'MAINTENANCE').length,
    admins: users.filter(u => ['ADMIN', 'SUPER_ADMIN'].includes(u.role)).length,
  }), [users])

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      setFormError('First name, last name, and email are required')
      return
    }
    setCreating(true)
    setFormError(null)
    try {
      await authFetch('/users', {
        method: 'POST',
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || undefined,
          role: form.role,
          position: form.position || undefined,
          employeeId: form.employeeId || undefined,
          buildingId: form.buildingId || undefined,
          password: form.password,
        }),
      })
      setCreateOpen(false)
      setForm({ ...EMPTY_FORM })
      await load()
    } catch (e: any) {
      setFormError(e?.message || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivateTarget) return
    setDeactivating(true)
    try {
      await authFetch(`/users/${deactivateTarget.id}`, { method: 'DELETE' })
      setDeactivateTarget(null)
      await load()
    } catch (e: any) {
      setError(e?.message || 'Failed to deactivate user')
      setDeactivateTarget(null)
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Users</Typography>
          <Typography variant="body2" color="text.secondary">Staff members across your portfolio</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={load}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            New User
          </Button>
        </Stack>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Staff', value: stats.total, color: 'primary.main' },
          { label: 'Managers', value: stats.managers, color: 'info.main' },
          { label: 'Maintenance', value: stats.maintenance, color: 'warning.main' },
          { label: 'Admins', value: stats.admins, color: 'error.main' },
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
                      <Typography variant="subtitle2" fontWeight={600} noWrap>
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {user.email}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
                      <Chip
                        label={ROLE_LABEL[user.role] ?? user.role}
                        color={ROLE_COLOR[user.role] ?? 'default'}
                        size="small"
                        variant="outlined"
                      />
                      <Tooltip title="Deactivate user">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeactivateTarget(user)}
                        >
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  {user.building && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                      {user.building.name}
                      {user.unit ? ` · Unit ${user.unit.unitNumber}` : ''}
                    </Typography>
                  )}

                  {(user.position || user.employeeId) && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      {user.position ?? ''}{user.position && user.employeeId ? ' · ' : ''}{user.employeeId ? `#${user.employeeId}` : ''}
                    </Typography>
                  )}

                  {user._count && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {user._count.submittedIssues > 0 && (
                        <Chip label={`${user._count.submittedIssues} issue${user._count.submittedIssues !== 1 ? 's' : ''}`} size="small" variant="outlined" />
                      )}
                      {user._count.assignedWorkOrders > 0 && (
                        <Chip label={`${user._count.assignedWorkOrders} WO${user._count.assignedWorkOrders !== 1 ? 's' : ''}`} size="small" variant="outlined" />
                      )}
                    </Stack>
                  )}

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={!!deactivateTarget} onClose={() => setDeactivateTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Deactivate User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate{' '}
            <strong>{deactivateTarget?.firstName} {deactivateTarget?.lastName}</strong>?
            They will no longer be able to log in.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeactivateTarget(null)} color="inherit">Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeactivate} disabled={deactivating}>
            {deactivating ? <CircularProgress size={20} /> : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Staff Member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <Stack direction="row" spacing={2}>
              <TextField
                label="First name" required size="small" fullWidth
                value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              />
              <TextField
                label="Last name" required size="small" fullWidth
                value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              />
            </Stack>

            <TextField
              label="Email" required size="small" fullWidth type="email"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />

            <TextField
              label="Phone" size="small" fullWidth
              value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />

            <FormControl size="small" fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select value={form.role} label="Role" onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Building (optional)</InputLabel>
              <Select
                value={form.buildingId}
                label="Building (optional)"
                onChange={e => setForm(f => ({ ...f, buildingId: e.target.value }))}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {buildings.map(b => (
                  <MenuItem key={b.id} value={b.id}>{b.name} — {b.address}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Position / title" size="small" fullWidth
                value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
              />
              <TextField
                label="Employee ID" size="small" fullWidth
                value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
              />
            </Stack>

            <TextField
              label="Temporary password" required size="small" fullWidth
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              helperText="Min 8 chars, must include uppercase, number, and special character"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={creating}>
            {creating ? <CircularProgress size={20} /> : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UsersPage
