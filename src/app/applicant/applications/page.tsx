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
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface Application {
  id: string
  jobTitle: string
  company: string
  department: string
  appliedDate: string
  status: 'PENDING' | 'REVIEW' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED'
  interviewDate?: string
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
          jobTitle: 'Senior Software Engineer',
          company: 'Amealio',
          department: 'Engineering',
          appliedDate: '2024-01-15',
          status: 'PENDING',
          notes: 'Application submitted and pending review'
        },
        {
          id: 'app-2',
          jobTitle: 'Product Manager',
          company: 'Amealio',
          department: 'Product',
          appliedDate: '2024-01-10',
          status: 'INTERVIEW',
          interviewDate: '2024-01-25',
          notes: 'Interview scheduled for next week'
        },
        {
          id: '3',
          jobTitle: 'UX Designer',
          company: 'Amealio',
          department: 'Design',
          appliedDate: '2024-01-05',
          status: 'ACCEPTED',
          notes: 'Congratulations! You have been selected.'
        },
        {
          id: '4',
          jobTitle: 'Marketing Specialist',
          company: 'Amealio',
          department: 'Marketing',
          appliedDate: '2023-12-20',
          status: 'REJECTED',
          notes: 'Thank you for your interest. We have decided to move forward with other candidates.'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [session, status, router, searchParams])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-amber-500" />
      case 'REVIEW':
        return <EyeIcon className="w-5 h-5 text-blue-500" />
      case 'INTERVIEW':
        return <CalendarIcon className="w-5 h-5 text-purple-500" />
      case 'ACCEPTED':
        return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
      case 'REJECTED':
        return <XCircleIcon className="w-5 h-5 text-rose-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'REVIEW':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'INTERVIEW':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'REJECTED':
        return 'bg-rose-100 text-rose-700 border-rose-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const filteredApplications = selectedStatus === 'ALL' 
    ? applications 
    : applications.filter(app => app.status === selectedStatus)

  const statusCounts = {
    ALL: applications.length,
    PENDING: applications.filter(app => app.status === 'PENDING').length,
    REVIEW: applications.filter(app => app.status === 'REVIEW').length,
    INTERVIEW: applications.filter(app => app.status === 'INTERVIEW').length,
    ACCEPTED: applications.filter(app => app.status === 'ACCEPTED').length,
    REJECTED: applications.filter(app => app.status === 'REJECTED').length,
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
                            {application.status}
                          </span>
                        </span>
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
                          <p className="text-sm text-text-mid">Interview Date</p>
                          <p className="font-medium text-text-high">
                            {new Date(application.interviewDate).toLocaleDateString()}
                          </p>
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
                        onClick={() => router.push(`/jobs/${application.id}`)}
                        variant="secondary"
                        className="btn-secondary"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        View Job
                      </Button>
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
