import React from 'react'
import { useAppSelector } from '../store'

import ManagerDashboard from './ManagerDashboard'
import TenantDashboard from './TenantDashboard'
import MaintenanceDashboard from './MaintenanceDashboard'
import AdminDashboard from './AdminDashboard'

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth)

  if (!user) {
    return <div>Loading...</div>
  }

  switch (user.role) {
    case 'TENANT':
      return <TenantDashboard />
    case 'MAINTENANCE':
      return <MaintenanceDashboard />
    case 'MANAGER':
      return <ManagerDashboard />
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return <AdminDashboard />
    case 'BUILDING_OWNER':
      // Building owners see manager dashboard for now
      return <ManagerDashboard />
    default:
      return <div>Unknown role: {user.role}</div>
  }
}

export default DashboardPage