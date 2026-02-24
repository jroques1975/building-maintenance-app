import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Issue, IssueFilter } from '@shared/types'
import { tokenService } from '../services/authService'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function apiFetch(path: string, token: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

interface DashboardStats {
  openIssues: number
  urgentIssues: number
  todayDue: number
  agingIssues: number
  avgResponseTime: string
  avgCompletionTime: string
  tenantSatisfaction: number
  costPerUnit: number
}

interface Activity {
  id: string
  action: string
  time: string
  userId?: string
}

interface DashboardState {
  issues: Issue[]
  filteredIssues: Issue[]
  stats: DashboardStats
  activities: Activity[]
  isLoading: boolean
  error: string | null
  filter: IssueFilter
  emergencyMode: boolean
}

const initialState: DashboardState = {
  issues: [],
  filteredIssues: [],
  stats: {
    openIssues: 0,
    urgentIssues: 0,
    todayDue: 0,
    agingIssues: 0,
    avgResponseTime: '4.2h',
    avgCompletionTime: '1.8d',
    tenantSatisfaction: 92,
    costPerUnit: 45,
  },
  activities: [],
  isLoading: false,
  error: null,
  filter: {},
  emergencyMode: false,
}

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const token = tokenService.getToken()
      if (!token) return rejectWithValue('Not authenticated')

      const [issuesJson, statsJson] = await Promise.all([
        apiFetch('/issues', token),
        apiFetch('/issues/stats/summary', token),
      ])

      const issues: Issue[] = issuesJson?.data?.issues ?? []
      const statsData = statsJson?.data ?? {}

      const byStatus: { status: string; _count: number }[] = statsData.byStatus ?? []
      const byPriority: { priority: string; _count: number }[] = statsData.byPriority ?? []

      const openStatuses = ['PENDING', 'IN_REVIEW', 'SCHEDULED', 'IN_PROGRESS']
      const openIssues = byStatus
        .filter(s => openStatuses.includes(s.status))
        .reduce((sum, s) => sum + s._count, 0)
      const urgentIssues = byPriority.find(p => p.priority === 'URGENT')?._count ?? 0

      // Compute todayDue: issues scheduled for today that are not completed/cancelled
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)
      const todayDue = issues.filter(i => {
        if (!i.scheduledDate) return false
        const d = new Date(i.scheduledDate)
        return d >= todayStart && d <= todayEnd && !['COMPLETED', 'CANCELLED'].includes(i.status)
      }).length

      // Compute agingIssues: open issues older than 3 days
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      const agingIssues = issues.filter(i =>
        openStatuses.includes(i.status) && new Date(i.createdAt) < threeDaysAgo
      ).length

      // Compute avgCompletionTime from completed issues
      const completedWithDate = issues.filter(i => i.status === 'COMPLETED' && i.completedDate)
      let avgCompletionTime = '—'
      if (completedWithDate.length > 0) {
        const avgMs = completedWithDate.reduce((sum, i) => {
          return sum + (new Date(i.completedDate!).getTime() - new Date(i.createdAt).getTime())
        }, 0) / completedWithDate.length
        const avgDays = avgMs / (1000 * 60 * 60 * 24)
        avgCompletionTime = avgDays < 1 ? `${Math.round(avgDays * 24)}h` : `${avgDays.toFixed(1)}d`
      }

      // Derive activity feed from 8 most recently updated issues
      const activities: Activity[] = [...issues]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 8)
        .map(i => ({
          id: i.id,
          action: `"${i.title.substring(0, 45)}${i.title.length > 45 ? '…' : ''}" — ${i.status.replace(/_/g, ' ')}`,
          time: new Date(i.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }))

      return {
        issues,
        stats: {
          openIssues,
          urgentIssues,
          todayDue,
          agingIssues,
          avgResponseTime: '—',
          avgCompletionTime,
          tenantSatisfaction: 0,
          costPerUnit: 0,
        },
        activities,
      }
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch dashboard data')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<IssueFilter>) => {
      state.filter = action.payload
      // Apply filter logic
      const { priority, status, category } = action.payload
      state.filteredIssues = state.issues.filter(issue => {
        if (priority && issue.priority !== priority) return false
        if (status && issue.status !== status) return false
        if (category && issue.category !== category) return false
        return true
      })
    },
    toggleEmergencyMode: (state) => {
      state.emergencyMode = !state.emergencyMode
    },
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.activities.unshift(action.payload)
      if (state.activities.length > 15) state.activities.pop()
    },
    updateStats: (state, action: PayloadAction<Partial<DashboardStats>>) => {
      state.stats = { ...state.stats, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false
        state.issues = action.payload.issues
        state.filteredIssues = action.payload.issues
        state.stats = action.payload.stats
        state.activities = action.payload.activities
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setFilter, toggleEmergencyMode, addActivity, updateStats } = dashboardSlice.actions
export default dashboardSlice.reducer