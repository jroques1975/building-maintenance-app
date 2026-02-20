import React, { useEffect, useState } from 'react'
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
import { addActivity } from '../../store/dashboardSlice'

const ActivityFeed: React.FC = () => {
  const dispatch = useAppDispatch()
  const { activities } = useAppSelector((state) => state.dashboard)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate API call delay
    setTimeout(() => {
      dispatch(
        addActivity({
          id: `activity-${Date.now()}`,
          action: 'Manual refresh - Activity feed updated',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      )
      setIsRefreshing(false)
    }, 1000)
  }

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85 && activities.length > 0) {
        const actions = ['assigned', 'updated', 'completed', 'commented on']
        const staff = ['J.', 'M.', 'S.', 'R.', 'T.']
        const issueIds = activities
          .map((a) => a.action.match(/#(\d+)/))
          .filter(Boolean)
          .map((match) => match![1])
        if (issueIds.length > 0) {
          const randomIssue = issueIds[Math.floor(Math.random() * issueIds.length)]
          dispatch(
            addActivity({
              id: `auto-${Date.now()}`,
              action: `${staff[Math.floor(Math.random() * staff.length)]} ${
                actions[Math.floor(Math.random() * actions.length)]
              } #${randomIssue}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })
          )
        }
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [dispatch, activities])

  return (
    <Card>
      <CardHeader
        title="Activity Feed"
        action={
          <IconButton onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        }
      />
      <CardContent sx={{ maxHeight: 300, overflowY: 'auto' }}>
        {activities.length === 0 ? (
          <Typography color="text.secondary" align="center" py={3}>
            No activity yet
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
          Updates every 30 seconds • {activities.length} total activities
        </Typography>
      </CardContent>
    </Card>
  )
}

export default ActivityFeed