import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#007AFF',
      light: '#5A9CFF',
      dark: '#0056CC',
    },
    secondary: {
      main: '#28A745',
      light: '#5AC668',
      dark: '#1E7E34',
    },
    error: {
      main: '#DC3545',
      light: '#E57373',
      dark: '#C62828',
    },
    warning: {
      main: '#FD7E14',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    info: {
      main: '#6C757D',
      light: '#90A4AE',
      dark: '#455A64',
    },
    success: {
      main: '#20C997',
      light: '#81C784',
      dark: '#388E3C',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
})

export default theme