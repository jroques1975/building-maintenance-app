import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Alert,
} from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'

interface EmergencyModeProps {
  active: boolean
  onToggle: () => void
}

const EmergencyMode: React.FC<EmergencyModeProps> = ({ active, onToggle }) => {
  const emergencySteps = active
    ? [
        { step: 1, action: 'Contact all tenants - evacuation status', completed: true },
        { step: 2, action: 'Order board-up supplies for windows', completed: true },
        { step: 3, action: 'Check generator fuel levels', completed: true },
        { step: 4, action: 'Secure outdoor furniture & equipment', completed: false },
        { step: 5, action: 'Coordinate with emergency services', completed: false },
        { step: 6, action: 'Activate backup communication system', completed: false },
      ]
    : []

  return (
    <Card sx={{ borderColor: active ? 'error.main' : 'divider' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1, color: active ? 'error.main' : 'warning.main' }} />
            Emergency Mode
          </Box>
        }
        action={
          <FormControlLabel
            control={<Switch checked={active} onChange={onToggle} color="error" />}
            label={active ? 'ACTIVE' : 'Inactive'}
          />
        }
      />
      <CardContent>
        {active ? (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              🚨 HURRICANE EMERGENCY ACTIVE
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Emergency workflow initiated. Follow the steps below:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {emergencySteps.map((step) => (
                <Box
                  key={step.step}
                  sx={{
                    p: 1.5,
                    backgroundColor: step.completed ? 'success.50' : 'error.50',
                    borderRadius: 1,
                    borderLeft: 3,
                    borderColor: step.completed ? 'success.main' : 'error.main',
                  }}
                >
                  <Typography variant="body2">
                    <strong>Step {step.step}:</strong> {step.action}
                    {step.completed ? ' ✅' : ' ⏳'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Toggle emergency mode for hurricane preparedness workflows.
              When activated, the dashboard will switch to emergency visual mode
              and display step-by-step emergency procedures.
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              Miami-specific hurricane preparedness workflow ready.
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default EmergencyMode