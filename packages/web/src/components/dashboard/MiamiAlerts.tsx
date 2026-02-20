import React from 'react'
import { Card, CardContent, CardHeader, Alert, Typography, Box } from '@mui/material'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import WarningIcon from '@mui/icons-material/Warning'

interface MiamiAlertsProps {
  emergencyMode: boolean
}

const MiamiAlerts: React.FC<MiamiAlertsProps> = ({ emergencyMode }) => {
  return (
    <Card>
      <CardHeader title="Miami Alerts" />
      <CardContent>
        {emergencyMode ? (
          <Alert
            severity="error"
            icon={<WarningIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              🚨 HURRICANE WARNING ACTIVE
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">✅ Contacted all tenants</Typography>
              <Typography variant="body2">✅ Board-up supplies ordered</Typography>
              <Typography variant="body2">✅ Generator fuel stocked</Typography>
              <Typography variant="body2">⏳ Awaiting storm path update</Typography>
            </Box>
          </Alert>
        ) : (
          <Alert
            severity="warning"
            icon={<WbSunnyIcon />}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              🌡️ Heat Wave Alert
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Expect increased AC issues this week. High temperatures forecasted.
              Monitor HVAC systems closely.
            </Typography>
          </Alert>
        )}

        {/* Additional alerts */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Current Conditions:</strong> Sunny, 78°F
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            <strong>Forecast:</strong> No precipitation expected next 24h
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            <strong>School/Work Commute (8:00 AM - 5:30 PM):</strong> Normal conditions
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default MiamiAlerts