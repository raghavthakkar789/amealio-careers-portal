'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { activityService, ActivityItem } from '@/lib/activity-service'
import {
  DocumentTextIcon,
  BellIcon,
  UserIcon,
  BriefcaseIcon,
  CalendarIcon,
  EyeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

export default function ActivityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsHydrated(true)
  }, [])



  const handleViewProfile = () => {
    router.push('/applicant/profile')
  }

  const handleViewJob = (jobId: string) => {
    router.push(`/jobs/${jobId}`)
  }

  // Load activities data
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Get activities from shared service
        const activities = activityService.getAllActivities()
        setActivities(activities)
      } catch (error) {
        toast.error('Failed to load activities')
        console.error('Error loading activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  // Subscribe to activity updates
  useEffect(() => {
    const unsubscribe = activityService.subscribe((updatedActivities) => {
      setActivities(updatedActivities)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  if (!isHydrated || status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application_submitted':
        return <DocumentTextIcon className="w-6 h-6 text-white" />
      case 'application_reviewed':
        return <EyeIcon className="w-6 h-6 text-white" />
      case 'interview_scheduled':
        return <CalendarIcon className="w-6 h-6 text-white" />
      case 'interview_completed':
        return <BriefcaseIcon className="w-6 h-6 text-white" />
      case 'application_accepted':
        return <DocumentTextIcon className="w-6 h-6 text-white" />
      case 'application_rejected':
        return <DocumentTextIcon className="w-6 h-6 text-white" />
      case 'interview_cancelled':
        return <CalendarIcon className="w-6 h-6 text-white" />
      case 'application_updated':
        return <DocumentTextIcon className="w-6 h-6 text-white" />
      case 'application':
        return <DocumentTextIcon className="w-6 h-6 text-white" />
      case 'interview':
        return <CalendarIcon className="w-6 h-6 text-white" />
      case 'profile_update':
        return <UserIcon className="w-6 h-6 text-white" />
      case 'job_view':
        return <EyeIcon className="w-6 h-6 text-white" />
      default:
        return <BellIcon className="w-6 h-6 text-white" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-amber-100 text-amber-700`
      case 'review':
        return `${baseClasses} bg-blue-100 text-blue-700`
      case 'success':
        return `${baseClasses} bg-emerald-100 text-emerald-700`
      case 'scheduled':
        return `${baseClasses} bg-purple-100 text-purple-700`
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-700`
      case 'error':
        return `${baseClasses} bg-red-100 text-red-700`
      case 'info':
        return `${baseClasses} bg-blue-100 text-blue-700`
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-700`
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review'
      case 'review':
        return 'Under Review'
      case 'success':
        return 'Completed'
      case 'scheduled':
        return 'Scheduled'
      case 'completed':
        return 'Completed'
      case 'error':
        return 'Error'
      case 'info':
        return 'Information'
      case 'warning':
        return 'Warning'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-850 via-bg-900 to-bg-850">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 flex justify-start">
              <Button
                onClick={() => router.push('/applicant/dashboard')}
                variant="secondary"
                className="btn-secondary hover-lift"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              </div>
              <div className="flex-1 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mb-4"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-large">
                    <BellIcon className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
                    Recent Activity
                  </h1>
                  <p className="text-xl text-text-mid max-w-2xl mx-auto">
                    Track all your job applications, interviews, and profile updates in one place.
                  </p>
                </motion.div>
              </div>
              <div className="flex-1 flex justify-end">
                {/* Empty div to maintain layout balance */}
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <BellIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-text-high">
                  Activity Timeline
                </h2>
              </div>
              <div className="text-text-mid">
                {activities.length} activities
              </div>
            </div>
            
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-bg-800 to-bg-850 rounded-xl border border-border hover:shadow-medium transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      activity.type === 'application' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                      activity.type === 'interview' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                      activity.type === 'profile_update' ? 'bg-gradient-to-r from-primary to-purple-600' :
                      'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-text-high">
                        {activity.title}
                      </h4>
                      <p className="text-text-mid">
                        {activity.description}
                      </p>
                      <p className="text-text-mid text-sm">
                        {activity.date}
                      </p>
                      {activity.metadata && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activity.metadata.position && (
                            <span className="px-2 py-1 bg-primary-800 text-primary-200 text-xs rounded">
                              {activity.metadata.position}
                            </span>
                          )}
                          {activity.metadata.interviewType && (
                            <span className="px-2 py-1 bg-emerald-800 text-emerald-200 text-xs rounded">
                              {activity.metadata.interviewType}
                            </span>
                          )}
                          {activity.metadata.location && (
                            <span className="px-2 py-1 bg-blue-800 text-blue-200 text-xs rounded">
                              {activity.metadata.location}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={getStatusBadge(activity.status)}>
                      {getStatusText(activity.status)}
                    </span>
                    <div className="flex gap-2">
                      {activity.jobId && (
                        <Button
                          onClick={() => handleViewJob(activity.jobId!)}
                          variant="secondary"
                          className="btn-secondary"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View Job
                        </Button>
                      )}
                      {activity.applicationId && (
                        <Button
                          onClick={() => router.push(`/applicant/applications?highlight=${activity.applicationId}`)}
                          variant="secondary"
                          className="btn-secondary"
                        >
                          <DocumentTextIcon className="w-4 h-4 mr-1" />
                          View Application
                        </Button>
                      )}
                      {activity.type === 'profile_update' && (
                        <Button
                          onClick={handleViewProfile}
                          variant="secondary"
                          className="btn-secondary"
                        >
                          <UserIcon className="w-4 h-4 mr-1" />
                          View Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex justify-center gap-4"
          >
            <Button
              onClick={() => router.push('/applicant/applications')}
              className="btn-primary hover-glow"
            >
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              View All Applications
            </Button>
            <Button
              onClick={handleViewProfile}
              variant="secondary"
              className="btn-secondary hover-lift"
            >
              <UserIcon className="w-5 h-5 mr-2" />
              Edit Profile
            </Button>
            <Button
              onClick={() => router.push('/jobs')}
              variant="secondary"
              className="btn-secondary hover-lift"
            >
              <BriefcaseIcon className="w-5 h-5 mr-2" />
              Browse Jobs
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
