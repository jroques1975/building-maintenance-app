import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Issue, IssueFilter, IssueStatus, Priority } from '@shared/types'

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

// Mock data for development
const mockIssues: Issue[] = [
  {
    id: '304',
    title: 'AC Failed - No Cooling',
    description: 'Living room AC completely dead, tenant reports 85°F interior temp',
    priority: 'high',
    status: 'open',
    category: 'HVAC',
    reporterId: 'tenant-304',
    assigneeId: 'tech-j',
    buildingId: 'building-a',
    unitNumber: '304',
    createdAt: new Date('2026-02-19T10:30:00'),
    updatedAt: new Date('2026-02-19T10:30:00'),
  },
  {
    id: '205',
    title: 'Leaky Kitchen Faucet',
    description: 'Kitchen faucet leaking continuously, water pooling under sink',
    priority: 'high',
    status: 'in_progress',
    category: 'Plumbing',
    reporterId: 'tenant-205',
    assigneeId: 'plumber-m',
    buildingId: 'building-a',
    unitNumber: '205',
    createdAt: new Date('2026-02-18T14:20:00'),
    updatedAt: new Date('2026-02-18T14:20:00'),
  },
  {
    id: '102',
    title: 'Exterior Paint Peeling',
    description: 'South wall exterior paint peeling due to sun exposure, needs repainting',
    priority: 'low',
    status: 'open',
    category: 'Maintenance',
    reporterId: 'tenant-102',
    buildingId: 'building-a',
    unitNumber: '102',
    createdAt: new Date('2026-02-16T09:15:00'),
    updatedAt: new Date('2026-02-16T09:15:00'),
  },
]

const mockActivities: Activity[] = [
  { id: '1', action: 'J. assigned #304 to HVAC Tech', time: '10:30 AM' },
  { id: '2', action: 'M. completed #201 repair - leak fixed', time: '9:45 AM' },
  { id: '3', action: 'S. updated status on #198 - awaiting parts', time: '9:30 AM' },
  { id: '4', action: 'Emergency mode activated - Hurricane prep', time: 'Yesterday 5:00 PM' },
]

// Async thunks would go here for real API calls
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        issues: mockIssues,
        stats: initialState.stats,
        activities: mockActivities,
      }
    } catch (error) {
      return rejectWithValue('Failed to fetch dashboard data')
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