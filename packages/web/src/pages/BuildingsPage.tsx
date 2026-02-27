import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Card, CardContent, Grid, Alert, CircularProgress,
  Button, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField,
} from '@mui/material'
import {
  Apartment as BuildingIcon,
  People as PeopleIcon,
  Assignment as IssueIcon,
  Build as WOIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { tokenService } from '../services/authService'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function authFetch(path: string, options?: RequestInit) {
  const token = tokenService.getToken()
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).message || `Request failed (${res.status})`)
  }
  return res.json()
}

const EMPTY_FORM = {
  name: '', address: '', city: '', state: '', zipCode: '',
  yearBuilt: '', floors: '', totalUnits: '', notes: '',
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
  _count: { units: number; issues: number; workOrders: number; users: number }
}

const BuildingsPage: React.FC = () => {
  const navigate = useNavigate()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const json = await authFetch('/buildings')
      setBuildings(json?.data?.buildings ?? [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load buildings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openDialog = () => { setForm(EMPTY_FORM); setFormError(null); setDialogOpen(true) }
  const closeDialog = () => { if (!saving) setDialogOpen(false) }

  const handleCreate = async () => {
    if (!form.name || !form.address || !form.city || !form.state || !form.zipCode) {
      setFormError('Name, address, city, state, and zip code are required.')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      await authFetch('/buildings', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          ...(form.yearBuilt ? { yearBuilt: parseInt(form.yearBuilt) } : {}),
          ...(form.floors ? { floors: parseInt(form.floors) } : {}),
          ...(form.totalUnits ? { totalUnits: parseInt(form.totalUnits) } : {}),
          ...(form.notes ? { notes: form.notes } : {}),
        }),
      })
      setDialogOpen(false)
      load()
    } catch (e: any) {
      setFormError(e?.message || 'Failed to create building')
    } finally {
      setSaving(false)
    }
  }

  const totalUnits = buildings.reduce((s, b) => s + b._count.units, 0)
  const totalIssues = buildings.reduce((s, b) => s + b._count.issues, 0)
  const totalWOs = buildings.reduce((s, b) => s + b._count.workOrders, 0)

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Buildings</Typography>
          <Typography variant="body2" color="text.secondary">Portfolio overview — click a building for details</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={load}>Refresh</Button>
          <Button variant="contained" onClick={openDialog}>New Building</Button>
        </Stack>
      </Box>

      {/* Summary stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Buildings', value: buildings.length, color: 'primary.main' },
          { label: 'Total Units', value: totalUnits, color: 'info.main' },
          { label: 'Total Issues', value: totalIssues, color: 'warning.main' },
          { label: 'Work Orders', value: totalWOs, color: 'success.main' },
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

      {/* Building list */}
      {loading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : buildings.length === 0 ? (
        <Alert severity="info">No buildings found in your portfolio.</Alert>
      ) : (
        <Grid container spacing={2}>
          {buildings.map(b => (
            <Grid item xs={12} md={6} key={b.id}>
              <Card
                variant="outlined"
                sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
                onClick={() => navigate(`/buildings/${b.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        <BuildingIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {b.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {b.address}, {b.city}, {b.state} {b.zipCode}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, ml: 1 }}>
                      {b.yearBuilt && (
                        <Chip label={`Built ${b.yearBuilt}`} size="small" variant="outlined" />
                      )}
                      {b.floors && (
                        <Chip label={`${b.floors}F`} size="small" variant="outlined" />
                      )}
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {b._count.units} units · {b._count.users} users
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IssueIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {b._count.issues} issues
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <WOIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {b._count.workOrders} work orders
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {/* Create dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>New Building</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Building Name" required fullWidth size="small"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Address" required fullWidth size="small"
              value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="City" required fullWidth size="small"
                  value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="State" required fullWidth size="small" inputProps={{ maxLength: 2 }}
                  value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Zip" required fullWidth size="small"
                  value={form.zipCode} onChange={e => setForm(f => ({ ...f, zipCode: e.target.value }))}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Year Built" fullWidth size="small" type="number"
                  value={form.yearBuilt} onChange={e => setForm(f => ({ ...f, yearBuilt: e.target.value }))}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Floors" fullWidth size="small" type="number"
                  value={form.floors} onChange={e => setForm(f => ({ ...f, floors: e.target.value }))}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Total Units" fullWidth size="small" type="number"
                  value={form.totalUnits} onChange={e => setForm(f => ({ ...f, totalUnits: e.target.value }))}
                />
              </Grid>
            </Grid>
            <TextField
              label="Notes" fullWidth size="small" multiline minRows={3}
              inputProps={{ maxLength: 1000 }}
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating...' : 'Create Building'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BuildingsPage
