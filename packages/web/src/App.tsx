import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store'
import { fetchDashboardData } from './store/dashboardSlice'
import { verifyAuth, getCurrentUser } from './store/authSlice'

import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import IssueDetailPage from './pages/IssueDetailPage'
import Layout from './components/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  // Check authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        // First verify if token is valid
        const isValid = await dispatch(verifyAuth()).unwrap()
        if (isValid) {
          // Token is valid, fetch current user data
          await dispatch(getCurrentUser()).unwrap()
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
      }
    }

    initAuth()
  }, [dispatch])

  // Fetch dashboard data only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDashboardData())
    }
  }, [dispatch, isAuthenticated])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading application...</div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
        } />
        
        {/* Protected routes wrapped with Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/issues/:id" element={
          <ProtectedRoute>
            <Layout>
              <IssueDetailPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App