'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { 
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  StarIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  LinkIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import ApplicantProfileModal from '@/components/application/ApplicantProfileModal'

interface Applicant {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  address: string | null
  dateOfBirth: string | null
  linkedinProfile: string | null
  profileImage: string | null
  createdAt: string
  applications: Application[]
}

interface Application {
  id: string
  jobTitle: string
  employmentType: string
  status: string
  submittedAt: string
  updatedAt: string
  expectedSalary: string | null
  experience: string | null
  education: string | null
  skills: string | null
  coverLetter: string | null
  resumeUrl: string
  additionalFiles: string[]
  job: {
    id: string
    title: string
    department: {
      name: string
    }
  }
  history: ApplicationHistory[]
}

interface ApplicationHistory {
  id: string
  fromStatus: string | null
  toStatus: string
  action: string
  performedByName: string
  performedByRole: string
  notes: string | null
  createdAt: string
}

interface HRUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  address: string | null
  dateOfBirth: string | null
  linkedinProfile: string | null
  profileImage: string | null
  createdAt: string
  hrJobs: Job[]
  hrReviews: InterviewReview[]
  applicationsReviewed: number
  averageReviewTime: number
}

interface Job {
  id: string
  title: string
  department: {
    name: string
  }
  summary: string | null
  employmentTypes: string[]
  applicationDeadline: string | null
  requiredSkills: string[]
  isActive: boolean
  isDraft: boolean
  createdAt: string
  updatedAt: string
  applications: Application[]
  createdBy: {
    firstName: string
    lastName: string
  }
}

interface InterviewReview {
  id: string
  technicalSkills: number
  communication: number
  culturalFit: number
  overallRating: number
  feedback: string | null
  createdAt: string
  candidate: {
    firstName: string
    lastName: string
  }
  application: {
    jobTitle: string
  }
}

export default function AdminOversightPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [hrUsers, setHrUsers] = useState<HRUser[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showJobModal, setShowJobModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    
    fetchAllData()
  }, [session, status, router])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchApplicants(),
        fetchApplications(),
        fetchHRUsers(),
        fetchJobs()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch oversight data')
    } finally {
      setLoading(false)
    }
  }

  const fetchApplicants = async () => {
    try {
      const response = await fetch('/api/admin/oversight/applicants')
      if (response.ok) {
        const data = await response.json()
        setApplicants(data.applicants)
      }
    } catch (error) {
      console.error('Error fetching applicants:', error)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/oversight/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const fetchHRUsers = async () => {
    try {
      const response = await fetch('/api/admin/oversight/hr-users')
      if (response.ok) {
        const data = await response.json()
        setHrUsers(data.hrUsers)
      }
    } catch (error) {
      console.error('Error fetching HR users:', error)
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/admin/oversight/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
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

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      const response = await fetch(`/api/admin/oversight/jobs/${jobId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Job deleted successfully')
        fetchJobs()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete job')
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Failed to delete job')
    }
  }

  const handleRejectApplicant = async (applicationId: string, reason: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REJECTED',
          action: 'REJECT',
          notes: reason
        }),
      })

      if (response.ok) {
        toast.success('Applicant rejected successfully')
        fetchApplications()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to reject applicant')
      }
    } catch (error) {
      console.error('Error rejecting applicant:', error)
      toast.error('Failed to reject applicant')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HIRED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800'
      case 'INTERVIEW_SCHEDULED': return 'bg-purple-100 text-purple-800'
      case 'INTERVIEW_COMPLETED': return 'bg-indigo-100 text-indigo-800'
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status)
  }

  const getPendingApplications = () => {
    return applications.filter(app => 
      ['PENDING', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'].includes(app.status)
    )
  }

  if (status === 'loading' || loading) {
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/admin/dashboard')}
                variant="secondary"
                className="btn-secondary"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-text-high">Admin Oversight</h1>
                <p className="text-text-mid">Complete system oversight and management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-8 h-8 text-primary" />
              <span className="text-text-high font-medium">Master Control</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-border overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'applicants', label: 'All Applicants', icon: UsersIcon },
              { id: 'applications', label: 'Total Applications', icon: DocumentTextIcon },
              { id: 'pending', label: 'Pending Reviews', icon: ClockIcon },
              { id: 'hired', label: 'Hired Reviews', icon: CheckCircleIcon },
              { id: 'rejected', label: 'Rejected Reviews', icon: XCircleIcon },
              { id: 'hr-performance', label: 'HR Performance', icon: UserGroupIcon },
              { id: 'job-management', label: 'Job Management', icon: BriefcaseIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary bg-opacity-10'
                    : 'border-transparent text-text-mid hover:text-text-high hover:bg-bg-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-mid text-sm">Total Applicants</p>
                      <p className="text-2xl font-bold text-text-high">{applicants.length}</p>
                    </div>
                    <UsersIcon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-mid text-sm">Total Applications</p>
                      <p className="text-2xl font-bold text-text-high">{applications.length}</p>
                    </div>
                    <DocumentTextIcon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-mid text-sm">Active Jobs</p>
                      <p className="text-2xl font-bold text-text-high">{jobs.filter(job => job.isActive).length}</p>
                    </div>
                    <BriefcaseIcon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-mid text-sm">HR Team Members</p>
                      <p className="text-2xl font-bold text-text-high">{hrUsers.length}</p>
                    </div>
                    <UserGroupIcon className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>

              {/* Application Status Overview */}
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-6">Application Status Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['PENDING', 'UNDER_REVIEW', 'HIRED', 'REJECTED'].map(status => (
                    <div key={status} className="text-center p-4 bg-bg-800 rounded-lg">
                      <p className="text-2xl font-bold text-text-high">
                        {getApplicationsByStatus(status).length}
                      </p>
                      <p className="text-text-mid text-sm">{status.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* All Applicants Tab */}
          {activeTab === 'applicants' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-6">All Applicants</h3>
                {applicants.length === 0 ? (
                  <div className="text-center py-12">
                    <UsersIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                    <p className="text-text-mid">No applicants found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-text-high">Applicant</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Applications</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Joined</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applicants.map((applicant, index) => (
                          <motion.tr
                            key={applicant.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="border-b border-border hover:bg-bg-800 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                  <UserIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-text-high">
                                    {applicant.firstName} {applicant.lastName}
                                  </p>
                                  <p className="text-sm text-text-mid">
                                    {applicant.phoneNumber || 'No phone'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-text-high">{applicant.email}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-primary bg-opacity-20 text-primary rounded-full text-sm">
                                {applicant.applications.length} applications
                              </span>
                            </td>
                            <td className="py-3 px-4 text-text-mid">
                              {new Date(applicant.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                {applicant.applications.length > 0 && (
                                  <Button
                                    onClick={() => handleViewProfile(applicant.applications[0].id)}
                                    variant="secondary"
                                    className="btn-secondary text-xs px-2 py-1"
                                  >
                                    <EyeIcon className="w-3 h-3 mr-1" />
                                    View Profile
                                  </Button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Total Applications Tab */}
          {activeTab === 'applications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-6">All Applications</h3>
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                    <p className="text-text-mid">No applications found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-text-high">Applicant</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Position</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Department</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Submitted</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((application, index) => (
                          <motion.tr
                            key={application.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="border-b border-border hover:bg-bg-800 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                  <UserIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-text-high">
                                    {application.jobTitle}
                                  </p>
                                  <p className="text-sm text-text-mid">
                                    {application.expectedSalary || 'No salary specified'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-text-high">{application.jobTitle}</td>
                            <td className="py-3 px-4 text-text-high">{application.job.department.name}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                {application.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-text-mid">
                              {new Date(application.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleViewProfile(application.id)}
                                  variant="secondary"
                                  className="btn-secondary text-xs px-2 py-1"
                                >
                                  <EyeIcon className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                                {!['REJECTED', 'HIRED'].includes(application.status) && (
                                  <Button
                                    onClick={() => {
                                      const reason = prompt('Enter rejection reason:')
                                      if (reason) handleRejectApplicant(application.id, reason)
                                    }}
                                    variant="secondary"
                                    className="btn-secondary text-xs px-2 py-1 text-red-600 hover:text-red-700"
                                  >
                                    <XCircleIcon className="w-3 h-3 mr-1" />
                                    Reject
                                  </Button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Pending Reviews Tab */}
          {activeTab === 'pending' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-6">Pending Reviews</h3>
                {getPendingApplications().length === 0 ? (
                  <div className="text-center py-12">
                    <ClockIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                    <p className="text-text-mid">No pending reviews</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-text-high">Applicant</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Position</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Days Pending</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPendingApplications().map((application, index) => {
                          const daysPending = Math.floor(
                            (new Date().getTime() - new Date(application.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
                          )
                          return (
                            <motion.tr
                              key={application.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: index * 0.1 }}
                              className="border-b border-border hover:bg-bg-800 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-text-high">
                                      {application.jobTitle}
                                    </p>
                                    <p className="text-sm text-text-mid">
                                      {application.expectedSalary || 'No salary specified'}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-text-high">{application.jobTitle}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                  {application.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  daysPending > 7 ? 'bg-red-100 text-red-800' : 
                                  daysPending > 3 ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {daysPending} days
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleViewProfile(application.id)}
                                    variant="secondary"
                                    className="btn-secondary text-xs px-2 py-1"
                                  >
                                    <EyeIcon className="w-3 h-3 mr-1" />
                                    Review
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      const reason = prompt('Enter rejection reason:')
                                      if (reason) handleRejectApplicant(application.id, reason)
                                    }}
                                    variant="secondary"
                                    className="btn-secondary text-xs px-2 py-1 text-red-600 hover:text-red-700"
                                  >
                                    <XCircleIcon className="w-3 h-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </td>
                            </motion.tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Hired Reviews Tab */}
          {activeTab === 'hired' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-6">Hired Applicants</h3>
                {getApplicationsByStatus('HIRED').length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircleIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                    <p className="text-text-mid">No hired applicants yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-text-high">Applicant</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Position</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Department</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Hired Date</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getApplicationsByStatus('HIRED').map((application, index) => (
                          <motion.tr
                            key={application.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="border-b border-border hover:bg-bg-800 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircleIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-text-high">
                                    {application.jobTitle}
                                  </p>
                                  <p className="text-sm text-text-mid">
                                    {application.expectedSalary || 'No salary specified'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-text-high">{application.jobTitle}</td>
                            <td className="py-3 px-4 text-text-high">{application.job.department.name}</td>
                            <td className="py-3 px-4 text-text-mid">
                              {new Date(application.updatedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                onClick={() => handleViewProfile(application.id)}
                                variant="secondary"
                                className="btn-secondary text-xs px-2 py-1"
                              >
                                <EyeIcon className="w-3 h-3 mr-1" />
                                View Profile
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Rejected Reviews Tab */}
          {activeTab === 'rejected' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-6">Rejected Applicants</h3>
                {getApplicationsByStatus('REJECTED').length === 0 ? (
                  <div className="text-center py-12">
                    <XCircleIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                    <p className="text-text-mid">No rejected applicants</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-text-high">Applicant</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Position</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Department</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Rejected Date</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getApplicationsByStatus('REJECTED').map((application, index) => (
                          <motion.tr
                            key={application.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="border-b border-border hover:bg-bg-800 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                  <XCircleIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-text-high">
                                    {application.jobTitle}
                                  </p>
                                  <p className="text-sm text-text-mid">
                                    {application.expectedSalary || 'No salary specified'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-text-high">{application.jobTitle}</td>
                            <td className="py-3 px-4 text-text-high">{application.job.department.name}</td>
                            <td className="py-3 px-4 text-text-mid">
                              {new Date(application.updatedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                onClick={() => handleViewProfile(application.id)}
                                variant="secondary"
                                className="btn-secondary text-xs px-2 py-1"
                              >
                                <EyeIcon className="w-3 h-3 mr-1" />
                                View Profile
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* HR Performance Tab */}
          {activeTab === 'hr-performance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-6">HR Performance Overview</h3>
                {hrUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <UserGroupIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                    <p className="text-text-mid">No HR team members found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hrUsers.map((hr, index) => (
                      <motion.div
                        key={hr.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-bg-800 p-6 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <UserGroupIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-text-high">
                              {hr.firstName} {hr.lastName}
                            </h4>
                            <p className="text-sm text-text-mid">{hr.email}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-text-mid">Jobs Posted:</span>
                            <span className="text-text-high font-medium">{hr.hrJobs.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-mid">Applications Reviewed:</span>
                            <span className="text-text-high font-medium">{hr.applicationsReviewed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-mid">Avg Review Time:</span>
                            <span className="text-text-high font-medium">{hr.averageReviewTime} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-mid">Interview Reviews:</span>
                            <span className="text-text-high font-medium">{hr.hrReviews.length}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex justify-between text-sm">
                            <span className="text-text-mid">Joined:</span>
                            <span className="text-text-high">
                              {new Date(hr.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Job Management Tab */}
          {activeTab === 'job-management' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-text-high">Job Management</h3>
                <Button
                  onClick={() => {
                    setEditingJob(null)
                    setShowJobModal(true)
                  }}
                  className="btn-primary"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              </div>
              
              <div className="card">
                {jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <BriefcaseIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                    <p className="text-text-mid">No jobs found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-text-high">Job Title</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Department</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Applications</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Created</th>
                          <th className="text-left py-3 px-4 font-medium text-text-high">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job, index) => (
                          <motion.tr
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="border-b border-border hover:bg-bg-800 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-text-high">{job.title}</p>
                                <p className="text-sm text-text-mid">
                                  by {job.createdBy.firstName} {job.createdBy.lastName}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-text-high">{job.department.name}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-primary bg-opacity-20 text-primary rounded-full text-sm">
                                {job.applications.length} applications
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                job.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {job.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-text-mid">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    setEditingJob(job)
                                    setShowJobModal(true)
                                  }}
                                  variant="secondary"
                                  className="btn-secondary text-xs px-2 py-1"
                                >
                                  <PencilIcon className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => handleDeleteJob(job.id)}
                                  variant="secondary"
                                  className="btn-secondary text-xs px-2 py-1 text-red-600 hover:text-red-700"
                                >
                                  <TrashIcon className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
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