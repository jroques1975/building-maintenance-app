import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  ButtonGroup,
  Box,
  Chip,
  Typography,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import { useAppSelector } from '../../store'
import IssueDetailModal from './IssueDetailModal'
import { Issue } from '@shared/types'

interface IssueQueueProps {
  onFilterChange: (filter: string) => void
  currentFilter: string
  onRefresh: () => void
}

const IssueQueue: React.FC<IssueQueueProps> = ({ onFilterChange, currentFilter, onRefresh }) => {
  const { filteredIssues } = useAppSelector((state) => state.dashboard)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH':
        return 'error'
      case 'MEDIUM':
        return 'warning'
      case 'LOW':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return '🟡'
      case 'COMPLETED':
      case 'CANCELLED':
        return '✅'
      default:
        return '⚪'
    }
  }

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setTimeout(() => setSelectedIssue(null), 300)
  }

  const handleRefreshAndClose = () => {
    handleModalClose()
    onRefresh()
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Issue Queue"
          action={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <ButtonGroup size="small" variant="outlined">
                {['all', 'urgent', 'mine'].map((filter) => (
                  <Button
                    key={filter}
                    variant={currentFilter === filter ? 'contained' : 'outlined'}
                    onClick={() => onFilterChange(filter)}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {filter}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
          }
        />
        <CardContent>
          {filteredIssues.length === 0 ? (
            <Typography color="text.secondary" align="center" py={3}>
              No issues match the current filter
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredIssues.slice(0, 10).map((issue) => (
                <Box
                  key={issue.id}
                  sx={{
                    p: 2,
                    borderLeft: 4,
                    borderColor: getPriorityColor(issue.priority),
                    backgroundColor: 'grey.50',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                  }}
                  onClick={() => handleIssueClick(issue)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {getStatusIcon(issue.status)} #{issue.id} {issue.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {issue.unitId} • {new Date(issue.createdAt).toLocaleDateString()} • {issue.category}
                      </Typography>
                      {issue.assignedToId && (
                        <Typography variant="caption" color="text.secondary">
                          Assigned to: {issue.assignedToId}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={issue.priority}
                      size="small"
                      color={getPriorityColor(issue.priority)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {issue.description.substring(0, 100)}...
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Issue Detail Modal */}
      <IssueDetailModal
        open={modalOpen}
        issue={selectedIssue}
        onClose={handleModalClose}
        onRefresh={handleRefreshAndClose}
      />
    </>
  )
}

export default IssueQueue