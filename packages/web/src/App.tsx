import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAppDispatch } from './store'
import { fetchDashboardData } from './store/dashboardSlice'

import DashboardPage from './pages/DashboardPage'
import Layout from './components/Layout'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Fetch initial dashboard data
    dispatch(fetchDashboardData())
  }, [dispatch])

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Additional routes will be added here */}
        </Routes>
      </Layout>
    </Router>
  )
}

export default App