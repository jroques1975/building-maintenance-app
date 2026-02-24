import React, { useEffect, useState, useMemo } from 'react'
import {
  Box, Typography, Card, CardContent, Chip, Grid, Alert, CircularProgress,
  Tabs, Tab, TextField, InputAdornment, Stack, Button,
} from '@mui/material'
import { Assignment as IssueIcon, Search as SearchIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { Issue } from '@shared/types'
import issueService from '../services/issueService'

const STATUS_COLOR: Record<string, any> = {
  PENDING: 'default', IN_REVIEW: 'info', SCHEDULED: 'info',
  IN_PROGRESS: 'warning', COMPLETED: 'success', CANCELLED: 'error',
}
const PRIORITY_COLOR: Record<string, any> = {
  LOW: 'success', MEDIUM: 'info', HIGH: 'warning', URGENT: 'error',
}

const TABS = [
  { label: 'Open', statuses: ['PENDING', 'IN_REVIEW', 'SCHEDULED', 'IN_PROGRESS'] },
  { label: 'Completed', statuses: ['COMPLETED'] },
  { label: 'All', statuses: [] },
]

const IssuesPage: React.FC = () => {
  const navigate = useNavigate()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await issueService.getIssues()
      setIssues(res.data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load issues')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let list = issues
    const tabStatuses = TABS[tab].statuses
    if (tabStatuses.length > 0) {
      list = list.filter(i => tabStatuses.includes(i.status))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.category ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [issues, tab, search])

  const stats = useMemo(() => ({
    open: issues.filter(i => ['PENDING', 'IN_REVIEW', 'SCHEDULED', 'IN_PROGRESS'].includes(i.status)).length,
    urgent: issues.filter(i => i.priority === 'URGENT').length,
    completed: issues.filter(i => i.status === 'COMPLETED').length,
    total: issues.length,
  }), [issues])

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Issues</Typography>
          <Typography variant="body2" color="text.secondary">All maintenance requests across your portfolio</Typography>
        </Box>
        <Button variant="outlined" onClick={load}>Refresh</Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total', value: stats.total, color: 'primary.main' },
          { label: 'Open', value: stats.open, color: 'warning.main' },
          { label: 'Urgent', value: stats.urgent, color: 'error.main' },
          { label: 'Completed', value: stats.completed, color: 'success.main' },
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

      {/* Search + Tabs */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems="center">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          {TABS.map((t) => (
            <Tab key={t.label} label={`${t.label} (${
              t.statuses.length > 0
                ? issues.filter(issue => t.statuses.includes(issue.status)).length
                : issues.length
            })`} />
          ))}
        </Tabs>
        <TextField
          size="small"
          placeholder="Search title, description, category…"
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
    </Box>
  )
}

export default IssuesPage
