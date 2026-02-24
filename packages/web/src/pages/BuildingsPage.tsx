import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Card, CardContent, Grid, Alert, CircularProgress,
  Button, Chip, Stack,
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
        <Button variant="outlined" onClick={load}>Refresh</Button>
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
    </Box>
  )
}

export default BuildingsPage
