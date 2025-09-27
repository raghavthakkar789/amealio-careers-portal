'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { 
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserIcon,
  BriefcaseIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { 
  applicationStatusService,
  ApplicationWithHistory,
  StatusTransition
} from '@/lib/application-status-service'
import { useApplicationUpdates } from '@/hooks/useApplicationUpdates'
import ApplicantProfileModal from './ApplicantProfileModal'

interface ApplicationManagementProps {
  userRole: 'APPLICANT' | 'HR' | 'ADMIN'
  title: string
  description: string
  backUrl: string
}

export default function ApplicationManagement({
  userRole,
  title,
  description,
  backUrl
}: ApplicationManagementProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<ApplicationWithHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Real-time updates
  const { isConnected } = useApplicationUpdates({
    onStatusUpdate: (applicationId, update) => {
      // Refresh applications when status updates
      fetchApplications()
      toast.success(`Application status updated to ${update.newStatus}`)
    }
  })

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', response.status, errorData)
        toast.error(errorData.error || 'Failed to fetch applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Network error: Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!session) {
      console.log('No session available')
      return
    }
    console.log('Session available, fetching applications:', {
      user: {
        id: session.user?.id,
        email: session.user?.email,
        role: session.user?.role
      }
    })
    fetchApplications()
  }, [session, userRole])

  const handleStageUpdate = async (
    applicationId: string, 
    transition: StatusTransition
  ) => {
    if (!session) return

    setActionLoading(applicationId)
    
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: transition.to,
          action: transition.action,
          notes: transition.description
        }),
      })

      if (response.ok) {
        toast.success(`Application moved to ${transition.to.replace('_', ' ')}`)
        // Real-time updates will handle the refresh
      } else {
        const error = await response.json()
        console.error('API Error:', error)
        toast.error(error.error || 'Failed to update application stage')
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application stage')
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewProfile = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
    setShowProfileModal(true)
  }

  const handleCloseProfileModal = () => {
    setShowProfileModal(false)
    setSelectedApplicationId(null)
  }

  const getStatusDisplay = (status: string) => {
    return applicationStatusService.getStatusDisplay(status as any)
  }

  const getStatusIcon = (status: string) => {
    const display = getStatusDisplay(status)
    
    switch (display.icon) {
      case 'ClockIcon':
        return <ClockIcon className="w-4 h-4" />
      case 'EyeIcon':
        return <EyeIcon className="w-4 h-4" />
      case 'CalendarIcon':
        return <CalendarIcon className="w-4 h-4" />
      case 'CheckCircleIcon':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'XCircleIcon':
        return <XCircleIcon className="w-4 h-4" />
      default:
        return <DocumentTextIcon className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-850">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-850">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push(backUrl)}
                variant="secondary"
                className="btn-secondary"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-text-high">{title}</h1>
                <p className="text-text-mid">{description}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="card text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-high mb-2">
                  No Applications Found
                </h3>
                <p className="text-text-mid">No applications have been submitted yet.</p>
              </div>
            ) : (
              applications.map((application, index) => {
                // Get available transitions based on current status and user role
                const availableTransitions = session?.user?.role ? 
                  applicationStatusService.getAvailableTransitions(application.status, session.user.role as 'APPLICANT' | 'HR' | 'ADMIN') : []
                
                // Filter out transitions that would result in the same status
                const validTransitions = availableTransitions.filter(transition => transition.to !== application.status)

                return (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="card hover:shadow-card-hover transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-text-high">
                              {application.applicant ? `${application.applicant.firstName} ${application.applicant.lastName}` : 'Unknown Applicant'}
                            </h3>
                            <p className="text-text-mid">{application.applicant?.email || 'No email'}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusDisplay(application.status).color}`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(application.status)}
                              {getStatusDisplay(application.status).label}
                            </span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-text-mid">Job Position</p>
                            <p className="font-medium text-text-high">{application.jobTitle}</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-mid">Department</p>
                            <p className="font-medium text-text-high">{application.job?.department?.name || 'Unknown'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-mid">Expected Salary</p>
                            <p className="font-medium text-text-high">{application.expectedSalary || 'No base'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-mid">Applied Date</p>
                            <p className="font-medium text-text-high">
                              {new Date(application.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Application History */}
                        {application.history && application.history.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-text-mid mb-2">Recent Activity</p>
                            <div className="bg-bg-800 p-3 rounded border border-border">
                              <div className="space-y-2">
                                {application.history.slice(0, 3).map((historyItem) => (
                                  <div key={historyItem.id} className="flex items-center gap-2 text-sm">
                                    <span className="text-text-mid">
                                      {new Date(historyItem.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="text-text-high">
                                      {historyItem.performedByName} ({historyItem.performedByRole}) moved application from {historyItem.fromStatus || 'N/A'} to {historyItem.toStatus}
                                    </span>
                                    {historyItem.notes && (
                                      <span className="text-text-mid">- {historyItem.notes}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {/* Show View Profile button only for HR and ADMIN */}
                        {(userRole === 'HR' || userRole === 'ADMIN') && (
                          <Button
                            onClick={() => handleViewProfile(application.id)}
                            variant="secondary"
                            className="btn-secondary"
                          >
                            <UserCircleIcon className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => window.open(`/jobs/${application.job.id}`, '_blank')}
                          variant="secondary"
                          className="btn-secondary"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Job
                        </Button>
                        
                        {validTransitions.map((transition) => (
                          <Button
                            key={transition.action}
                            onClick={() => {
                              if (transition.requiresConfirmation) {
                                if (confirm(transition.confirmationMessage || 'Are you sure?')) {
                                  handleStageUpdate(application.id, transition)
                                }
                              } else {
                                handleStageUpdate(application.id, transition)
                              }
                            }}
                            disabled={actionLoading === application.id}
                            className="btn-primary text-sm"
                          >
                            {actionLoading === application.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <ArrowPathIcon className="w-4 h-4 mr-2" />
                                {transition.description}
                              </>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Applicant Profile Modal */}
      {selectedApplicationId && (
        <ApplicantProfileModal
          isOpen={showProfileModal}
          onClose={handleCloseProfileModal}
          applicationId={selectedApplicationId}
        />
      )}
    </div>
  )
}
