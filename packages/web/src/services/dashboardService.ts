import { Issue, IssueFilter } from '@shared/types'

// In a real implementation, this would make actual API calls
// For now, we're using mock data


export const dashboardService = {
  async getDashboardData() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock response matching our prototype data
    return {
      issues: [] as Issue[], // Will be populated by Redux mock data
      stats: {
        openIssues: 24,
        urgentIssues: 8,
        todayDue: 12,
        agingIssues: 6,
        avgResponseTime: '4.2h',
        avgCompletionTime: '1.8d',
        tenantSatisfaction: 92,
        costPerUnit: 45,
      },
      activities: [
        { id: '1', action: 'J. assigned #304 to HVAC Tech', time: '10:30 AM' },
        { id: '2', action: 'M. completed #201 repair - leak fixed', time: '9:45 AM' },
        { id: '3', action: 'S. updated status on #198 - awaiting parts', time: '9:30 AM' },
      ],
    }
  },

  async getIssues(_filter: IssueFilter = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock filtered response
    return {
      issues: [] as Issue[], // Will be populated by Redux
      total: 0,
      page: 1,
      limit: 20,
    }
  },

  async exportIssues(filter: IssueFilter = {}) {
    // Simulate API delay for export
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock export data
    return {
      data: [] as Issue[],
      exportedAt: new Date().toISOString(),
      filter,
      format: 'json',
    }
  },

  async toggleEmergencyMode(active: boolean) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return {
      success: true,
      emergencyMode: active,
      message: active ? 'Emergency mode activated' : 'Emergency mode deactivated',
    }
  },
}

export default dashboardService