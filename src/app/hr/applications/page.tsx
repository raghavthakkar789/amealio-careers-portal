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
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface Application {
  id: string
  applicantName: string
  applicantEmail: string
  applicantPhone?: string
  jobTitle: string
  department: string
  appliedDate: string
  status: 'PENDING' | 'REVIEW' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED'
  experience: string
  education: string
  skills: string[]
  resumeUrl?: string
  coverLetter?: string
  interviewDate?: string
  notes?: string
}

export default function HRApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedJob, setSelectedJob] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user?.role !== 'HR') {
      router.push('/login')
      return
    }

    // Mock data - replace with actual API call
    setTimeout(() => {
      setApplications([
        {
          id: '1',
          applicantName: 'John Doe',
          applicantEmail: 'john.doe@example.com',
          applicantPhone: '+1 (555) 123-4567',
          jobTitle: 'Senior Software Engineer',
          department: 'Engineering',
          appliedDate: '2024-01-15',
          status: 'INTERVIEW',
          experience: '5+ years',
          education: 'Bachelor of Computer Science',
          skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
          resumeUrl: '/resumes/john-doe-resume.pdf',
          coverLetter: 'I am excited to apply for the Senior Software Engineer position...',
          interviewDate: '2024-01-25',
          notes: 'Strong technical background, good communication skills'
        },
        {
          id: '2',
          applicantName: 'Jane Smith',
          applicantEmail: 'jane.smith@example.com',
          applicantPhone: '+1 (555) 987-6543',
          jobTitle: 'Product Manager',
          department: 'Product',
          appliedDate: '2024-01-10',
          status: 'REVIEW',
          experience: '3+ years',
          education: 'MBA in Business Administration',
          skills: ['Product Management', 'Agile', 'Analytics', 'Leadership'],
          resumeUrl: '/resumes/jane-smith-resume.pdf',
          coverLetter: 'I have extensive experience in product management...',
          notes: 'Excellent analytical skills, needs technical interview'
        },
        {
          id: '3',
          applicantName: 'Mike Johnson',
          applicantEmail: 'mike.johnson@example.com',
          applicantPhone: '+1 (555) 456-7890',
          jobTitle: 'UX Designer',
          department: 'Design',
          appliedDate: '2024-01-05',
          status: 'ACCEPTED',
          experience: '4+ years',
          education: 'Bachelor of Design',
          skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'User Research'],
          resumeUrl: '/resumes/mike-johnson-resume.pdf',
          coverLetter: 'I am passionate about creating user-centered designs...',
          notes: 'Outstanding portfolio, great cultural fit'
        },
        {
          id: '4',
          applicantName: 'Sarah Wilson',
          applicantEmail: 'sarah.wilson@example.com',
          applicantPhone: '+1 (555) 321-0987',
          jobTitle: 'Marketing Specialist',
          department: 'Marketing',
          appliedDate: '2023-12-20',
          status: 'REJECTED',
          experience: '2+ years',
          education: 'Bachelor of Marketing',
          skills: ['Digital Marketing', 'SEO', 'Content Creation', 'Analytics'],
          resumeUrl: '/resumes/sarah-wilson-resume.pdf',
          coverLetter: 'I have a strong background in digital marketing...',
          notes: 'Good skills but lacks experience in B2B marketing'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [session, status, router])

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

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus as any }
            : app
        )
      )
      
      toast.success(`Application status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update application status')
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus
    const matchesJob = selectedJob === 'ALL' || app.jobTitle === selectedJob
    const matchesSearch = searchTerm === '' || 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesJob && matchesSearch
  })

  const statusCounts = {
    ALL: applications.length,
    PENDING: applications.filter(app => app.status === 'PENDING').length,
    REVIEW: applications.filter(app => app.status === 'REVIEW').length,
    INTERVIEW: applications.filter(app => app.status === 'INTERVIEW').length,
    ACCEPTED: applications.filter(app => app.status === 'ACCEPTED').length,
    REJECTED: applications.filter(app => app.status === 'REJECTED').length,
  }

  const uniqueJobs = Array.from(new Set(applications.map(app => app.jobTitle)))

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-850">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session || session.user?.role !== 'HR') {
    return null
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
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push('/hr/dashboard')}
                  variant="secondary"
                  className="btn-secondary hover-lift"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Job Applications
                  </h1>
                  <p className="text-text-mid mt-2">
                    Review and manage candidate applications for all positions.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-text-high">{applications.length}</p>
                  <p className="text-sm text-text-mid">Total Applications</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="card mb-8">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-mid" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or job title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="ALL">All Jobs</option>
                  {uniqueJobs.map(job => (
                    <option key={job} value={job}>{job}</option>
                  ))}
                </select>
              </div>
            </div>

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
                <p className="text-text-mid">
                  {searchTerm || selectedStatus !== 'ALL' || selectedJob !== 'ALL'
                    ? "No applications match your current filters."
                    : "No applications have been submitted yet."
                  }
                </p>
              </div>
            ) : (
              filteredApplications.map((application, index) => (
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
                        <span className={`status-badge ${getStatusColor(application.status)}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(application.status)}
                            {application.status}
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-text-mid">Experience</p>
                          <p className="font-medium text-text-high">{application.experience}</p>
                        </div>
                        <div>
                          <p className="text-sm text-text-mid">Education</p>
                          <p className="font-medium text-text-high">{application.education}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-text-mid mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {application.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-bg-800 text-text-mid text-sm rounded-md border border-border"
                            >
                              {skill}
                            </span>
                          ))}
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
                        onClick={() => setSelectedApplication(application)}
                        variant="secondary"
                        className="btn-secondary"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      
                      {application.status === 'REVIEW' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => updateApplicationStatus(application.id, 'INTERVIEW')}
                            className="btn-primary text-sm"
                          >
                            Schedule Interview
                          </Button>
                          <Button
                            onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                            variant="secondary"
                            className="btn-secondary text-sm"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      {application.status === 'INTERVIEW' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => updateApplicationStatus(application.id, 'ACCEPTED')}
                            className="btn-primary text-sm"
                          >
                            Accept
                          </Button>
                          <Button
                            onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                            variant="secondary"
                            className="btn-secondary text-sm"
                          >
                            Reject
                          </Button>
                        </div>
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
