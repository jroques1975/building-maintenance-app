import React from 'react'
import { Grid, Box, Alert } from '@mui/material'
import { useAppSelector, useAppDispatch } from '../store'
import { toggleEmergencyMode, setFilter } from '../store/dashboardSlice'

import StatsCard from '../components/dashboard/StatsCard'
import IssueQueue from '../components/dashboard/IssueQueue'
import QuickActions from '../components/dashboard/QuickActions'
import EmergencyMode from '../components/dashboard/EmergencyMode'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import MiamiAlerts from '../components/dashboard/MiamiAlerts'
import PerformanceMetrics from '../components/dashboard/PerformanceMetrics'

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { stats, emergencyMode, filter } = useAppSelector((state) => state.dashboard)
  const { user } = useAppSelector((state) => state.auth)

  const handleFilterChange = (newFilter: string) => {
    // Convert string filter to IssueFilter object
    let filterObj = {}
    switch (newFilter) {
      case 'urgent':
        filterObj = { priority: 'URGENT' }
        break
      case 'mine':
        // Filter issues assigned to current user
        filterObj = { assignedToId: user?.id || '' }
        break
      case 'all':
      default:
        filterObj = {}
    }
    dispatch(setFilter(filterObj))
  }

  // Compute current filter string from filter object for UI display
  const getCurrentFilterString = () => {
    if (filter.assignedToId && user && filter.assignedToId === user.id) {
      return 'mine'
    } else if (filter.priority === 'URGENT') {
      return 'urgent'
    } else {
      return 'all'
    }
  }

  return (
    <Box>
      {/* Emergency Mode Alert */}
      {emergencyMode && (
        <Alert severity="error" sx={{ mb: 3 }}>
          🚨 HURRICANE EMERGENCY ACTIVE - Emergency workflow steps are being executed.
        </Alert>
      )}

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Open Issues"
            value={stats.openIssues}
            subtitle="Total open"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Urgent Issues"
            value={stats.urgentIssues}
            subtitle="Require immediate attention"
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Today Due"
            value={stats.todayDue}
            subtitle="Scheduled for today"
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Aging >3 days"
            value={stats.agingIssues}
            subtitle="Overdue for resolution"
            color="info"
          />
        </Grid>
      </Grid>

      {/* Main Dashboard Grid */}
      <Grid container spacing={3}>
        {/* Left Column - Issue Queue */}
        <Grid item xs={12} md={8}>
          <IssueQueue 
            onFilterChange={handleFilterChange}
            currentFilter={getCurrentFilterString()}
          />
        </Grid>

        {/* Right Column - Sidebar */}
        <Grid item xs={12} md={4}>
          <QuickActions />
          <Box sx={{ mt: 3 }}>
            <EmergencyMode 
              active={emergencyMode}
              onToggle={() => dispatch(toggleEmergencyMode())}
            />
          </Box>
          <Box sx={{ mt: 3 }}>
            <ActivityFeed />
          </Box>
          <Box sx={{ mt: 3 }}>
            <MiamiAlerts emergencyMode={emergencyMode} />
          </Box>
        </Grid>

        {/* Performance Metrics (Full Width) */}
        <Grid item xs={12}>
          <PerformanceMetrics stats={stats} />
        </Grid>
      </Grid>

      {/* Development Note */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <strong>React Dashboard Prototype</strong> - This is a React conversion of the enhanced HTML prototype.
        Features: Redux state management, Material-UI components, TypeScript types, and mock API layer.
      </Alert>
    </Box>
  )
}

export default DashboardPage