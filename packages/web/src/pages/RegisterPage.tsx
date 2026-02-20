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
  MenuItem,
} from '@mui/material';
import { HowToReg as RegisterIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store';
import { register, clearError } from '../store/authSlice';
import { UserRole } from '@shared/types';

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'TENANT' as UserRole,
    buildingId: '',
    apartment: '',
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

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value as UserRole,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(register(formData)).unwrap();
      // Navigation will happen automatically via the useEffect above
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'TENANT', label: 'Tenant' },
    { value: 'MAINTENANCE', label: 'Maintenance Staff' },
    { value: 'MANAGER', label: 'Property Manager' },
    { value: 'ADMIN', label: 'Administrator' },
  ];

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 8,
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
          <RegisterIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
          <Typography component="h1" variant="h5" gutterBottom>
            Create a new account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fill in your details to create a Building Maintenance account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
              />
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </Box>

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              helperText="Minimum 8 characters"
            />

            <TextField
              margin="normal"
              fullWidth
              id="phone"
              label="Phone Number"
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
            />

            <TextField
              margin="normal"
              select
              fullWidth
              id="role"
              label="Account Type"
              name="role"
              value={formData.role}
              onChange={handleSelectChange}
              disabled={isLoading}
              helperText="Select your role in the building"
            >
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              margin="normal"
              fullWidth
              id="buildingId"
              label="Building ID (Optional)"
              name="buildingId"
              value={formData.buildingId}
              onChange={handleChange}
              disabled={isLoading}
              helperText="If you know your building identifier"
            />

            <TextField
              margin="normal"
              fullWidth
              id="apartment"
              label="Apartment/Unit (Optional)"
              name="apartment"
              value={formData.apartment}
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
              {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link href="/login" variant="body2">
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;