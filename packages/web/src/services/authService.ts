import { API_ENDPOINTS } from '@shared/constants';
import { LoginDto, AuthResponse, User, CreateUserDto } from '@shared/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const MOCK_API = String(import.meta.env.VITE_ENABLE_MOCK_API || '').toLowerCase() === 'true';

// Token storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Helper functions for token management
export const tokenService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  clear(): void {
    this.removeToken();
    this.removeUser();
  },
};

const mockUser: User = {
  id: 'mock-admin-1',
  email: 'admin@miamiproperties.com',
  firstName: 'System',
  lastName: 'Admin',
  role: 'ADMIN' as any,
  isActive: true,
};

// API service for authentication
export const authService = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    if (MOCK_API) {
      if (credentials.email !== 'admin@miamiproperties.com' || credentials.password !== 'password123') {
        throw new Error('Invalid credentials. Use admin@miamiproperties.com / password123');
      }
      const authResponse: AuthResponse = {
        user: mockUser,
        token: 'mock-token',
        refreshToken: '',
        expiresIn: 3600,
      };
      tokenService.setToken(authResponse.token);
      tokenService.setUser(authResponse.user);
      return authResponse;
    }

    const response = await fetch(`${API_BASE}${API_ENDPOINTS.auth.login}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    const backendData = data.data;
    const authResponse: AuthResponse = {
      user: backendData.user,
      token: backendData.token,
      refreshToken: '',
      expiresIn: 3600,
    };

    tokenService.setToken(authResponse.token);
    tokenService.setUser(authResponse.user);

    return authResponse;
  },

  async register(userData: CreateUserDto): Promise<AuthResponse> {
    if (MOCK_API) {
      const authResponse: AuthResponse = {
        user: {
          ...mockUser,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
        },
        token: 'mock-token',
        refreshToken: '',
        expiresIn: 3600,
      };
      tokenService.setToken(authResponse.token);
      tokenService.setUser(authResponse.user);
      return authResponse;
    }

    const response = await fetch(`${API_BASE}${API_ENDPOINTS.auth.register}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    const backendData = data.data;
    const authResponse: AuthResponse = {
      user: backendData.user,
      token: backendData.token,
      refreshToken: '',
      expiresIn: 3600,
    };

    tokenService.setToken(authResponse.token);
    tokenService.setUser(authResponse.user);

    return authResponse;
  },

  async getCurrentUser(): Promise<User> {
    if (MOCK_API) {
      const user = tokenService.getUser() || mockUser;
      tokenService.setUser(user);
      return user;
    }

    const token = tokenService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}${API_ENDPOINTS.auth.me}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        tokenService.clear();
      }
      const error = await response.json().catch(() => ({ message: 'Failed to fetch user' }));
      throw new Error(error.message || 'Failed to fetch user');
    }

    const data = await response.json();
    const user = data.data.user;
    tokenService.setUser(user);
    return user;
  },

  async logout(): Promise<void> {
    if (!MOCK_API) {
      const token = tokenService.getToken();
      if (token) {
        try {
          await fetch(`${API_BASE}${API_ENDPOINTS.auth.logout}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.error('Logout API call failed:', error);
        }
      }
    }

    tokenService.clear();
  },

  async verifyToken(): Promise<boolean> {
    const token = tokenService.getToken();
    if (!token) return false;

    if (MOCK_API) return token === 'mock-token';

    try {
      const response = await fetch(`${API_BASE}${API_ENDPOINTS.auth.me}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  },

  // Password reset functions
  async requestPasswordReset(email: string): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/request-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Password reset request failed' }));
      throw new Error(error.message || 'Password reset request failed');
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Password reset failed' }));
      throw new Error(error.message || 'Password reset failed');
    }
  },
};

export default authService;