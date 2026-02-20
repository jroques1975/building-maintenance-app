import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User, LoginDto, CreateUserDto } from '@shared/types'
import { authService, tokenService } from '../services/authService'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Try to restore user from localStorage on initial load
const savedUser = tokenService.getUser()

const initialState: AuthState = {
  user: savedUser,
  isAuthenticated: !!savedUser,
  isLoading: false,
  error: null,
}

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginDto, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: CreateUserDto, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      return null
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed')
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser()
      return user
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user')
    }
  }
)

export const verifyAuth = createAsyncThunk(
  'auth/verifyAuth',
  async (_, { rejectWithValue }) => {
    try {
      const isValid = await authService.verifyToken()
      return isValid
    } catch (error: any) {
      return rejectWithValue(error.message || 'Authentication verification failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string || 'Login failed'
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string || 'Registration failed'
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string || 'Logout failed'
        // Still clear local state even if API call fails
        state.user = null
        state.isAuthenticated = false
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string || 'Failed to fetch user'
        state.isAuthenticated = false
        state.user = null
      })
      // Verify auth
      .addCase(verifyAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.isLoading = false
        if (!action.payload) {
          state.isAuthenticated = false
          state.user = null
        }
      })
      .addCase(verifyAuth.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer