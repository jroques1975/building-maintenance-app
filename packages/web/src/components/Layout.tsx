import React from 'react'
import { AppBar, Toolbar, Typography, Box, Container } from '@mui/material'
import { useAppSelector } from '../store'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth)
  const { emergencyMode } = useAppSelector((state) => state.dashboard)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: emergencyMode ? '#DC3545' : 'primary.main',
          transition: 'background-color 0.3s ease',
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🏢 Building Maintenance App
            {emergencyMode && (
              <Typography component="span" sx={{ ml: 2, fontSize: '0.875rem', opacity: 0.9 }}>
                🚨 EMERGENCY MODE ACTIVE
              </Typography>
            )}
          </Typography>
          <Typography variant="body2">
            {user?.firstName} {user?.lastName} ({user?.role})
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.grey[100],
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Building Maintenance App • Prototype v1.0
        </Typography>
      </Box>
    </Box>
  )
}

export default Layout