import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store'
import { verifyAuth, getCurrentUser } from './store/authSlice'
import { CircularProgress, Box } from '@mui/material'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Layout from './components/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const IssueDetailPage = lazy(() => import('./pages/IssueDetailPage'))
const WorkOrdersPage = lazy(() => import('./pages/WorkOrdersPage'))
const WorkOrderDetailPage = lazy(() => import('./pages/WorkOrderDetailPage'))
const OperatorContinuityPage = lazy(() => import('./pages/OperatorContinuityPage'))
const IssuesPage = lazy(() => import('./pages/IssuesPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const BuildingsPage = lazy(() => import('./pages/BuildingsPage'))
const BuildingDetailPage = lazy(() => import('./pages/BuildingDetailPage'))

const PageLoader = () => (
  <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
    <CircularProgress />
  </Box>
)

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  // Check authentication on app load
  // Note: fetchDashboardData is dispatched by each role-specific dashboard page
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

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading application...</div>
      </div>
    )
  }

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
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

          <Route path="/work-orders" element={
            <ProtectedRoute>
              <Layout>
                <WorkOrdersPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/work-orders/:id" element={
            <ProtectedRoute>
              <Layout>
                <WorkOrderDetailPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/operator-continuity" element={
            <ProtectedRoute>
              <Layout>
                <OperatorContinuityPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/issues" element={
            <ProtectedRoute>
              <Layout>
                <IssuesPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute>
              <Layout>
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/buildings" element={
            <ProtectedRoute>
              <Layout>
                <BuildingsPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/buildings/:id" element={
            <ProtectedRoute>
              <Layout>
                <BuildingDetailPage />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App