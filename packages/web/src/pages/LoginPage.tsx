import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store';
import { login, clearError } from '../store/authSlice';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const from = (location.state as any)?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      // Navigation will happen automatically via the useEffect above
    } catch (err) {
      // Error is already handled in the slice
      console.error('Login failed:', err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <LoginIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
          <Typography component="h1" variant="h5" gutterBottom>
            Sign in to Building Maintenance
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use your email and password to access your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link href="/register" variant="body2">
                  Sign up
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                For testing: Use admin@miamiproperties.com / password123
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;