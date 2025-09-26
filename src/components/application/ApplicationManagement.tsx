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
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { 
  applicationLifecycleService,
  ApplicationState,
  ApplicationAction
} from '@/lib/application-lifecycle-service'

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
  const [applications, setApplications] = useState<ApplicationState[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return

    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/applications')
        if (response.ok) {
          const data = await response.json()
          setApplications(data.applications)
        } else {
          toast.error('Failed to fetch applications')
        }
      } catch (error) {
        console.error('Error fetching applications:', error)
        toast.error('Failed to fetch applications')
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [session, userRole])

  const handleStageUpdate = async (
    applicationId: string, 
    action: ApplicationAction
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
          status: action.targetStage,
          notes: `Application moved to ${action.targetStage.replace('_', ' ')}`
        }),
      })

      if (response.ok) {
        toast.success(`Application moved to ${action.targetStage.replace('_', ' ')}`)
        
        // Refresh applications list
        const refreshResponse = await fetch('/api/applications')
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setApplications(data.applications)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update application stage')
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application stage')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (stageId: string): string => {
    const stage = applicationLifecycleService.getStage(stageId)
    return stage?.color || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (stageId: string) => {
    const stage = applicationLifecycleService.getStage(stageId)
    const iconName = stage?.icon || 'DocumentTextIcon'
    
    switch (iconName) {
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
                // For now, we'll show basic actions based on user role
                const availableActions = userRole === 'HR' || userRole === 'ADMIN' ? [
                  { 
                    id: 'ACCEPT', 
                    name: 'Accept', 
                    description: 'Accept this application',
                    targetStage: 'ACCEPTED',
                    allowedRoles: ['HR', 'ADMIN'],
                    confirmationRequired: true,
                    confirmationMessage: 'Are you sure you want to accept this application?'
                  },
                  { 
                    id: 'REJECT', 
                    name: 'Reject', 
                    description: 'Reject this application',
                    targetStage: 'REJECTED',
                    allowedRoles: ['HR', 'ADMIN'],
                    confirmationRequired: true,
                    confirmationMessage: 'Are you sure you want to reject this application?'
                  },
                  { 
                    id: 'INTERVIEW', 
                    name: 'Schedule Interview', 
                    description: 'Schedule an interview for this application',
                    targetStage: 'INTERVIEW_SCHEDULED',
                    allowedRoles: ['HR', 'ADMIN'],
                    confirmationRequired: false
                  },
                  { 
                    id: 'REVIEW', 
                    name: 'Under Review', 
                    description: 'Move application to review stage',
                    targetStage: 'UNDER_REVIEW',
                    allowedRoles: ['HR', 'ADMIN'],
                    confirmationRequired: false
                  }
                ] : []

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
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(application.status)}
                              {application.status}
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

                        {/* Application Notes */}
                        {application.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-text-mid mb-2">Notes</p>
                            <div className="bg-bg-800 p-3 rounded border border-border">
                              <p className="text-sm text-text-high">{application.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          onClick={() => window.open(`/jobs/${application.jobId}`, '_blank')}
                          variant="secondary"
                          className="btn-secondary"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Job
                        </Button>
                        
                        {availableActions.map((action) => (
                          <Button
                            key={action.id}
                            onClick={() => {
                              if (action.confirmationRequired) {
                                if (confirm(action.confirmationMessage || 'Are you sure?')) {
                                  handleStageUpdate(application.id, action)
                                }
                              } else {
                                handleStageUpdate(application.id, action)
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
                                {action.name}
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
    </div>
  )
}
