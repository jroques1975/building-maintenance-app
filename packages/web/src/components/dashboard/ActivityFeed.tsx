import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useAppSelector, useAppDispatch } from '../../store'
import { fetchDashboardData } from '../../store/dashboardSlice'

const ActivityFeed: React.FC = () => {
  const dispatch = useAppDispatch()
  const { activities } = useAppSelector((state) => state.dashboard)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await dispatch(fetchDashboardData()).unwrap()
    } catch {
      // ignore — dashboard already shows error state
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Card>
      <CardHeader
        title="Recent Activity"
        action={
          <IconButton onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        }
      />
      <CardContent sx={{ maxHeight: 300, overflowY: 'auto' }}>
        {activities.length === 0 ? (
          <Typography color="text.secondary" align="center" py={3}>
            No recent activity
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activities.slice(0, 8).map((activity) => (
              <Box
                key={activity.id}
                sx={{
                  p: 1.5,
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 0 },
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {activity.action}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Based on recently updated issues · {activities.length} shown
        </Typography>
      </CardContent>
    </Card>
  )
}

export default ActivityFeed
