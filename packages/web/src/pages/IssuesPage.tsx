import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Card, CardContent, Chip, Grid, Alert, CircularProgress,
  Tabs, Tab, TextField, InputAdornment, Stack, Button,
} from '@mui/material'
import { Assignment as IssueIcon, Search as SearchIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { Issue } from '@shared/types'
import issueService from '../services/issueService'
import { tokenService } from '../services/authService'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const STATUS_COLOR: Record<string, any> = {
  PENDING: 'default', IN_REVIEW: 'info', SCHEDULED: 'info',
  IN_PROGRESS: 'warning', COMPLETED: 'success', CANCELLED: 'error',
}
const PRIORITY_COLOR: Record<string, any> = {
  LOW: 'success', MEDIUM: 'info', HIGH: 'warning', URGENT: 'error',
}

// null = no status filter (All)
const TABS: { label: string; status: string | null }[] = [
  { label: 'All', status: null },
  { label: 'Pending', status: 'PENDING' },
  { label: 'In Progress', status: 'IN_PROGRESS' },
  { label: 'Completed', status: 'COMPLETED' },
]

const PAGE_LIMIT = 20

interface Meta { total: number; page: number; totalPages: number }
interface StatusCounts { PENDING: number; IN_PROGRESS: number; COMPLETED: number; total: number }

const IssuesPage: React.FC = () => {
  const navigate = useNavigate()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, totalPages: 1 })
  const [counts, setCounts] = useState<StatusCounts>({ PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, total: 0 })

  const currentStatus = TABS[tab].status

  // Debounce search input — resets page to 1 after 400ms of inactivity
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  // Fetch global counts from stats summary
  const loadCounts = async () => {
    const token = tokenService.getToken()
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/issues/stats/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const json = await res.json()
      const byStatus: { status: string; _count: number }[] = json?.data?.byStatus ?? []
      const get = (s: string) => byStatus.find(b => b.status === s)?._count ?? 0
      const total = json?.data?.total ?? 0
      setCounts({
        PENDING: get('PENDING'),
        IN_PROGRESS: get('IN_PROGRESS'),
        COMPLETED: get('COMPLETED'),
        total,
      })
    } catch {}
  }

  const load = async (p: number, status: string | null, searchTerm: string) => {
    setLoading(true)
    setError(null)
    try {
      const filter: Record<string, any> = { page: p, limit: PAGE_LIMIT }
      if (status) filter.status = status
      if (searchTerm.trim()) filter.search = searchTerm.trim()
      const res = await issueService.getIssues(filter)
      setIssues(res.data)
      setMeta({ total: res.meta.total, page: res.meta.page, totalPages: res.meta.totalPages })
    } catch (e: any) {
      setError(e?.message || 'Failed to load issues')
    } finally {
      setLoading(false)
    }
  }

  // Load counts once on mount
  useEffect(() => { loadCounts() }, [])

  // Reload issues when tab, page, or debounced search changes
  useEffect(() => { load(page, currentStatus, debouncedSearch) }, [page, currentStatus, debouncedSearch])

  const handleTabChange = (_: React.SyntheticEvent, v: number) => {
    setTab(v)
    setPage(1)
    setSearch('')
  }

  // Issues are already filtered server-side; no client-side filter needed
  const filtered = issues

  const tabLabel = (t: typeof TABS[number]) => {
    if (t.status === null) return `All (${counts.total})`
    if (t.status === 'PENDING') return `Pending (${counts.PENDING})`
    if (t.status === 'IN_PROGRESS') return `In Progress (${counts.IN_PROGRESS})`
    if (t.status === 'COMPLETED') return `Completed (${counts.COMPLETED})`
    return t.label
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Issues</Typography>
          <Typography variant="body2" color="text.secondary">All maintenance requests across your portfolio</Typography>
        </Box>
        <Button variant="outlined" onClick={() => { load(page, currentStatus, debouncedSearch); loadCounts() }}>Refresh</Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total', value: counts.total, color: 'primary.main' },
          { label: 'Pending', value: counts.PENDING, color: 'warning.main' },
          { label: 'In Progress', value: counts.IN_PROGRESS, color: 'info.main' },
          { label: 'Completed', value: counts.COMPLETED, color: 'success.main' },
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
        <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          {TABS.map((t) => (
            <Tab key={t.label} label={tabLabel(t)} />
          ))}
        </Tabs>
        <TextField
          size="small"
          placeholder="Search title, description…"
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
        <Alert severity="info">No issues match the current filter.</Alert>
      ) : (
        <Grid container spacing={2}>
          {filtered.map(issue => (
            <Grid item xs={12} md={6} key={issue.id}>
              <Card
                variant="outlined"
                sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
                onClick={() => navigate(`/issues/${issue.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1, mr: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IssueIcon fontSize="small" color="action" />
                        {issue.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {issue.building?.name ?? issue.buildingId}
                        {issue.unit ? ` · Unit ${issue.unit.unitNumber}` : ''}
                        {' · '}
                        {issue.category}
                        {' · '}
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                      <Chip label={issue.priority} size="small" color={PRIORITY_COLOR[issue.priority]} variant="outlined" />
                      <Chip label={issue.status.replace('_', ' ')} size="small" color={STATUS_COLOR[issue.status]} />
                    </Stack>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {issue.description.substring(0, 100)}{issue.description.length > 100 ? '…' : ''}
                  </Typography>

                  {(issue.assignedTo || issue.assignedToId) && (
                    <Typography variant="caption" color="text.secondary">
                      Assigned: {issue.assignedTo
                        ? `${issue.assignedTo.firstName} ${issue.assignedTo.lastName}`
                        : issue.assignedToId}
                    </Typography>
                  )}
                  {issue._count && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {issue._count.comments > 0 && `${issue._count.comments} comment${issue._count.comments !== 1 ? 's' : ''}`}
                      {issue._count.workOrders > 0 && ` · ${issue._count.workOrders} work order${issue._count.workOrders !== 1 ? 's' : ''}`}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            size="small"
            disabled={page <= 1 || loading}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Typography variant="body2" color="text.secondary">
            Page {page} of {meta.totalPages} ({meta.total} total)
          </Typography>
          <Button
            variant="outlined"
            size="small"
            disabled={page >= meta.totalPages || loading}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </Stack>
      )}
    </Box>
  )
}

export default IssuesPage
