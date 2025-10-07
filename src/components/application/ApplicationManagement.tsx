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
import { formatDate } from '@/lib/utils'

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
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectTransition, setRejectTransition] = useState<StatusTransition | null>(null)

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
        let errorMessage = 'Failed to fetch applications'
        try {
          const errorData = await response.json()
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          })
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          console.error('Failed to parse error response:', {
            status: response.status,
            statusText: response.statusText,
            parseError
          })
          errorMessage = `Server error (${response.status}): ${response.statusText}`
        }
        toast.error(errorMessage)
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
    transition: StatusTransition,
    notes?: string
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
          notes: notes || transition.description
        }),
      })

      if (response.ok) {
        toast.success(`Application moved to ${transition.to.replace('_', ' ')}`)
        // Real-time updates will handle the refresh
      } else {
        let errorMessage = 'Failed to update application stage'
        try {
          const errorData = await response.json()
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          })
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          console.error('Failed to parse error response:', {
            status: response.status,
            statusText: response.statusText,
            parseError
          })
          errorMessage = `Server error (${response.status}): ${response.statusText}`
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application stage')
    } finally {
      setActionLoading(null)
    }
  }

  const openRejectModal = (applicationId: string, transition: StatusTransition) => {
    setSelectedApplicationId(applicationId)
    setRejectTransition(transition)
    setRejectReason('This information is kept confidential and is not shared with the candidate.')
    setShowRejectModal(true)
  }

  const submitReject = async () => {
    if (!selectedApplicationId || !rejectTransition) return
    await handleStageUpdate(selectedApplicationId, rejectTransition, rejectReason.trim())
    setShowRejectModal(false)
    setRejectReason('')
    setRejectTransition(null)
  }

  // Workflow navigation helpers
  const handleScheduleInterview = (applicationId: string) => {
    router.push(`/hr/interviews?applicationId=${applicationId}`)
  }

  const handleInterviewEvaluation = (applicationId: string) => {
    router.push(`/hr/interviews/${applicationId}/evaluation`)
  }

  const handleFinalApproval = (applicationId: string) => {
    router.push(`/admin/dashboard?tab=applicants&applicationId=${applicationId}`)
  }

  const handleViewProfile = (applicationId: string) => {
    // For applicants viewing their own applications, redirect to profile page
    if (userRole === 'APPLICANT') {
      router.push('/applicant/profile')
      return
    }
    
    // For HR and ADMIN, show the modal
    setSelectedApplicationId(applicationId)
    setShowProfileModal(true)
  }

  const handleCloseProfileModal = () => {
    setShowProfileModal(false)
    setSelectedApplicationId(null)
  }

  const getStatusDisplay = (status: string) => {
    return applicationStatusService.getStatusDisplay(status as 'PENDING' | 'UNDER_REVIEW' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW_COMPLETED' | 'ACCEPTED' | 'REJECTED' | 'HIRED')
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
                              {formatDate(application.submittedAt)}
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
                                      {formatDate(historyItem.createdAt)}
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
                        {/* Show View Profile button for HR, ADMIN, and APPLICANT (own applications) */}
                        {(userRole === 'HR' || userRole === 'ADMIN' || 
                          (userRole === 'APPLICANT' && application.applicant?.id === session?.user?.id)) && (
                          <Button
                            onClick={() => handleViewProfile(application.id)}
                            variant="secondary"
                            className="btn-secondary"
                          >
                            <UserCircleIcon className="w-4 h-4 mr-2" />
                            {userRole === 'APPLICANT' ? 'View My Profile' : 'View Profile'}
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => {
                            if (application.status === 'INTERVIEW_COMPLETED') {
                              handleInterviewEvaluation(application.id)
                              return
                            }
                            window.open(`/jobs/${application.job.id}`, '_blank')
                          }}
                          variant="secondary"
                          className="btn-secondary"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Job
                        </Button>

                        {/* Strict workflow buttons per stage and role */}
                        {application.status === 'PENDING' && (userRole === 'HR' || userRole === 'ADMIN') && (
                          <>
                            <Button
                              onClick={() => handleStageUpdate(application.id, {
                                from: 'PENDING',
                                to: 'UNDER_REVIEW',
                                action: 'UNDER_REVIEW',
                                description: 'Move application to under review',
                                allowedRoles: ['HR', 'ADMIN'],
                                requiresConfirmation: false
                              })}
                              disabled={actionLoading === application.id}
                              className="btn-primary text-sm"
                            >
                              {actionLoading === application.id ? <LoadingSpinner size="sm" /> : (<><ArrowPathIcon className="w-4 h-4 mr-2" />Under Review</>)}
                            </Button>
                            <Button
                              onClick={() => openRejectModal(application.id, {
                                from: 'PENDING',
                                to: 'REJECTED',
                                action: 'REJECT',
                                description: 'Reject the application',
                                allowedRoles: ['HR', 'ADMIN'],
                                requiresConfirmation: true
                              })}
                              variant="secondary"
                              className="btn-secondary text-sm text-red-600 hover:text-red-700"
                            >
                              <XCircleIcon className="w-4 h-4 mr-2" />Reject
                            </Button>
                          </>
                        )}

                        {application.status === 'UNDER_REVIEW' && (userRole === 'HR' || userRole === 'ADMIN') && (
                          <>
                            <Button
                              onClick={() => handleScheduleInterview(application.id)}
                              className="btn-primary text-sm"
                            >
                              <CalendarIcon className="w-4 h-4 mr-2" />Schedule Interview
                            </Button>
                            <Button
                              onClick={() => openRejectModal(application.id, {
                                from: 'UNDER_REVIEW',
                                to: 'REJECTED',
                                action: 'REJECT',
                                description: 'Reject the application after review',
                                allowedRoles: ['HR', 'ADMIN'],
                                requiresConfirmation: true
                              })}
                              variant="secondary"
                              className="btn-secondary text-sm text-red-600 hover:text-red-700"
                            >
                              <XCircleIcon className="w-4 h-4 mr-2" />Reject
                            </Button>
                          </>
                        )}

                        {/* INTERVIEW_SCHEDULED: no extra buttons beyond View Profile and View Job */}

                        {/* INTERVIEW_COMPLETED: View Job routes to evaluation; no accept/reject buttons here */}

                        {application.status === 'ACCEPTED' && userRole === 'ADMIN' && (
                          <Button
                            onClick={() => handleFinalApproval(application.id)}
                            className="btn-primary text-sm"
                          >
                            <ArrowPathIcon className="w-4 h-4 mr-2" />Final Approval
                          </Button>
                        )}

                        {application.status === 'ACCEPTED' && userRole === 'HR' && (
                          <div className="text-sm text-text-mid bg-bg-800 p-2 rounded border">Pending Admin Approval</div>
                        )}
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

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-850 rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold text-text-high mb-4">Reject Application</h3>
            <p className="text-text-mid mb-4">Please provide a brief reason for rejection. The default text can be modified as needed. This will be visible to the applicant in Recent Activity and to Admin.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain this decision briefly..."
              className="w-full px-3 py-2 bg-bg-800 border border-border rounded-lg text-text-high focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                  setRejectTransition(null)
                }}
                variant="secondary"
                className="btn-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={submitReject}
                disabled={!rejectReason.trim()}
                className="btn-primary"
              >
                Submit Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
