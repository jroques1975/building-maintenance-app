import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Card, CardContent, Grid, Chip, Alert, CircularProgress,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, Button, Collapse,
} from '@mui/material'
import { Apartment as BuildingIcon, History as HistoryIcon, ExpandMore, ExpandLess } from '@mui/icons-material'
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

interface OperatorPeriod {
  id: string
  operatorType: 'PM' | 'HOA'
  status: 'ACTIVE' | 'PENDING' | 'ENDED' | 'TERMINATED' | 'RENEWED'
  startDate: string
  endDate?: string
  handoffNotes?: string
  createdAt: string
  managementCompany?: { id: string; name: string }
  hoaOrganization?: { id: string; name: string }
  _count?: { issues: number; workOrders: number }
}

interface BuildingWithOperator {
  id: string
  name: string
  address: string
  city: string
  state: string
  totalUnits?: number
  currentOperatorPeriod?: OperatorPeriod
  _count: { issues: number; workOrders: number; units: number }
}

const STATUS_COLOR: Record<string, any> = {
  ACTIVE: 'success', PENDING: 'info', ENDED: 'default',
  TERMINATED: 'error', RENEWED: 'warning',
}

const BuildingRow: React.FC<{ building: BuildingWithOperator }> = ({ building }) => {
  const [open, setOpen] = useState(false)
  const [timeline, setTimeline] = useState<OperatorPeriod[]>([])
  const [loadingTimeline, setLoadingTimeline] = useState(false)
  const [timelineError, setTimelineError] = useState<string | null>(null)

  const handleToggle = async () => {
    if (!open && timeline.length === 0) {
      setLoadingTimeline(true)
      setTimelineError(null)
      try {
        const json = await authFetch(`/buildings/${building.id}/operator-timeline`)
        setTimeline(json?.data?.timeline ?? [])
      } catch (e: any) {
        setTimelineError(e?.message || 'Failed to load timeline')
      } finally {
        setLoadingTimeline(false)
      }
    }
    setOpen(prev => !prev)
  }

  const operator = building.currentOperatorPeriod
  const operatorName = operator?.managementCompany?.name ?? operator?.hoaOrganization?.name ?? 'Unassigned'

  return (
    <Box sx={{ mb: 2 }}>
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                <BuildingIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                {building.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {building.address}, {building.city}, {building.state}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary">
                  {building._count.units} units
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {building._count.issues} issues
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {building._count.workOrders} work orders
                </Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'right', ml: 2 }}>
              {operator ? (
                <>
                  <Chip
                    label={operator.status}
                    color={STATUS_COLOR[operator.status]}
                    size="small"
                    sx={{ mb: 0.5 }}
                  />
                  <Typography variant="body2" fontWeight={500}>{operatorName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {operator.operatorType} · Since {new Date(operator.startDate).toLocaleDateString()}
                  </Typography>
                </>
              ) : (
                <Chip label="No Active Operator" size="small" color="default" />
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              startIcon={<HistoryIcon />}
              endIcon={open ? <ExpandLess /> : <ExpandMore />}
              onClick={handleToggle}
            >
              Operator Timeline
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Collapse in={open}>
        <Paper variant="outlined" sx={{ mx: 1, mt: -1, pt: 1, borderTop: 0, borderRadius: '0 0 16px 16px' }}>
          {loadingTimeline ? (
            <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : timelineError ? (
            <Alert severity="error" sx={{ m: 2 }}>{timelineError}</Alert>
          ) : timeline.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
              No operator history found.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Operator</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell align="right">Issues</TableCell>
                    <TableCell align="right">Work Orders</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeline.map(period => (
                    <TableRow key={period.id} sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        {period.managementCompany?.name ?? period.hoaOrganization?.name ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Chip label={period.operatorType} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip label={period.status} size="small" color={STATUS_COLOR[period.status]} />
                      </TableCell>
                      <TableCell>{new Date(period.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {period.endDate ? new Date(period.endDate).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell align="right">{period._count?.issues ?? 0}</TableCell>
                      <TableCell align="right">{period._count?.workOrders ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {timeline.find(p => p.handoffNotes) && (
            <Box sx={{ px: 2, pb: 2 }}>
              <Divider sx={{ my: 1 }} />
              {timeline.filter(p => p.handoffNotes).map(p => (
                <Box key={p.id} sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Handoff notes ({new Date(p.startDate).toLocaleDateString()}):
                  </Typography>
                  <Typography variant="body2">{p.handoffNotes}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Collapse>
    </Box>
  )
}

const OperatorContinuityPage: React.FC = () => {
  const [buildings, setBuildings] = useState<BuildingWithOperator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const json = await authFetch('/portfolio/buildings')
        setBuildings(json?.data?.buildings ?? [])
      } catch (e: any) {
        setError(e?.message || 'Failed to load portfolio')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const active = buildings.filter(b => b.currentOperatorPeriod?.status === 'ACTIVE').length
  const unassigned = buildings.filter(b => !b.currentOperatorPeriod).length

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Operator Continuity</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Building portfolio with management history and operator transitions.
      </Typography>

      {/* Summary stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Buildings', value: buildings.length, color: 'primary.main' },
          { label: 'Active Operators', value: active, color: 'success.main' },
          { label: 'Unassigned', value: unassigned, color: 'warning.main' },
        ].map(s => (
          <Grid item xs={4} sm={3} key={s.label}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {loading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : buildings.length === 0 ? (
        <Alert severity="info">No buildings found in your portfolio.</Alert>
      ) : (
        buildings.map(building => (
          <BuildingRow key={building.id} building={building} />
        ))
      )}
    </Box>
  )
}

export default OperatorContinuityPage
