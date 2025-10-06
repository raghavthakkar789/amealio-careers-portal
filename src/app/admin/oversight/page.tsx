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
  XCircleIcon,
  ClockIcon,
  StarIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  UserCircleIcon,
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
import { 
  Applicant, 
  Application, 
  ApplicationHistory, 
  HRUser, 
  Job, 
  InterviewReview,
  HRPerformanceMetrics 
} from '@/types/admin'

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
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [newJobData, setNewJobData] = useState({
    title: '',
    departmentId: '',
    summary: '',
    employmentTypes: [] as string[],
    requiredSkills: [] as string[],
    applicationDeadline: '',
    description: '',
    responsibilities: [] as string[],
    requirements: [] as string[],
    benefits: [] as string[],
    location: '',
    remoteWork: false
  })
  
  // Job Management states
  const [jobSearchTerm, setJobSearchTerm] = useState('')
  const [jobStatusFilter, setJobStatusFilter] = useState('')
  const [jobDepartmentFilter, setJobDepartmentFilter] = useState('')
  const [jobCurrentPage, setJobCurrentPage] = useState(1)
  const [jobItemsPerPage] = useState(10)
  
  // Applications Management states
  const [appSearchTerm, setAppSearchTerm] = useState('')
  const [appStatusFilter, setAppStatusFilter] = useState('')
  const [appDepartmentFilter, setAppDepartmentFilter] = useState('')
  const [appCurrentPage, setAppCurrentPage] = useState(1)
  const [appItemsPerPage] = useState(10)

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

  const openRejectModal = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const submitReject = async () => {
    if (!selectedApplicationId || !rejectReason.trim()) return
    await handleRejectApplicant(selectedApplicationId, rejectReason.trim())
    setShowRejectModal(false)
    setRejectReason('')
    setSelectedApplicationId(null)
  }


  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          action: 'UPDATE_STATUS',
          notes: notes || `Status updated to ${newStatus} by admin`
        }),
      })

      if (response.ok) {
        toast.success('Application status updated successfully')
        fetchApplications()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update application status')
      }
    } catch (error) {
      console.error('Error updating application status:', error)
      toast.error('Failed to update application status')
    }
  }

  const handleToggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus
        }),
      })

      if (response.ok) {
        toast.success(`Job ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        fetchJobs()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update job status')
      }
    } catch (error) {
      console.error('Error updating job status:', error)
      toast.error('Failed to update job status')
    }
  }

  const handleEditJob = async (jobId: string, jobData: typeof newJobData) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (response.ok) {
        toast.success('Job updated successfully')
        fetchJobs()
        setShowJobModal(false)
        setEditingJob(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update job')
      }
    } catch (error) {
      console.error('Error updating job:', error)
      toast.error('Failed to update job')
    }
  }

  const handleCreateJob = async (jobData: typeof newJobData) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (response.ok) {
        toast.success('Job created successfully')
        fetchJobs()
        setShowJobModal(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create job')
      }
    } catch (error) {
      console.error('Error creating job:', error)
      toast.error('Failed to create job')
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

  // Job Management functions
  const getFilteredJobs = () => {
    let filtered = [...jobs]

    if (jobSearchTerm) {
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.department?.name?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.createdBy?.firstName?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        job.createdBy?.lastName?.toLowerCase().includes(jobSearchTerm.toLowerCase())
      )
    }

    if (jobStatusFilter) {
      if (jobStatusFilter === 'active') {
        filtered = filtered.filter(job => job.isActive)
      } else if (jobStatusFilter === 'inactive') {
        filtered = filtered.filter(job => !job.isActive)
      } else if (jobStatusFilter === 'draft') {
        filtered = filtered.filter(job => job.isDraft)
      }
    }

    if (jobDepartmentFilter) {
      filtered = filtered.filter(job => job.department?.name === jobDepartmentFilter)
    }

    return filtered
  }

  const getPaginatedJobs = () => {
    const filtered = getFilteredJobs()
    const startIndex = (jobCurrentPage - 1) * jobItemsPerPage
    const endIndex = startIndex + jobItemsPerPage
    return filtered.slice(startIndex, endIndex)
  }

  const getTotalJobPages = () => {
    return Math.ceil(getFilteredJobs().length / jobItemsPerPage)
  }

  const getUniqueDepartments = () => {
    const departments = jobs.map(job => job.department?.name).filter(Boolean)
    return Array.from(new Set(departments))
  }

  // Applications Management functions
  const getFilteredApplications = () => {
    let filtered = [...applications]

    if (appSearchTerm) {
      filtered = filtered.filter(app => 
        app.applicant?.firstName?.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
        app.applicant?.lastName?.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
        app.jobTitle?.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
        app.job?.department?.name?.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
        app.applicant?.email?.toLowerCase().includes(appSearchTerm.toLowerCase())
      )
    }

    if (appStatusFilter) {
      filtered = filtered.filter(app => app.status === appStatusFilter)
    }

    if (appDepartmentFilter) {
      filtered = filtered.filter(app => app.job?.department?.name === appDepartmentFilter)
    }

    return filtered
  }

  const getPaginatedApplications = () => {
    const filtered = getFilteredApplications()
    const startIndex = (appCurrentPage - 1) * appItemsPerPage
    const endIndex = startIndex + appItemsPerPage
    return filtered.slice(startIndex, endIndex)
  }

  const getTotalApplicationPages = () => {
    return Math.ceil(getFilteredApplications().length / appItemsPerPage)
  }

  const getUniqueApplicationDepartments = () => {
    const departments = applications.map(app => app.job?.department?.name).filter(Boolean)
    return Array.from(new Set(departments))
  }

  const getUniqueApplicationStatuses = () => {
    const statuses = applications.map(app => app.status).filter(Boolean)
    return Array.from(new Set(statuses))
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
              { id: 'hired', label: 'Hired Reviews', icon: UserIcon },
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
                {/* Search and Filters */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-text-high">All Applications</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Search applications..."
                      value={appSearchTerm}
                      onChange={(e) => {
                        setAppSearchTerm(e.target.value)
                        setAppCurrentPage(1)
                      }}
                      className="px-3 py-2 bg-bg-800 border border-border rounded-lg text-text-high placeholder-text-mid focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select
                      value={appStatusFilter}
                      onChange={(e) => {
                        setAppStatusFilter(e.target.value)
                        setAppCurrentPage(1)
                      }}
                      className="px-3 py-2 bg-bg-800 border border-border rounded-lg text-text-high focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Status</option>
                      {getUniqueApplicationStatuses().map(status => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    <select
                      value={appDepartmentFilter}
                      onChange={(e) => {
                        setAppDepartmentFilter(e.target.value)
                        setAppCurrentPage(1)
                      }}
                      className="px-10 py-2 bg-bg-800 border border-border rounded-lg text-text-high focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Departments</option>
                      {getUniqueApplicationDepartments().map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <div className="text-sm text-text-mid">
                      {getFilteredApplications().length} of {applications.length} applications
                    </div>
                  </div>
                </div>

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
                        {getPaginatedApplications().map((application, index) => (
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
                                  {application.applicant.firstName} {application.applicant.lastName}
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
                                  <>
                                <Button
                                  onClick={() => openRejectModal(application.id)}
                                      variant="secondary"
                                      className="btn-secondary text-xs px-2 py-1 text-red-600 hover:text-red-700"
                                    >
                                      <XCircleIcon className="w-3 h-3 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Pagination */}
                    {getTotalApplicationPages() > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-text-mid">
                          Showing {((appCurrentPage - 1) * appItemsPerPage) + 1} to {Math.min(appCurrentPage * appItemsPerPage, getFilteredApplications().length)} of {getFilteredApplications().length} results
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setAppCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={appCurrentPage === 1}
                            variant="secondary"
                            className="btn-secondary text-xs px-3 py-1"
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-text-mid">
                            Page {appCurrentPage} of {getTotalApplicationPages()}
                          </span>
                          <Button
                            onClick={() => setAppCurrentPage(prev => Math.min(getTotalApplicationPages(), prev + 1))}
                            disabled={appCurrentPage === getTotalApplicationPages()}
                            variant="secondary"
                            className="btn-secondary text-xs px-3 py-1"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
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
                                      {application.applicant.firstName} {application.applicant.lastName}
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
                                    onClick={() => openRejectModal(application.id)}
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
                    <UserIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
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
                                  <UserIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-text-high">
                                    {application.applicant.firstName} {application.applicant.lastName}
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
                                      {application.applicant.firstName} {application.applicant.lastName}
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
                    setNewJobData({
                      title: '',
                      departmentId: '',
                      summary: '',
                      employmentTypes: [],
                      requiredSkills: [],
                      applicationDeadline: '',
                      description: '',
                      responsibilities: [],
                      requirements: [],
                      benefits: [],
                      location: '',
                      remoteWork: false
                    })
                    setShowJobModal(true)
                  }}
                  className="btn-primary"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              </div>
              
              <div className="card">
                {/* Search and Filters */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      value={jobSearchTerm}
                      onChange={(e) => {
                        setJobSearchTerm(e.target.value)
                        setJobCurrentPage(1)
                      }}
                      className="px-3 py-2 bg-bg-800 border border-border rounded-lg text-text-high placeholder-text-mid focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select
                      value={jobStatusFilter}
                      onChange={(e) => {
                        setJobStatusFilter(e.target.value)
                        setJobCurrentPage(1)
                      }}
                      className="px-3 py-2 bg-bg-800 border border-border rounded-lg text-text-high focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </select>
                    <select
                      value={jobDepartmentFilter}
                      onChange={(e) => {
                        setJobDepartmentFilter(e.target.value)
                        setJobCurrentPage(1)
                      }}
                      className="px-3 py-2 bg-bg-800 border border-border rounded-lg text-text-high focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Departments</option>
                      {getUniqueDepartments().map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-text-mid">
                    {getFilteredJobs().length} of {jobs.length} jobs
                  </div>
                </div>

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
                        {getPaginatedJobs().map((job, index) => (
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
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  job.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {job.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <Button
                                  onClick={() => handleToggleJobStatus(job.id, job.isActive)}
                                  variant="secondary"
                                  className="btn-secondary text-xs px-2 py-1"
                                >
                                  {job.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                              </div>
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
                    
                    {/* Pagination */}
                    {getTotalJobPages() > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-text-mid">
                          Showing {((jobCurrentPage - 1) * jobItemsPerPage) + 1} to {Math.min(jobCurrentPage * jobItemsPerPage, getFilteredJobs().length)} of {getFilteredJobs().length} results
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setJobCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={jobCurrentPage === 1}
                            variant="secondary"
                            className="btn-secondary text-xs px-3 py-1"
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-text-mid">
                            Page {jobCurrentPage} of {getTotalJobPages()}
                          </span>
                          <Button
                            onClick={() => setJobCurrentPage(prev => Math.min(getTotalJobPages(), prev + 1))}
                            disabled={jobCurrentPage === getTotalJobPages()}
                            variant="secondary"
                            className="btn-secondary text-xs px-3 py-1"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
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

      {/* Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-850 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-high">
                {editingJob ? 'Edit Job' : 'Create New Job'}
              </h3>
              <Button
                onClick={() => {
                  setShowJobModal(false)
                  setEditingJob(null)
                }}
                variant="secondary"
                className="btn-secondary"
              >
                <XCircleIcon className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              if (editingJob) {
                handleEditJob(editingJob.id, newJobData)
              } else {
                handleCreateJob(newJobData)
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-high mb-2">Job Title</label>
                <input
                  type="text"
                  value={newJobData.title}
                  onChange={(e) => setNewJobData({...newJobData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-bg-800 border border-border rounded-lg text-text-high focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-high mb-2">Department</label>
                <select
                  value={newJobData.departmentId}
                  onChange={(e) => setNewJobData({...newJobData, departmentId: e.target.value})}
                  className="w-full px-3 py-2 bg-bg-800 border border-border rounded-lg text-text-high focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="HR">Human Resources</option>
                  <option value="ENGINEERING">Engineering</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="SALES">Sales</option>
                  <option value="FINANCE">Finance</option>
                  <option value="OPERATIONS">Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-high mb-2">Summary</label>
                <textarea
                  value={newJobData.summary}
                  onChange={(e) => setNewJobData({...newJobData, summary: e.target.value})}
                  className="w-full px-3 py-2 bg-bg-800 border border-border rounded-lg text-text-high focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-high mb-2">Description</label>
                <textarea
                  value={newJobData.description}
                  onChange={(e) => setNewJobData({...newJobData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-bg-800 border border-border rounded-lg text-text-high focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-high mb-2">Location</label>
                <input
                  type="text"
                  value={newJobData.location}
                  onChange={(e) => setNewJobData({...newJobData, location: e.target.value})}
                  className="w-full px-3 py-2 bg-bg-800 border border-border rounded-lg text-text-high focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newJobData.remoteWork}
                    onChange={(e) => setNewJobData({...newJobData, remoteWork: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-text-high">Remote Work Available</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-high mb-2">Application Deadline</label>
                <input
                  type="date"
                  value={newJobData.applicationDeadline}
                  onChange={(e) => setNewJobData({...newJobData, applicationDeadline: e.target.value})}
                  className="w-full px-3 py-2 bg-bg-800 border border-border rounded-lg text-text-high focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingJob ? 'Update Job' : 'Create Job'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowJobModal(false)
                    setEditingJob(null)
                  }}
                  variant="secondary"
                  className="btn-secondary flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-850 rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold text-text-high mb-4">Reject Application</h3>
            <p className="text-text-mid mb-4">Please provide a brief reason for rejection. This will be visible to the applicant in Recent Activity and to Admin in Application Information.</p>
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
                  setSelectedApplicationId(null)
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