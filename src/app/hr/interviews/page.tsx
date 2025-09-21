'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  PlusIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

interface Interview {
  id: string
  applicantName: string
  applicantEmail: string
  jobTitle: string
  department: string
  interviewDate: string
  interviewTime: string
  duration: number
  type: 'PHONE' | 'VIDEO' | 'IN_PERSON'
  location?: string
  meetingLink?: string
  interviewer: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
  notes?: string
  feedback?: string
  rating?: number
}

export default function HRInterviewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)

  const [scheduleForm, setScheduleForm] = useState({
    applicantName: '',
    applicantEmail: '',
    jobTitle: '',
    department: '',
    interviewDate: '',
    interviewTime: '',
    duration: 60,
    type: 'VIDEO' as 'PHONE' | 'VIDEO' | 'IN_PERSON',
    location: '',
    meetingLink: '',
    interviewer: '',
    notes: ''
  })

  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    feedback: '',
    recommendation: 'PENDING' as 'HIRE' | 'NO_HIRE' | 'PENDING'
  })

  const [rescheduleForm, setRescheduleForm] = useState({
    interviewDate: '',
    interviewTime: '',
    duration: 60,
    type: 'VIDEO' as 'PHONE' | 'VIDEO' | 'IN_PERSON',
    location: '',
    meetingLink: '',
    interviewer: '',
    notes: ''
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user?.role !== 'HR') {
      router.push('/login')
      return
    }

    // Mock data - replace with actual API call
    setTimeout(() => {
      setInterviews([
        {
          id: '1',
          applicantName: 'John Doe',
          applicantEmail: 'john.doe@example.com',
          jobTitle: 'Senior Software Engineer',
          department: 'Engineering',
          interviewDate: '2024-01-25',
          interviewTime: '10:00',
          duration: 60,
          type: 'VIDEO',
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          interviewer: 'Sarah Johnson',
          status: 'SCHEDULED',
          notes: 'Technical interview focusing on React and Node.js'
        },
        {
          id: '2',
          applicantName: 'Jane Smith',
          applicantEmail: 'jane.smith@example.com',
          jobTitle: 'Product Manager',
          department: 'Product',
          interviewDate: '2024-01-20',
          interviewTime: '14:00',
          duration: 90,
          type: 'IN_PERSON',
          location: 'Conference Room A',
          interviewer: 'Mike Chen',
          status: 'COMPLETED',
          notes: 'Product strategy and leadership discussion',
          feedback: 'Strong analytical skills, good communication',
          rating: 4
        },
        {
          id: '3',
          applicantName: 'Mike Johnson',
          applicantEmail: 'mike.johnson@example.com',
          jobTitle: 'UX Designer',
          department: 'Design',
          interviewDate: '2024-01-18',
          interviewTime: '11:30',
          duration: 45,
          type: 'PHONE',
          interviewer: 'Lisa Wang',
          status: 'COMPLETED',
          notes: 'Portfolio review and design process discussion',
          feedback: 'Excellent design thinking, great cultural fit',
          rating: 5
        },
        {
          id: '4',
          applicantName: 'Sarah Wilson',
          applicantEmail: 'sarah.wilson@example.com',
          jobTitle: 'Marketing Specialist',
          department: 'Marketing',
          interviewDate: '2024-01-15',
          interviewTime: '15:30',
          duration: 60,
          type: 'VIDEO',
          meetingLink: 'https://zoom.us/j/123456789',
          interviewer: 'David Kim',
          status: 'CANCELLED',
          notes: 'Cancelled by applicant due to scheduling conflict'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [session, status, router])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <CalendarIcon className="w-5 h-5 text-blue-500" />
      case 'COMPLETED':
        return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
      case 'CANCELLED':
        return <XCircleIcon className="w-5 h-5 text-rose-500" />
      case 'RESCHEDULED':
        return <ClockIcon className="w-5 h-5 text-amber-500" />
      default:
        return <CalendarIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-700 border-rose-200'
      case 'RESCHEDULED':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <VideoCameraIcon className="w-5 h-5 text-purple-500" />
      case 'PHONE':
        return <PhoneIcon className="w-5 h-5 text-blue-500" />
      case 'IN_PERSON':
        return <MapPinIcon className="w-5 h-5 text-green-500" />
      default:
        return <CalendarIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newInterview: Interview = {
        id: Date.now().toString(),
        ...scheduleForm,
        status: 'SCHEDULED'
      }
      
      setInterviews(prev => [...prev, newInterview])
      setShowScheduleModal(false)
      setScheduleForm({
        applicantName: '',
        applicantEmail: '',
        jobTitle: '',
        department: '',
        interviewDate: '',
        interviewTime: '',
        duration: 60,
        type: 'VIDEO',
        location: '',
        meetingLink: '',
        interviewer: '',
        notes: ''
      })
      
      toast.success('Interview scheduled successfully!')
    } catch {
      toast.error('Failed to schedule interview')
    }
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInterview) return

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setInterviews(prev => 
        prev.map(interview => 
          interview.id === selectedInterview.id 
            ? { 
                ...interview, 
                feedback: feedbackForm.feedback,
                rating: feedbackForm.rating,
                status: 'COMPLETED'
              }
            : interview
        )
      )
      
      setShowFeedbackModal(false)
      setSelectedInterview(null)
      setFeedbackForm({ rating: 0, feedback: '', recommendation: 'PENDING' })
      
      toast.success('Feedback submitted successfully!')
    } catch {
      toast.error('Failed to submit feedback')
    }
  }

  const handleRescheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInterview) return

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setInterviews(prev => 
        prev.map(interview => 
          interview.id === selectedInterview.id 
            ? { 
                ...interview, 
                interviewDate: rescheduleForm.interviewDate,
                interviewTime: rescheduleForm.interviewTime,
                duration: rescheduleForm.duration,
                type: rescheduleForm.type,
                location: rescheduleForm.location,
                meetingLink: rescheduleForm.meetingLink,
                interviewer: rescheduleForm.interviewer,
                notes: rescheduleForm.notes,
                status: 'RESCHEDULED'
              }
            : interview
        )
      )
      
      setShowRescheduleModal(false)
      setSelectedInterview(null)
      setRescheduleForm({
        interviewDate: '',
        interviewTime: '',
        duration: 60,
        type: 'VIDEO',
        location: '',
        meetingLink: '',
        interviewer: '',
        notes: ''
      })
      
      toast.success('Interview rescheduled successfully!')
    } catch {
      toast.error('Failed to reschedule interview')
    }
  }

  const filteredInterviews = interviews.filter(interview => {
    const matchesStatus = selectedStatus === 'ALL' || interview.status === selectedStatus
    const matchesType = selectedType === 'ALL' || interview.type === selectedType
    const matchesSearch = searchTerm === '' || 
      interview.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.interviewer.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesType && matchesSearch
  })

  const statusCounts = {
    ALL: interviews.length,
    SCHEDULED: interviews.filter(interview => interview.status === 'SCHEDULED').length,
    COMPLETED: interviews.filter(interview => interview.status === 'COMPLETED').length,
    CANCELLED: interviews.filter(interview => interview.status === 'CANCELLED').length,
    RESCHEDULED: interviews.filter(interview => interview.status === 'RESCHEDULED').length,
  }

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
                    Interview Management
                  </h1>
                  <p className="text-text-mid mt-2">
                    Schedule, manage, and track interview sessions with candidates.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-text-high">{interviews.length}</p>
                  <p className="text-sm text-text-mid">Total Interviews</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={() => setShowScheduleModal(true)}
              className="btn-primary"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Schedule Interview
            </Button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Filters and Search */}
          <div className="card mb-8">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-mid" />
                  <input
                    type="text"
                    placeholder="Search by name, job title, or interviewer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="ALL">All Types</option>
                  <option value="VIDEO">Video Call</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="IN_PERSON">In Person</option>
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

          {/* Interviews List */}
          <div className="space-y-4">
            {filteredInterviews.length === 0 ? (
              <div className="card text-center py-12">
                <CalendarIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-high mb-2">
                  No Interviews Found
                </h3>
                <p className="text-text-mid">
                  {searchTerm || selectedStatus !== 'ALL' || selectedType !== 'ALL'
                    ? "No interviews match your current filters."
                    : "No interviews have been scheduled yet."
                  }
                </p>
              </div>
            ) : (
              filteredInterviews.map((interview, index) => (
                <motion.div
                  key={interview.id}
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
                            {interview.applicantName}
                          </h3>
                          <p className="text-text-mid">{interview.applicantEmail}</p>
                        </div>
                        <span className={`status-badge ${getStatusColor(interview.status)}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(interview.status)}
                            {interview.status}
                          </span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-text-mid">Job Position</p>
                          <p className="font-medium text-text-high">{interview.jobTitle}</p>
                        </div>
                        <div>
                          <p className="text-sm text-text-mid">Department</p>
                          <p className="font-medium text-text-high">{interview.department}</p>
                        </div>
                        <div>
                          <p className="text-sm text-text-mid">Interviewer</p>
                          <p className="font-medium text-text-high">{interview.interviewer}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-text-mid">Date & Time</p>
                          <p className="font-medium text-text-high">
                            {new Date(interview.interviewDate).toLocaleDateString()} at {interview.interviewTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-text-mid">Duration</p>
                          <p className="font-medium text-text-high">{interview.duration} minutes</p>
                        </div>
                        <div>
                          <p className="text-sm text-text-mid">Type</p>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(interview.type)}
                            <span className="font-medium text-text-high">
                              {interview.type === 'IN_PERSON' ? 'In Person' : 
                               interview.type === 'VIDEO' ? 'Video Call' : 'Phone Call'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {interview.location && (
                        <div className="mb-4">
                          <p className="text-sm text-text-mid">Location</p>
                          <p className="font-medium text-text-high">{interview.location}</p>
                        </div>
                      )}

                      {interview.meetingLink && (
                        <div className="mb-4">
                          <p className="text-sm text-text-mid">Meeting Link</p>
                          <a 
                            href={interview.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-hover"
                          >
                            {interview.meetingLink}
                          </a>
                        </div>
                      )}

                      {interview.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-text-mid">Notes</p>
                          <p className="text-text-high bg-bg-800 p-3 rounded-lg border border-border">
                            {interview.notes}
                          </p>
                        </div>
                      )}

                      {interview.feedback && (
                        <div className="mb-4">
                          <p className="text-sm text-text-mid">Feedback</p>
                          <p className="text-text-high bg-bg-800 p-3 rounded-lg border border-border">
                            {interview.feedback}
                          </p>
                          {interview.rating && (
                            <div className="mt-2">
                              <p className="text-sm text-text-mid">Rating: {interview.rating}/5</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {interview.status === 'SCHEDULED' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedInterview(interview)
                              setShowFeedbackModal(true)
                            }}
                            className="btn-primary text-sm"
                          >
                            Complete Interview
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedInterview(interview)
                              setRescheduleForm({
                                interviewDate: interview.interviewDate,
                                interviewTime: interview.interviewTime,
                                duration: interview.duration,
                                type: interview.type,
                                location: interview.location || '',
                                meetingLink: interview.meetingLink || '',
                                interviewer: interview.interviewer,
                                notes: interview.notes || ''
                              })
                              setShowRescheduleModal(true)
                            }}
                            variant="secondary"
                            className="btn-secondary text-sm"
                          >
                            Reschedule
                          </Button>
                        </div>
                      )}
                      
                      {interview.status === 'COMPLETED' && (
                        <Button
                          onClick={() => {
                            setSelectedInterview(interview)
                            setShowFeedbackModal(true)
                          }}
                          variant="secondary"
                          className="btn-secondary text-sm"
                        >
                          <PencilIcon className="w-4 h-4 mr-2" />
                          Edit Feedback
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

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-5xl">
            {/* Professional Header Section */}
            <div className="bg-gradient-to-r from-primary to-purple-600 rounded-t-lg p-6 text-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    Schedule New Interview
                  </h2>
                  <p className="text-purple-100 text-sm">
                    Create a new interview appointment for candidate evaluation
                  </p>
                </div>
              </div>
              
              {/* Quick Info Bar */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span>Candidate Information Required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Schedule & Duration Setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <VideoCameraIcon className="w-4 h-4" />
                    <span>Interview Format Configuration</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Professional Form Section */}
            <div className="p-6 bg-bg-800">
              <form onSubmit={handleScheduleInterview} className="space-y-8">
                {/* Candidate Information Section */}
                <div className="bg-white rounded-lg border border-border p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">1</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-high">Candidate Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <UserIcon className="w-4 h-4" />
                        Candidate Name
                      </label>
                      <Input
                        value={scheduleForm.applicantName}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, applicantName: e.target.value }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        placeholder="Enter candidate's full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <EnvelopeIcon className="w-4 h-4" />
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={scheduleForm.applicantEmail}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, applicantEmail: e.target.value }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        placeholder="candidate@email.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <BriefcaseIcon className="w-4 h-4" />
                        Position Title
                      </label>
                      <Input
                        value={scheduleForm.jobTitle}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g., Senior Software Engineer"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <BuildingOfficeIcon className="w-4 h-4" />
                        Department
                      </label>
                      <Input
                        value={scheduleForm.department}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, department: e.target.value }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g., Engineering, Marketing"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule Configuration Section */}
                <div className="bg-white rounded-lg border border-border p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-emerald-600">2</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-high">Schedule Configuration</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <CalendarIcon className="w-4 h-4" />
                        Interview Date
                      </label>
                      <Input
                        type="date"
                        value={scheduleForm.interviewDate}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, interviewDate: e.target.value }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <ClockIcon className="w-4 h-4" />
                        Start Time
                      </label>
                      <Input
                        type="time"
                        value={scheduleForm.interviewTime}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, interviewTime: e.target.value }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <ClockIcon className="w-4 h-4" />
                        Duration (minutes)
                      </label>
                      <select
                        value={scheduleForm.duration}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full p-3 border border-border rounded-lg bg-white text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        required
                      >
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                        <option value={120}>120 minutes</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Interview Setup Section */}
                <div className="bg-white rounded-lg border border-border p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-purple-600">3</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-high">Interview Setup</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        {getTypeIcon(scheduleForm.type)}
                        Interview Format
                      </label>
                      <select
                        value={scheduleForm.type}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, type: e.target.value as 'PHONE' | 'VIDEO' | 'IN_PERSON' }))}
                        className="w-full p-3 border border-border rounded-lg bg-white text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      >
                        <option value="VIDEO">📹 Video Conference Call</option>
                        <option value="PHONE">📞 Phone Interview</option>
                        <option value="IN_PERSON">🏢 In-Person Meeting</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <UserIcon className="w-4 h-4" />
                        Interviewer
                      </label>
                      <Input
                        value={scheduleForm.interviewer}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, interviewer: e.target.value }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        placeholder="Interviewer's name"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Conditional Fields */}
                  {scheduleForm.type === 'IN_PERSON' && (
                    <div className="mt-6 space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <MapPinIcon className="w-4 h-4" />
                        Meeting Location
                      </label>
                      <Input
                        value={scheduleForm.location}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g., Conference Room A, Main Office Building"
                        required
                      />
                    </div>
                  )}
                  
                  {scheduleForm.type === 'VIDEO' && (
                    <div className="mt-6 space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <VideoCameraIcon className="w-4 h-4" />
                        Meeting Link
                      </label>
                      <Input
                        value={scheduleForm.meetingLink}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        placeholder="https://meet.google.com/abc-defg-hij"
                      />
                      <p className="text-xs text-text-mid">
                        Leave blank if you&apos;ll send the link separately
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Additional Information Section */}
                <div className="bg-white rounded-lg border border-border p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-amber-600">4</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-high">Additional Information</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-mid">
                      Interview Notes & Instructions
                    </label>
                    <textarea
                      value={scheduleForm.notes}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full p-4 border border-border rounded-lg bg-white text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-colors"
                      rows={4}
                      placeholder="Add any special instructions, preparation requirements, or notes for the interviewer..."
                    />
                  </div>
                </div>
                
                {/* Professional Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                  <Button 
                    type="submit" 
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-base font-medium"
                  >
                    <CalendarIcon className="w-5 h-5" />
                    Schedule Interview
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    variant="secondary"
                    className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3 text-base font-medium"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedInterview && (
        <div className="modal-overlay">
          <div className="modal-content max-w-4xl">
            {/* Professional Header Section */}
            <div className="bg-gradient-to-r from-primary to-purple-600 rounded-t-lg p-6 text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
                      Interview Evaluation Report
                    </h2>
                    <p className="text-purple-100 text-sm">
                      Candidate: {selectedInterview.applicantName}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-purple-100">
                  <div>Interview Date: {new Date(selectedInterview.interviewDate).toLocaleDateString()}</div>
                  <div>Position: {selectedInterview.jobTitle}</div>
                </div>
              </div>
              
              {/* Interview Details Grid */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(selectedInterview.interviewDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>{selectedInterview.interviewTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedInterview.type)}
                    <span>
                      {selectedInterview.type === 'IN_PERSON' ? 'In Person' : 
                       selectedInterview.type === 'VIDEO' ? 'Video Call' : 'Phone Call'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span>{selectedInterview.interviewer}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Professional Form Section */}
            <div className="p-6 bg-bg-800">
              <form onSubmit={handleSubmitFeedback} className="space-y-8">
                {/* Performance Assessment Section */}
                <div className="bg-white rounded-lg border border-border p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">1</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-high">Performance Assessment</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-mid mb-3">
                        Overall Candidate Rating
                      </label>
                      <select
                        value={feedbackForm.rating}
                        onChange={(e) => setFeedbackForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                        className="w-full p-3 border border-border rounded-lg bg-white text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        required
                      >
                        <option value={0}>Select Performance Rating</option>
                        <option value={1}>1 - Unsatisfactory - Does not meet requirements</option>
                        <option value={2}>2 - Below Expectations - Significant gaps in performance</option>
                        <option value={3}>3 - Meets Expectations - Adequate performance</option>
                        <option value={4}>4 - Exceeds Expectations - Strong performance</option>
                        <option value={5}>5 - Outstanding - Exceptional performance</option>
                      </select>
                    </div>
                    
                    {/* Professional Rating Display */}
                    {feedbackForm.rating > 0 && (
                      <div className="bg-bg-850 rounded-lg border border-border p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-text-mid">Selected Rating:</span>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                    i < feedbackForm.rating 
                                      ? 'bg-primary border-primary text-white' 
                                      : 'bg-gray-100 border-gray-300 text-gray-500'
                                  }`}
                                >
                                  {i + 1}
                                </div>
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-text-high">
                              {feedbackForm.rating}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hiring Decision Section */}
                <div className="bg-white rounded-lg border border-border p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-emerald-600">2</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-high">Hiring Decision</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-mid mb-3">
                        Recommendation
                      </label>
                      <select
                        value={feedbackForm.recommendation}
                        onChange={(e) => setFeedbackForm(prev => ({ ...prev, recommendation: e.target.value as 'HIRE' | 'NO_HIRE' | 'PENDING' }))}
                        className="w-full p-3 border border-border rounded-lg bg-white text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        required
                      >
                        <option value="PENDING">Pending Decision - Additional evaluation required</option>
                        <option value="HIRE">Recommend for Hire - Strong candidate</option>
                        <option value="NO_HIRE">Do Not Hire - Not suitable for position</option>
                      </select>
                    </div>
                    
                    {/* Professional Recommendation Display */}
                    {feedbackForm.recommendation !== 'PENDING' && (
                      <div className={`rounded-lg border p-4 ${
                        feedbackForm.recommendation === 'HIRE' 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : 'bg-rose-50 border-rose-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          {feedbackForm.recommendation === 'HIRE' ? (
                            <>
                              <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                              <div>
                                <div className="text-sm font-semibold text-emerald-700">
                                  Recommended for Hire
                                </div>
                                <div className="text-xs text-emerald-600">
                                  Candidate demonstrates strong qualifications and cultural fit
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-5 h-5 text-rose-600" />
                              <div>
                                <div className="text-sm font-semibold text-rose-700">
                                  Not Recommended for Hire
                                </div>
                                <div className="text-xs text-rose-600">
                                  Candidate does not meet position requirements
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Detailed Evaluation Section */}
                <div className="bg-white rounded-lg border border-border p-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-purple-600">3</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-high">Detailed Evaluation</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-mid mb-3">
                        Comprehensive Interview Feedback
                      </label>
                      <textarea
                        value={feedbackForm.feedback}
                        onChange={(e) => setFeedbackForm(prev => ({ ...prev, feedback: e.target.value }))}
                        className="w-full p-4 border border-border rounded-lg bg-white text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-colors"
                        rows={10}
                        placeholder="Please provide a comprehensive evaluation covering:

Technical Competency:
• Assessment of technical skills and knowledge
• Problem-solving approach and methodology
• Relevant experience and expertise

Communication & Interpersonal Skills:
• Clarity of communication
• Listening skills and responsiveness
• Professional demeanor and presentation

Cultural Fit & Team Collaboration:
• Alignment with company values
• Teamwork and collaboration potential
• Leadership qualities and initiative

Areas of Strength:
• Key strengths and positive attributes
• Unique qualifications and contributions

Areas for Development:
• Areas requiring improvement
• Training or development needs

Overall Assessment:
• Summary of candidate's suitability
• Final recommendation rationale

Please be specific, objective, and constructive in your evaluation..."
                        required
                      />
                    </div>
                    
                    {/* Professional Character Count */}
                    <div className="flex justify-between items-center text-xs text-text-mid bg-bg-850 rounded-lg p-3">
                      <span>Minimum 100 characters recommended for comprehensive evaluation</span>
                      <span className={`font-medium ${feedbackForm.feedback.length < 100 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {feedbackForm.feedback.length} characters
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Professional Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                  <Button 
                    type="submit" 
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-base font-medium"
                    disabled={feedbackForm.rating === 0 || !feedbackForm.feedback.trim()}
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Submit Evaluation Report
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowFeedbackModal(false)
                      setSelectedInterview(null)
                    }}
                    variant="secondary"
                    className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3 text-base font-medium"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedInterview && (
        <div className="modal-overlay">
          <div className="modal-content max-w-4xl">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary to-purple-600 rounded-t-lg p-6 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <CalendarIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Reschedule Interview
                  </h2>
                  <p className="text-purple-100">
                    Update interview details for {selectedInterview.applicantName}
                  </p>
                </div>
              </div>
              
              {/* Current Interview Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-purple-100">Current Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(selectedInterview.interviewDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>{selectedInterview.interviewTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedInterview.type)}
                    <span>
                      {selectedInterview.type === 'IN_PERSON' ? 'In Person' : 
                       selectedInterview.type === 'VIDEO' ? 'Video Call' : 'Phone Call'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Section */}
            <div className="p-6">
              <form onSubmit={handleRescheduleInterview} className="space-y-6">
                {/* Date & Time Section */}
                <div className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-high">Schedule Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <CalendarIcon className="w-4 h-4" />
                        New Interview Date
                      </label>
                      <Input
                        type="date"
                        value={rescheduleForm.interviewDate}
                        onChange={(e) => setRescheduleForm(prev => ({ ...prev, interviewDate: e.target.value }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <ClockIcon className="w-4 h-4" />
                        New Interview Time
                      </label>
                      <Input
                        type="time"
                        value={rescheduleForm.interviewTime}
                        onChange={(e) => setRescheduleForm(prev => ({ ...prev, interviewTime: e.target.value }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <ClockIcon className="w-4 h-4" />
                        Duration (minutes)
                      </label>
                      <Input
                        type="number"
                        value={rescheduleForm.duration}
                        onChange={(e) => setRescheduleForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        min="15"
                        max="240"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Interview Type & Interviewer Section */}
                <div className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <VideoCameraIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-high">Interview Setup</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        {getTypeIcon(rescheduleForm.type)}
                        Interview Type
                      </label>
                      <select
                        value={rescheduleForm.type}
                        onChange={(e) => setRescheduleForm(prev => ({ ...prev, type: e.target.value as 'PHONE' | 'VIDEO' | 'IN_PERSON' }))}
                        className="w-full p-3 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      >
                        <option value="VIDEO">📹 Video Call</option>
                        <option value="PHONE">📞 Phone Call</option>
                        <option value="IN_PERSON">🏢 In Person</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <UserIcon className="w-4 h-4" />
                        Interviewer
                      </label>
                      <Input
                        value={rescheduleForm.interviewer}
                        onChange={(e) => setRescheduleForm(prev => ({ ...prev, interviewer: e.target.value }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        placeholder="Enter interviewer name"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Conditional Fields */}
                  {rescheduleForm.type === 'IN_PERSON' && (
                    <div className="mt-4 space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <MapPinIcon className="w-4 h-4" />
                        Meeting Location
                      </label>
                      <Input
                        value={rescheduleForm.location}
                        onChange={(e) => setRescheduleForm(prev => ({ ...prev, location: e.target.value }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g., Conference Room A, Office Building"
                        required
                      />
                    </div>
                  )}
                  
                  {rescheduleForm.type === 'VIDEO' && (
                    <div className="mt-4 space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-text-mid">
                        <VideoCameraIcon className="w-4 h-4" />
                        Meeting Link
                      </label>
                      <Input
                        value={rescheduleForm.meetingLink}
                        onChange={(e) => setRescheduleForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                        className="focus:ring-2 focus:ring-primary/20"
                        placeholder="https://meet.google.com/abc-defg-hij"
                      />
                    </div>
                  )}
                </div>
                
                {/* Notes Section */}
                <div className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-high">Additional Notes</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-mid">
                      Reschedule Reason & Notes
                    </label>
                    <textarea
                      value={rescheduleForm.notes}
                      onChange={(e) => setRescheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full p-4 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-colors"
                      rows={4}
                      placeholder="Please provide the reason for rescheduling and any additional notes for the candidate..."
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                  <Button 
                    type="submit" 
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-lg"
                  >
                    <CalendarIcon className="w-5 h-5" />
                    Reschedule Interview
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowRescheduleModal(false)
                      setSelectedInterview(null)
                    }}
                    variant="secondary"
                    className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3 text-lg"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
