import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Container, 
  Button, 
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip
} from '@mui/material'
import { Logout as LogoutIcon, AccountCircle } from '@mui/icons-material'
import { useAppSelector, useAppDispatch } from '../store'
import { logout } from '../store/authSlice'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const { emergencyMode } = useAppSelector((state) => state.dashboard)

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleClose()
    try {
      await dispatch(logout()).unwrap()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleProfile = () => {
    handleClose()
    // Navigate to profile page when implemented
    // navigate('/profile')
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'TENANT': return 'Tenant'
      case 'MAINTENANCE': return 'Maintenance'
      case 'MANAGER': return 'Manager'
      case 'ADMIN': return 'Admin'
      case 'SUPER_ADMIN': return 'Super Admin'
      case 'BUILDING_OWNER': return 'Building Owner'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'TENANT': return 'success'
      case 'MAINTENANCE': return 'warning'
      case 'MANAGER': return 'info'
      case 'ADMIN': return 'error'
      case 'SUPER_ADMIN': return 'secondary'
      case 'BUILDING_OWNER': return 'primary'
      default: return 'default'
    }
  }

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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
            🏢 Building Maintenance App
            {emergencyMode && (
              <Chip 
                label="EMERGENCY MODE" 
                size="small" 
                sx={{ 
                  ml: 2, 
                  backgroundColor: 'white', 
                  color: '#DC3545',
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
                }} 
              />
            )}
          </Typography>
          
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                label={getRoleLabel(user.role)} 
                color={getRoleColor(user.role) as any}
                size="small"
                variant="outlined"
                sx={{ borderColor: 'white', color: 'white' }}
              />
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user.firstName} {user.lastName}
              </Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleProfile}>
                  <AccountCircle sx={{ mr: 1 }} fontSize="small" />
                  My Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
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
          © {new Date().getFullYear()} Building Maintenance App • Miami Properties v1.0
        </Typography>
      </Box>
    </Box>
  )
}

export default Layout