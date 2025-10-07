'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import CountryCodeSelector from '@/components/ui/CountryCodeSelector'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { FileAccess } from '@/components/ui/FileAccess'
import { 
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  DocumentIcon,
  TrashIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/utils'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  countryCode?: string
  location?: string
  currentPosition?: string
  company?: string
  experience?: string
  education?: string
  skills?: string[]
  bio?: string
  resumeUrl?: string
  resumeFile?: File
  resumeFileName?: string
  linkedinUrl?: string
  portfolioUrl?: string
}

interface ApplicationInfo {
  id: string
  status: string
  jobTitle: string
  department: string
  expectedSalary?: string
  submittedAt: string
  history?: Array<{
    id: string
    fromStatus?: string
    toStatus: string
    performedByName: string
    performedByRole: string
    createdAt: string
    notes?: string
  }>
  interviewDetails?: {
    scheduledDate?: string
    scheduledTime?: string
    location?: string
    meetingLink?: string
    interviewer?: string
  }
  evaluationReport?: {
    overallRating?: number
    technicalSkills?: number
    communicationSkills?: number
    culturalFit?: number
    recommendation?: string
    feedback?: string
    interviewer?: string
    completedAt?: string
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [applications, setApplications] = useState<ApplicationInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [uploadingResume, setUploadingResume] = useState(false)

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

    // Fetch user profile and applications from API
    const fetchProfile = async () => {
      try {
        const [profileResponse, applicationsResponse] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/applications')
        ])

        if (profileResponse.ok) {
          const data = await profileResponse.json()
          const user = data.user
          const profileData = {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phoneNumber || '',
            countryCode: user.countryCode || '+1',
            location: user.address || 'Bangalore, India',
            currentPosition: 'Software Engineer',
            company: 'Tech Corp',
            experience: '3 years',
            education: 'B.Tech Computer Science',
            skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
            bio: 'Passionate software engineer with experience in full-stack development.',
            resumeUrl: user.profileImage || '/resumes/default-resume.pdf',
            resumeFileName: 'resume.pdf',
            linkedinUrl: user.linkedinProfile || '',
            portfolioUrl: user.linkedinProfile || ''
          }
          setProfile(profileData)
          setFormData(profileData)
        } else {
          toast.error('Failed to fetch profile')
        }

        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json()
          setApplications(applicationsData.applications || [])
        } else {
          console.error('Failed to fetch applications')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, status, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill)
    setFormData(prev => ({
      ...prev,
      skills
    }))
  }

  const handleFileUpload = async (file: File) => {
    setUploadingResume(true)
    try {
      // Mock file upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setFormData(prev => ({
        ...prev,
        resumeFile: file,
        resumeFileName: file.name,
        resumeUrl: URL.createObjectURL(file) // Temporary URL for preview
      }))
      
      toast.success('Resume uploaded successfully!')
    } catch {
      toast.error('Failed to upload resume. Please try again.')
    } finally {
      setUploadingResume(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // File type validation removed - accept all file types
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      
      handleFileUpload(file)
    }
  }

  const removeResume = () => {
    setFormData(prev => ({
      ...prev,
      resumeFile: undefined,
      resumeFileName: undefined,
      resumeUrl: undefined
    }))
    toast.success('Resume removed')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.name?.split(' ')[0] || '',
          lastName: formData.name?.split(' ').slice(1).join(' ') || '',
          phoneNumber: formData.phone || '',
          address: formData.location || '',
          linkedinProfile: formData.linkedinUrl || formData.portfolioUrl || ''
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(prev => prev ? { ...prev, ...formData } : null)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(profile || {})
    setIsEditing(false)
  }

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: string }> = {
      'PENDING': { label: 'Application Submitted', color: 'bg-yellow-100 text-yellow-800', icon: 'ClockIcon' },
      'UNDER_REVIEW': { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: 'EyeIcon' },
      'INTERVIEW_SCHEDULED': { label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-800', icon: 'CalendarIcon' },
      'INTERVIEW_COMPLETED': { label: 'Interview Completed', color: 'bg-indigo-100 text-indigo-800', icon: 'CheckCircleIcon' },
      'ACCEPTED': { label: 'Offer Extended', color: 'bg-green-100 text-green-800', icon: 'CheckCircleIcon' },
      'REJECTED': { label: 'Application Not Successful', color: 'bg-red-100 text-red-800', icon: 'XCircleIcon' },
      'HIRED': { label: 'Hired - Welcome to the Team!', color: 'bg-emerald-100 text-emerald-800', icon: 'CheckCircleIcon' }
    }
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: 'DocumentIcon' }
  }

  const getStatusIcon = (iconName: string) => {
    switch (iconName) {
      case 'ClockIcon': return <ClockIcon className="w-4 h-4" />
      case 'EyeIcon': return <EyeIcon className="w-4 h-4" />
      case 'CalendarIcon': return <CalendarIcon className="w-4 h-4" />
      case 'CheckCircleIcon': return <CheckCircleIcon className="w-4 h-4" />
      case 'XCircleIcon': return <XCircleIcon className="w-4 h-4" />
      default: return <DocumentIcon className="w-4 h-4" />
    }
  }

  const getLatestHistoryForStatus = (app: ApplicationInfo, status: string) => {
    if (!app.history || app.history.length === 0) return null
    const matches = app.history.filter(h => h.toStatus === status)
    if (matches.length === 0) return null
    // History is assumed chronological; take the last
    return matches[matches.length - 1]
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-850">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-850">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
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
                My Profile
              </h1>
              <p className="text-text-mid">
                Manage your personal information and professional details
              </p>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    className="btn-secondary"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Application Progress Section */}
            {applications.length > 0 && (
              <div className="lg:col-span-3 mb-6">
                <div className="card">
                  <h3 className="text-xl font-semibold text-text-high mb-4 flex items-center gap-2">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-primary" />
                    Application Progress
                  </h3>
                  
                  <div className="space-y-4">
                    {applications.map((application) => {
                      const statusDisplay = getStatusDisplay(application.status)
                      return (
                        <div key={application.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="text-lg font-semibold text-text-high">{application.jobTitle}</h4>
                              <p className="text-text-mid">{application.department}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(statusDisplay.icon)}
                                {statusDisplay.label}
                              </span>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-text-mid">Expected Salary</p>
                              <p className="font-medium text-text-high">{application.expectedSalary || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-text-mid">Applied Date</p>
                              <p className="font-medium text-text-high">
                                {formatDate(application.submittedAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-text-mid">Application ID</p>
                              <p className="font-medium text-text-high font-mono text-sm">{application.id.slice(0, 8)}...</p>
                            </div>
                          </div>

                          {/* Interview Details for INTERVIEW_SCHEDULED */}
                          {application.status === 'INTERVIEW_SCHEDULED' && application.interviewDetails && (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                              <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                Interview Details
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-blue-700 font-medium">Date:</span>
                                  <span className="text-blue-800 ml-2">
                                    {application.interviewDetails.scheduledDate ? 
                                      formatDate(application.interviewDetails.scheduledDate) : 
                                      'TBD'
                                    }
                                  </span>
                                </div>
                                <div>
                                  <span className="text-blue-700 font-medium">Time:</span>
                                  <span className="text-blue-800 ml-2">
                                    {application.interviewDetails.scheduledTime || 'TBD'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-blue-700 font-medium">Location:</span>
                                  <span className="text-blue-800 ml-2">
                                    {application.interviewDetails.location || 'TBD'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-blue-700 font-medium">Interviewer:</span>
                                  <span className="text-blue-800 ml-2">
                                    {application.interviewDetails.interviewer || 'TBD'}
                                  </span>
                                </div>
                              </div>
                              {application.interviewDetails.meetingLink && (
                                <div className="mt-2">
                                  <a 
                                    href={application.interviewDetails.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  >
                                    Join Meeting Link
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Interview Evaluation Report for INTERVIEW_COMPLETED and beyond (including REJECTED) */}
                          {(application.status === 'INTERVIEW_COMPLETED' || 
                            application.status === 'ACCEPTED' || 
                            application.status === 'HIRED' ||
                            application.status === 'REJECTED') && 
                            application.evaluationReport && (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                              <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                <ClipboardDocumentListIcon className="w-4 h-4" />
                                Interview Evaluation Report
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                                <div>
                                  <span className="text-green-700 font-medium">Overall Rating:</span>
                                  <span className="text-green-800 ml-2">
                                    {application.evaluationReport.overallRating ? 
                                      `${application.evaluationReport.overallRating}/5` : 
                                      'Not rated'
                                    }
                                  </span>
                                </div>
                                <div>
                                  <span className="text-green-700 font-medium">Recommendation:</span>
                                  <span className="text-green-800 ml-2">
                                    {application.evaluationReport.recommendation || 'Pending'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-green-700 font-medium">Interviewer:</span>
                                  <span className="text-green-800 ml-2">
                                    {application.evaluationReport.interviewer || 'Unknown'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-green-700 font-medium">Completed:</span>
                                  <span className="text-green-800 ml-2">
                                    {application.evaluationReport.completedAt ? 
                                      formatDate(application.evaluationReport.completedAt) : 
                                      'Unknown'
                                    }
                                  </span>
                                </div>
                              </div>
                              {application.evaluationReport.feedback && (
                                <div>
                                  <span className="text-green-700 font-medium">Feedback:</span>
                                  <p className="text-green-800 mt-1">{application.evaluationReport.feedback}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Accepted by (Admin/HR) details on ACCEPTED */}
                          {application.status === 'ACCEPTED' && (() => {
                            const acceptedHistory = getLatestHistoryForStatus(application, 'ACCEPTED')
                            if (!acceptedHistory) return null
                            return (
                              <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
                                <p className="text-green-800 text-sm">
                                  <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                                  Accepted by {acceptedHistory.performedByName} ({acceptedHistory.performedByRole}) on {formatDate(acceptedHistory.createdAt)}
                                </p>
                              </div>
                            )
                          })()}

                          {/* Status-specific messages */}
                          {application.status === 'PENDING' && (
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                              <p className="text-yellow-800 text-sm">
                                <ClockIcon className="w-4 h-4 inline mr-1" />
                                Your application has been submitted and is awaiting review by our HR team.
                              </p>
                            </div>
                          )}

                          {application.status === 'UNDER_REVIEW' && (
                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                              <p className="text-blue-800 text-sm">
                                <EyeIcon className="w-4 h-4 inline mr-1" />
                                Your application is being reviewed by our HR team. We&apos;ll contact you soon with next steps.
                              </p>
                            </div>
                          )}

                          {application.status === 'INTERVIEW_COMPLETED' && (
                            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg">
                              <p className="text-indigo-800 text-sm">
                                <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                                Your interview has been completed. We&apos;re reviewing the evaluation and will notify you of the final decision.
                              </p>
                            </div>
                          )}

                          {application.status === 'ACCEPTED' && (
                            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                              <p className="text-green-800 text-sm">
                                <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                                Congratulations! Your application has been accepted. You&apos;ll receive an offer letter soon.
                              </p>
                            </div>
                          )}

                          {application.status === 'REJECTED' && (() => {
                            const rejectedHistory = getLatestHistoryForStatus(application, 'REJECTED')
                            return (
                              <>
                                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                                  <p className="text-red-800 text-sm">
                                    <XCircleIcon className="w-4 h-4 inline mr-1" />
                                    Unfortunately, your application was not successful this time.
                                  </p>
                                </div>
                                {/* Rejection reason under Application Information */}
                                {rejectedHistory?.notes && (
                                  <div className="mt-3 border border-red-200 bg-red-50 p-3 rounded-lg">
                                    <p className="text-red-800 text-sm font-medium">Rejection Reason</p>
                                    <p className="text-red-700 text-sm mt-1">{rejectedHistory.notes}</p>
                                  </div>
                                )}
                              </>
                            )
                          })()}

                          {application.status === 'HIRED' && (
                            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                              <p className="text-emerald-800 text-sm">
                                <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                                Welcome to the team! You&apos;ve been successfully hired. Check your email for onboarding details.
                              </p>
                            </div>
                          )}

                          {/* Recent Activity */}
                          {application.history && application.history.length > 0 && (
                            <div className="mt-4">
                              <h6 className="text-sm font-medium text-text-mid mb-2">Recent Activity</h6>
                              <div className="bg-bg-800 p-3 rounded border border-border">
                                <div className="space-y-2">
                                  {application.history.slice(0, 3).map((historyItem) => (
                                    <div key={historyItem.id} className="flex items-center gap-2 text-sm">
                                      <span className="text-text-mid">
                                        {formatDate(historyItem.createdAt)}
                                      </span>
                                      <span className="text-text-high">
                                        {historyItem.performedByName} ({historyItem.performedByRole}) moved application from {historyItem.fromStatus || 'N/A'} to {historyItem.toStatus}
                                      </span>
                                      {historyItem.notes && (
                                        <span className="text-text-mid">- {historyItem.notes}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <div className="card">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-text-high mb-2">
                    {isEditing ? (
                      <Input
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="text-center"
                      />
                    ) : (
                      profile.name
                    )}
                  </h2>
                  <p className="text-text-mid">
                    {isEditing ? (
                      <Input
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="text-center"
                      />
                    ) : (
                      profile.email
                    )}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 text-primary" />
                    <span className="text-text-mid">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <CountryCodeSelector
                            value={formData.countryCode || '+1'}
                            onChange={(value) => handleInputChange('countryCode', value)}
                            className="w-32"
                          />
                          <Input
                            value={formData.phone || ''}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="1234567890"
                            className="w-40"
                          />
                        </div>
                      ) : (
                        profile.countryCode && profile.phone ? `${profile.countryCode} ${profile.phone}` : 'Not provided'
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-5 h-5 text-primary" />
                    <span className="text-text-mid">
                      {isEditing ? (
                        <Input
                          value={formData.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Location"
                        />
                      ) : (
                        profile.location || 'Not provided'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Professional Information */}
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-4 flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5 text-primary" />
                  Professional Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-mid mb-2">
                      Current Position
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.currentPosition || ''}
                        onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                        placeholder="Your current job title"
                      />
                    ) : (
                      <p className="text-text-high">{profile.currentPosition || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-mid mb-2">
                      Company
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.company || ''}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Your current company"
                      />
                    ) : (
                      <p className="text-text-high">{profile.company || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-mid mb-2">
                      Experience
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.experience || ''}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="Years of experience"
                      />
                    ) : (
                      <p className="text-text-high">{profile.experience || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-mid mb-2">
                      Education
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.education || ''}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        placeholder="Your education background"
                      />
                    ) : (
                      <p className="text-text-high">{profile.education || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-4 flex items-center gap-2">
                  <AcademicCapIcon className="w-5 h-5 text-primary" />
                  Skills
                </h3>
                
                {isEditing ? (
                  <Input
                    value={formData.skills?.join(', ') || ''}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                    placeholder="Enter skills separated by commas"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-bg-800 text-text-mid text-sm rounded-md border border-border"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-4">
                  About Me
                </h3>
                
                {isEditing ? (
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full p-3 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    rows={4}
                  />
                ) : (
                  <p className="text-text-high leading-relaxed">
                    {profile.bio || 'No bio provided'}
                  </p>
                )}
              </div>

              {/* Links */}
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-4">
                  Links & Documents
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-mid mb-2">
                      LinkedIn Profile
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.linkedinUrl || ''}
                        onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    ) : (
                      <p className="text-text-high">
                        {profile.linkedinUrl ? (
                          <a 
                            href={profile.linkedinUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-hover"
                          >
                            {profile.linkedinUrl}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-mid mb-2">
                      Portfolio Website
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.portfolioUrl || ''}
                        onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                        placeholder="https://yourportfolio.com"
                      />
                    ) : (
                      <p className="text-text-high">
                        {profile.portfolioUrl ? (
                          <a 
                            href={profile.portfolioUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-hover"
                          >
                            {profile.portfolioUrl}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-mid mb-2">
                      Resume
                    </label>
                    {isEditing ? (
                      <div className="space-y-3">
                        {/* File Upload Area */}
                        <div className="relative">
                          <input
                            type="file"
                            id="resume-upload"
                            accept="*/*"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={uploadingResume}
                          />
                          <label
                            htmlFor="resume-upload"
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                              uploadingResume
                                ? 'border-primary/50 bg-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-bg-800'
                            }`}
                          >
                            {uploadingResume ? (
                              <div className="flex flex-col items-center">
                                <LoadingSpinner size="sm" />
                                <span className="text-sm text-text-mid mt-2">Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <DocumentArrowUpIcon className="w-8 h-8 text-primary mb-2" />
                                <span className="text-sm text-text-mid">
                                  Click to upload resume
                                </span>
                                <span className="text-xs text-text-mid">
                                  PDF, DOC, DOCX (Max 5MB)
                                </span>
                              </div>
                            )}
                          </label>
                        </div>

                        {/* Current Resume Display */}
                        {(formData.resumeFileName || formData.resumeUrl) && (
                          <div className="flex items-center justify-between p-3 bg-bg-800 rounded-lg border border-border">
                            <div className="flex items-center gap-3">
                              <DocumentIcon className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm font-medium text-text-high">
                                  {formData.resumeFileName || 'Current Resume'}
                                </p>
                                {formData.resumeUrl && (
                                  <a
                                    href={formData.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:text-primary-hover"
                                  >
                                    View current resume
                                  </a>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={removeResume}
                              variant="secondary"
                              className="btn-secondary p-2"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {profile.resumeUrl ? (
                          <FileAccess
                            fileId="profile-resume"
                            fileName={profile.resumeFileName || 'Resume.pdf'}
                            fileType="application/pdf"
                            showDownload={true}
                            showPreview={true}
                          />
                        ) : (
                          <p className="text-text-mid text-sm">No resume uploaded</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
