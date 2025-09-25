'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { activityService, ActivityItem } from '@/lib/activity-service'
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  BriefcaseIcon,
  BellIcon,
  EyeIcon
} from '@heroicons/react/24/outline'


export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Load recent activities
  useEffect(() => {
    if (isHydrated) {
      const activities = activityService.getRecentActivities()
      setRecentActivities(activities)
    }
  }, [isHydrated])

  // Subscribe to activity updates
  useEffect(() => {
    const unsubscribe = activityService.subscribe((allActivities) => {
      // Activities are already sorted by the service, just take the first 3
      const recent = allActivities.slice(0, 3)
      setRecentActivities(recent)
    })

    return unsubscribe
  }, [])

  // Ensure recentActivities is used (for linter)
  const displayActivities = recentActivities

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
      toast.success('Logged out successfully!')
    } catch {
      toast.error('Failed to logout. Please try again.')
    }
  }

  const handleGoHome = () => {
    router.push('/')
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Redirect based on role
    if (session.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else if (session.user?.role === 'HR') {
      router.push('/hr/dashboard')
    }
  }, [session, status, router])

  if (!isHydrated || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return null
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
                  onClick={handleGoHome}
                  variant="secondary"
                  className="btn-secondary hover-lift"
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Home
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
                    <UserIcon className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
              Welcome, {session.user?.name}!
            </h1>
                  <p className="text-xl text-text-mid max-w-2xl mx-auto">
                    Your career journey starts here. Track applications, discover opportunities, and manage your professional profile.
                  </p>
                </motion.div>
              </div>
              <div className="flex-1 flex justify-end">
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  className="btn-secondary hover-lift"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="card hover-lift">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-high">3</p>
                  <p className="text-text-mid">Applications</p>
                </div>
              </div>
            </div>
            
            <div className="card hover-lift">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-high">1</p>
                  <p className="text-text-mid">Interviews</p>
                </div>
              </div>
            </div>
            
            <div className="card hover-lift">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mr-4">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-high">2</p>
                  <p className="text-text-mid">Pending</p>
                </div>
              </div>
            </div>

            <div className="card hover-lift">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg flex items-center justify-center mr-4">
                  <ArrowUpIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-high">85%</p>
                  <p className="text-text-mid">Profile Complete</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          >
            <div className="card hover-lift group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <DocumentTextIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-text-high mb-3">
                My Applications
              </h3>
                <p className="text-text-mid mb-6 leading-relaxed">
                  Track your job applications, view status updates, and manage your application history.
              </p>
              <Button
                onClick={() => router.push('/applicant/applications')}
                  className="btn-primary w-full hover-glow"
              >
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                View Applications
              </Button>
              </div>
            </div>

            <div className="card hover-lift group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BriefcaseIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-text-high mb-3">
                Available Jobs
              </h3>
                <p className="text-text-mid mb-6 leading-relaxed">
                  Discover exciting career opportunities and find your next role with us.
              </p>
              <Button
                onClick={() => router.push('/jobs')}
                  className="btn-primary w-full hover-glow"
              >
                  <BriefcaseIcon className="w-5 h-5 mr-2" />
                Browse Jobs
              </Button>
              </div>
            </div>

            <div className="card hover-lift group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-text-high mb-3">
                My Profile
              </h3>
                <p className="text-text-mid mb-6 leading-relaxed">
                  Keep your professional profile updated and showcase your skills.
              </p>
              <Button
                onClick={() => router.push('/applicant/profile')}
                  className="btn-primary w-full hover-glow"
              >
                  <UserIcon className="w-5 h-5 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
          </motion.div>

          {/* Enhanced Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-text-high">
                  Recent Activity
                </h2>
              </div>
              <Button 
                onClick={() => router.push('/applicant/activity')}
                variant="secondary" 
                className="btn-secondary"
              >
                <BellIcon className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
            
            <div className="space-y-6">
              {displayActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-bg-800 to-bg-850 rounded-xl border border-border hover:shadow-medium transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      activity.type === 'application' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                      activity.type === 'interview' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                      activity.type === 'profile_update' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                      activity.type === 'job_view' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      'bg-gradient-to-r from-gray-500 to-gray-600'
                    }`}>
                      {activity.type === 'application' && <DocumentTextIcon className="w-6 h-6 text-white" />}
                      {activity.type === 'interview' && <ClockIcon className="w-6 h-6 text-white" />}
                      {activity.type === 'profile_update' && <CheckCircleIcon className="w-6 h-6 text-white" />}
                      {activity.type === 'job_view' && <EyeIcon className="w-6 h-6 text-white" />}
                      {activity.type === 'status_change' && <CheckCircleIcon className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-text-high">
                        {activity.title}
                      </h4>
                      <p className="text-text-mid">
                        {activity.description} • {activity.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`status-badge ${
                      activity.status === 'pending' ? 'status-pending' :
                      activity.status === 'review' ? 'status-review' :
                      activity.status === 'success' ? 'status-success' :
                      activity.status === 'scheduled' ? 'status-pending' :
                      'status-success'
                    }`}>
                      {activity.status === 'pending' ? 'Pending' :
                       activity.status === 'review' ? 'Under Review' :
                       activity.status === 'success' ? 'Completed' :
                       activity.status === 'scheduled' ? 'Scheduled' :
                       'Completed'}
                    </span>
                    {activity.jobId && (
                      <Button 
                        variant="secondary" 
                        className="btn-secondary"
                        onClick={() => router.push(`/jobs/${activity.jobId}`)}
                      >
                        View Job
                      </Button>
                    )}
                    {activity.applicationId && (
                      <Button 
                        variant="secondary" 
                        className="btn-secondary"
                        onClick={() => router.push(`/applicant/applications?highlight=${activity.applicationId}`)}
                      >
                        View Application
                      </Button>
                    )}
                    {activity.type === 'profile_update' && (
                      <Button 
                        variant="secondary" 
                        className="btn-secondary"
                        onClick={() => router.push('/applicant/profile')}
                      >
                        View Profile
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
