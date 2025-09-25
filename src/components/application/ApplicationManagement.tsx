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

    const userApplications = applicationLifecycleService.getApplications(
      userRole, 
      session.user?.id
    )
    setApplications(userApplications)
    setLoading(false)

    const unsubscribe = applicationLifecycleService.subscribe((allApplications) => {
      const filteredApplications = applicationLifecycleService.getApplications(
        userRole, 
        session.user?.id
      )
      setApplications(filteredApplications)
    })

    return unsubscribe
  }, [session, userRole])

  const handleStageUpdate = async (
    applicationId: string, 
    action: ApplicationAction
  ) => {
    if (!session) return

    setActionLoading(applicationId)
    
    try {
      const updatedApplication = applicationLifecycleService.updateApplicationStage(
        applicationId,
        action.targetStage,
        action.id,
        session.user?.id || 'unknown',
        userRole
      )

      if (updatedApplication) {
        toast.success(`Application moved to ${action.targetStage.replace('_', ' ')}`)
        
        // The activity service will be automatically notified by the lifecycle service
        // No need to manually add activity here
      } else {
        toast.error('Failed to update application stage')
      }
    } catch (error) {
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
                const currentStage = applicationLifecycleService.getStage(application.currentStage)
                const availableActions = applicationLifecycleService.getAvailableActions(application.id, userRole)

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
                              {application.applicantName}
                            </h3>
                            <p className="text-text-mid">{application.applicantEmail}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.currentStage)}`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(application.currentStage)}
                              {currentStage?.name || application.currentStage}
                            </span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-text-mid">Job Position</p>
                            <p className="font-medium text-text-high">{application.jobTitle}</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-mid">Department</p>
                            <p className="font-medium text-text-high">{application.department}</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-mid">Applied Date</p>
                            <p className="font-medium text-text-high">
                              {new Date(application.appliedDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Application History */}
                        {application.history.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-text-mid mb-3">Recent Activity</p>
                            <div className="space-y-2">
                              {application.history.slice(-2).map((entry) => (
                                <div key={entry.id} className="bg-bg-800 p-2 rounded border border-border">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-text-mid">
                                      {entry.fromStage} → {entry.toStage}
                                    </span>
                                    <span className="text-text-mid">
                                      {new Date(entry.timestamp).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-text-high text-sm mt-1">
                                    {entry.action} by {entry.performedByRole}
                                  </p>
                                </div>
                              ))}
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
