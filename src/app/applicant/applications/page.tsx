'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowLeftIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface Application {
  id: string
  jobId: string
  jobTitle: string
  company: string
  department: string
  appliedDate: string
  status: 'PENDING' | 'UNDER_REVIEW' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW_COMPLETED' | 'ACCEPTED' | 'REJECTED' | 'HIRED'
  interviewDate?: string
  interviewTime?: string
  interviewMode?: string
  notes?: string
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [highlightedApp, setHighlightedApp] = useState<string | null>(null)

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

    // Check for highlight parameter
    const highlightParam = searchParams.get('highlight')
    if (highlightParam) {
      setHighlightedApp(highlightParam)
      // Remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightedApp(null)
        // Clean up URL
        const url = new URL(window.location.href)
        url.searchParams.delete('highlight')
        window.history.replaceState({}, '', url.toString())
      }, 3000)
    }

    // Mock data - replace with actual API call
    setTimeout(() => {
      setApplications([
        {
          id: 'app-1',
          jobId: '1',
          jobTitle: 'Senior Software Engineer',
          company: 'Amealio',
          department: 'Engineering',
          appliedDate: '2024-01-15',
          status: 'PENDING',
          notes: 'Application submitted and pending review. Strong technical background with 5+ years of experience in React, Node.js, and TypeScript. Previous experience includes building scalable web applications and working with cloud platforms like AWS.'
        },
        {
          id: 'app-2',
          jobId: '2',
          jobTitle: 'Product Manager',
          company: 'Amealio',
          department: 'Product',
          appliedDate: '2024-01-10',
          status: 'UNDER_REVIEW',
          notes: 'Application is being reviewed by HR team'
        },
        {
          id: 'app-3',
          jobId: '3',
          jobTitle: 'UX Designer',
          company: 'Amealio',
          department: 'Design',
          appliedDate: '2024-01-05',
          status: 'INTERVIEW_SCHEDULED',
          interviewDate: '2024-01-25',
          interviewTime: '2:00 PM - 3:00 PM',
          interviewMode: 'Video Call (Zoom)',
          notes: 'Interview scheduled for next week'
        },
        {
          id: 'app-4',
          jobId: '4',
          jobTitle: 'Marketing Specialist',
          company: 'Amealio',
          department: 'Marketing',
          appliedDate: '2023-12-20',
          status: 'INTERVIEW_COMPLETED',
          notes: 'Interview completed, awaiting final decision'
        },
        {
          id: 'app-5',
          jobId: '5',
          jobTitle: 'Data Analyst',
          company: 'Amealio',
          department: 'Analytics',
          appliedDate: '2023-12-15',
          status: 'ACCEPTED',
          notes: 'Congratulations! You have been selected.'
        },
        {
          id: 'app-6',
          jobId: '6',
          jobTitle: 'Sales Representative',
          company: 'Amealio',
          department: 'Sales',
          appliedDate: '2023-12-10',
          status: 'REJECTED',
          notes: 'Thank you for your interest. We have decided to move forward with other candidates.'
        },
        {
          id: 'app-7',
          jobId: 'job-7',
          jobTitle: 'Frontend Developer',
          company: 'Amealio',
          department: 'Engineering',
          appliedDate: '2023-11-30',
          status: 'HIRED',
          notes: 'Welcome to the team! Your start date is confirmed.'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [session, status, router, searchParams])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-amber-500" />
      case 'UNDER_REVIEW':
        return <EyeIcon className="w-5 h-5 text-blue-500" />
      case 'INTERVIEW_SCHEDULED':
        return <CalendarIcon className="w-5 h-5 text-purple-500" />
      case 'INTERVIEW_COMPLETED':
        return <DocumentTextIcon className="w-5 h-5 text-indigo-500" />
      case 'ACCEPTED':
        return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
      case 'REJECTED':
        return <XCircleIcon className="w-5 h-5 text-rose-500" />
      case 'HIRED':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'INTERVIEW_SCHEDULED':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'INTERVIEW_COMPLETED':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'REJECTED':
        return 'bg-rose-100 text-rose-700 border-rose-200'
      case 'HIRED':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Your application has been submitted and is awaiting initial review by our HR team.'
      case 'UNDER_REVIEW':
        return 'Our HR team is currently reviewing your application and assessing your qualifications.'
      case 'INTERVIEW_SCHEDULED':
        return 'Congratulations! You have been selected for an interview. Check the interview date below.'
      case 'INTERVIEW_COMPLETED':
        return 'Your interview has been completed. We are now evaluating your performance and fit for the role.'
      case 'ACCEPTED':
        return 'Excellent news! Your application has been accepted. You will receive further instructions soon.'
      case 'REJECTED':
        return 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.'
      case 'HIRED':
        return 'Congratulations! You have been hired. Welcome to the team!'
      default:
        return 'Application status is being processed.'
    }
  }

  const filteredApplications = selectedStatus === 'ALL' 
    ? applications 
    : applications.filter(app => app.status === selectedStatus)

  const statusCounts = {
    ALL: applications.length,
    PENDING: applications.filter(app => app.status === 'PENDING').length,
    UNDER_REVIEW: applications.filter(app => app.status === 'UNDER_REVIEW').length,
    INTERVIEW_SCHEDULED: applications.filter(app => app.status === 'INTERVIEW_SCHEDULED').length,
    INTERVIEW_COMPLETED: applications.filter(app => app.status === 'INTERVIEW_COMPLETED').length,
    ACCEPTED: applications.filter(app => app.status === 'ACCEPTED').length,
    REJECTED: applications.filter(app => app.status === 'REJECTED').length,
    HIRED: applications.filter(app => app.status === 'HIRED').length,
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-850">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-850">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button
                onClick={() => router.push('/applicant/dashboard')}
                variant="secondary"
                className="mb-4"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-4xl font-bold text-text-high mb-2">
                My Applications
              </h1>
              <p className="text-text-mid">
                Track the status of all your job applications
              </p>
            </div>
          </div>

          {/* Status Filter */}
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-text-high mb-4">Filter by Status</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedStatus === status
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg-800 text-text-mid border-border hover:border-primary/50'
                  }`}
                >
                  {status} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <div className="card text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-high mb-2">
                  No Applications Found
                </h3>
                <p className="text-text-mid mb-6">
                  {selectedStatus === 'ALL' 
                    ? "You haven't applied to any positions yet."
                    : `No applications found with status: ${selectedStatus}`
                  }
                </p>
                <Button
                  onClick={() => router.push('/jobs')}
                  className="btn-primary"
                >
                  Browse Available Jobs
                </Button>
              </div>
            ) : (
              filteredApplications.map((application, index) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`card hover:shadow-card-hover transition-all duration-300 ${
                    highlightedApp === application.id 
                      ? 'ring-2 ring-primary ring-opacity-50 bg-gradient-to-r from-primary/5 to-purple-600/5 animate-pulse' 
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-text-high">
                          {application.jobTitle}
                        </h3>
                        <span className={`status-badge ${getStatusColor(application.status)}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(application.status)}
                            {application.status.replace('_', ' ')}
                          </span>
                        </span>
                      </div>
                      
                      {/* Application Stage Description */}
                      <div className="mb-4 p-3 bg-bg-800 rounded-lg border border-border">
                        <p className="text-sm text-text-mid mb-1">Application Stage</p>
                        <p className="text-text-high font-medium">
                          {getStatusDescription(application.status)}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-text-mid">Company</p>
                          <p className="font-medium text-text-high">{application.company}</p>
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

                        {application.interviewDate && (
                          <div className="mb-4">
                            <p className="text-sm text-text-mid mb-3">Interview Details</p>
                            <div className="bg-bg-800 p-4 rounded-lg border border-border">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-text-mid mb-1">Interview Date</p>
                                  <p className="font-medium text-text-high">
                                    {new Date(application.interviewDate).toLocaleDateString()}
                                  </p>
                                </div>
                                {application.interviewTime && (
                                  <div>
                                    <p className="text-sm text-text-mid mb-1">Interview Time</p>
                                    <p className="font-medium text-text-high">
                                      {application.interviewTime}
                                    </p>
                                  </div>
                                )}
                                {application.interviewMode && (
                                  <div>
                                    <p className="text-sm text-text-mid mb-1">Interview Mode</p>
                                    <p className="font-medium text-text-high">
                                      {application.interviewMode}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      {application.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-text-mid">Notes</p>
                          <p className="text-text-high bg-bg-800 p-3 rounded-lg border border-border">
                            {application.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => router.push(`/jobs/${application.jobId}`)}
                        variant="secondary"
                        className="btn-secondary"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        View Job
                      </Button>
                      
                      {application.status === 'PENDING' && (
                        <Button
                          onClick={() => router.push(`/jobs/${application.jobId}/apply?edit=true&applicationId=${application.id}`)}
                          className="btn-primary"
                        >
                          <PencilIcon className="w-4 h-4 mr-2" />
                          Edit Application
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
