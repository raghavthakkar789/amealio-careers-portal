'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { 
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  LinkIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { formatDate, formatDateTime } from '@/lib/utils'

interface ApplicantDetails {
  personalInfo: {
    id: string
    firstName: string
    lastName: string
    fullName: string
    email: string
    phoneNumber: string | null
    countryCode: string | null
    address: string | null
    dateOfBirth: string | null
    linkedinProfile: string | null
    profileImage: string | null
    accountCreated: string
    lastUpdated: string
  }
  applicationInfo: {
    id: string
    jobTitle: string
    employmentType: string
    resumeUrl: string
    additionalFiles: string[]
    coverLetter: string | null
    expectedSalary: string | null
    experience: string | null
    education: string | null
    skills: string | null
    availability: string | null
    references: string | null
    status: string
    submittedAt: string
    updatedAt: string
  }
  jobInfo: {
    id: string
    title: string
    department: string
  }
  hrRecommendations?: Array<{
    id: string
    hrName: string
    hrEmail: string
    recommendation: 'HIRE' | 'REJECT' | 'PENDING'
    notes: string
    rating: number
    strengths: string[]
    concerns: string[]
    createdAt: string
  }>
  interviewReviews?: Array<{
    id: string
    interviewerName: string
    interviewerRole: string
    interviewType: string
    overallRating: number
    technicalRating: number
    communicationRating: number
    culturalFitRating: number
    notes: string
    strengths: string[]
    areasForImprovement: string[]
    recommendation: 'HIRE' | 'REJECT' | 'MAYBE' | 'PENDING'
    interviewDate: string
    duration: number
  }>
}

interface ApplicantProfileModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string
}

export default function ApplicantProfileModal({ 
  isOpen, 
  onClose, 
  applicationId 
}: ApplicantProfileModalProps) {
  const [applicantDetails, setApplicantDetails] = useState<ApplicantDetails | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log('ApplicantProfileModal useEffect triggered:', { isOpen, applicationId })
    if (isOpen && applicationId) {
      console.log('Conditions met, fetching applicant details...')
      fetchApplicantDetails()
    } else {
      console.log('Conditions not met:', { isOpen, applicationId })
    }
  }, [isOpen, applicationId])

  const fetchApplicantDetails = async () => {
    setLoading(true)
    try {
      console.log('Fetching applicant details for applicationId:', applicationId)
      const response = await fetch(`/api/applications/${applicationId}/applicant`)
      console.log('API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API response data:', data)
        if (data.applicantDetails) {
          setApplicantDetails(data.applicantDetails)
          toast.success('Applicant details loaded successfully')
        } else {
          console.error('No applicantDetails in response:', data)
          toast.error('Invalid response format from server')
        }
      } else {
        let errorMessage = 'Failed to fetch applicant details'
        try {
          const error = await response.json()
          console.error('API error response:', error)
          errorMessage = error.error || errorMessage
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorMessage = `Server error (${response.status}): ${response.statusText}`
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error fetching applicant details:', error)
      toast.error('Failed to fetch applicant details')
    } finally {
      setLoading(false)
    }
  }

  // Using utility functions from @/lib/utils for consistent formatting

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Helper functions to determine what sections to show based on application status
  const shouldShowInterviewDetails = () => {
    const status = applicantDetails?.applicationInfo.status
    return status === 'INTERVIEW_SCHEDULED' || 
           status === 'INTERVIEW_COMPLETED' || 
           status === 'ACCEPTED' || 
           status === 'HIRED' || 
           status === 'REJECTED'
  }

  const shouldShowEvaluationReport = () => {
    const status = applicantDetails?.applicationInfo.status
    return status === 'ACCEPTED' || 
           status === 'HIRED' || 
           status === 'REJECTED'
  }

  const shouldShowAdminDecision = () => {
    const status = applicantDetails?.applicationInfo.status
    return status === 'HIRED' || status === 'REJECTED'
  }

  const isRejected = () => {
    return applicantDetails?.applicationInfo.status === 'REJECTED'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-blue-100 text-blue-800'
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'INTERVIEW_SCHEDULED': return 'bg-purple-100 text-purple-800'
      case 'INTERVIEW_COMPLETED': return 'bg-indigo-100 text-indigo-800'
      case 'ACCEPTED': return 'bg-green-100 text-green-800'
      case 'HIRED': return 'bg-emerald-100 text-emerald-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-bg-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-high">Applicant Profile</h2>
                <p className="text-text-mid">Complete applicant information and application details</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="secondary"
              className="btn-secondary"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : applicantDetails ? (
              <div className="p-6 space-y-8">
                {/* Personal Information */}
                <div className="card">
                  <div className="flex items-center gap-2 mb-6">
                    <UserIcon className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold text-text-high">Personal Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-mid mb-1">Full Name</label>
                        <p className="text-text-high font-medium">{applicantDetails.personalInfo.fullName}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-text-mid mb-1">Email Address</label>
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="w-4 h-4 text-text-mid" />
                          <p className="text-text-high">{applicantDetails.personalInfo.email}</p>
                        </div>
                      </div>
                      
                      {applicantDetails.personalInfo.phoneNumber && (
                        <div>
                          <label className="block text-sm font-medium text-text-mid mb-1">Phone Number</label>
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="w-4 h-4 text-text-mid" />
                            <p className="text-text-high">
                              {applicantDetails.personalInfo.countryCode && applicantDetails.personalInfo.phoneNumber 
                                ? `${applicantDetails.personalInfo.countryCode} ${applicantDetails.personalInfo.phoneNumber}`
                                : applicantDetails.personalInfo.phoneNumber
                              }
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {applicantDetails.personalInfo.address && (
                        <div>
                          <label className="block text-sm font-medium text-text-mid mb-1">Address</label>
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 text-text-mid" />
                            <p className="text-text-high">{applicantDetails.personalInfo.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {applicantDetails.personalInfo.dateOfBirth && (
                        <div>
                          <label className="block text-sm font-medium text-text-mid mb-1">Date of Birth</label>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-text-mid" />
                            <p className="text-text-high">{formatDate(applicantDetails.personalInfo.dateOfBirth)}</p>
                          </div>
                        </div>
                      )}
                      
                      {applicantDetails.personalInfo.linkedinProfile && (
                        <div>
                          <label className="block text-sm font-medium text-text-mid mb-1">LinkedIn Profile</label>
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-text-mid" />
                            <a 
                              href={applicantDetails.personalInfo.linkedinProfile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-hover"
                            >
                              View Profile
                            </a>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-text-mid mb-1">Account Created</label>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-text-mid" />
                          <p className="text-text-high">{formatDateTime(applicantDetails.personalInfo.accountCreated)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Information */}
                <div className="card">
                  <div className="flex items-center gap-2 mb-6">
                    <BriefcaseIcon className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold text-text-high">Application Information</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Job Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-text-mid mb-1">Position Applied For</label>
                        <p className="text-text-high font-medium">{applicantDetails.applicationInfo.jobTitle}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-text-mid mb-1">Department</label>
                        <p className="text-text-high">{applicantDetails.jobInfo.department}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-text-mid mb-1">Employment Type</label>
                        <p className="text-text-high">{applicantDetails.applicationInfo.employmentType.replace('_', ' ')}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-text-mid mb-1">Application Status</label>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          applicantDetails.applicationInfo.status === 'HIRED' ? 'bg-green-100 text-green-800' :
                          applicantDetails.applicationInfo.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          applicantDetails.applicationInfo.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {applicantDetails.applicationInfo.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Expected Salary */}
                    {applicantDetails.applicationInfo.expectedSalary && (
                      <div>
                        <label className="block text-sm font-medium text-text-mid mb-1">Expected Salary</label>
                        <div className="flex items-center gap-2">
                          <CurrencyDollarIcon className="w-4 h-4 text-text-mid" />
                          <p className="text-text-high">{applicantDetails.applicationInfo.expectedSalary}</p>
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {applicantDetails.applicationInfo.experience && (
                      <div>
                        <label className="block text-sm font-medium text-text-mid mb-1">Experience</label>
                        <p className="text-text-high whitespace-pre-wrap">{applicantDetails.applicationInfo.experience}</p>
                      </div>
                    )}

                    {/* Education */}
                    {applicantDetails.applicationInfo.education && (
                      <div>
                        <label className="block text-sm font-medium text-text-mid mb-1">Education</label>
                        <div className="flex items-start gap-2">
                          <AcademicCapIcon className="w-4 h-4 text-text-mid mt-1" />
                          <p className="text-text-high whitespace-pre-wrap">{applicantDetails.applicationInfo.education}</p>
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {applicantDetails.applicationInfo.skills && (
                      <div>
                        <label className="block text-sm font-medium text-text-mid mb-1">Skills</label>
                        <div className="flex items-start gap-2">
                          <StarIcon className="w-4 h-4 text-text-mid mt-1" />
                          <p className="text-text-high whitespace-pre-wrap">{applicantDetails.applicationInfo.skills}</p>
                        </div>
                      </div>
                    )}

                    {/* Availability */}
                    {applicantDetails.applicationInfo.availability && (
                      <div>
                        <label className="block text-sm font-medium text-text-mid mb-1">Availability</label>
                        <div className="flex items-start gap-2">
                          <ClockIcon className="w-4 h-4 text-text-mid mt-1" />
                          <p className="text-text-high whitespace-pre-wrap">{applicantDetails.applicationInfo.availability}</p>
                        </div>
                      </div>
                    )}

                    {/* Cover Letter */}
                    {applicantDetails.applicationInfo.coverLetter && (
                      <div>
                        <label className="block text-sm font-medium text-text-mid mb-1">Cover Letter</label>
                        <div className="bg-bg-850 p-4 rounded-lg border border-border">
                          <p className="text-text-high whitespace-pre-wrap">{applicantDetails.applicationInfo.coverLetter}</p>
                        </div>
                      </div>
                    )}

                    {/* References */}
                    {applicantDetails.applicationInfo.references && (
                      <div>
                        <label className="block text-sm font-medium text-text-mid mb-1">References</label>
                        <div className="bg-bg-850 p-4 rounded-lg border border-border">
                          <p className="text-text-high whitespace-pre-wrap">{applicantDetails.applicationInfo.references}</p>
                        </div>
                      </div>
                    )}

                    {/* Files */}
                    <div>
                      <label className="block text-sm font-medium text-text-mid mb-3">Documents</label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-bg-850 rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                            <DocumentTextIcon className="w-5 h-5 text-primary" />
                            <span className="text-text-high">Resume</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => window.open(applicantDetails.applicationInfo.resumeUrl, '_blank')}
                              variant="secondary"
                              className="btn-secondary text-xs px-2 py-1"
                            >
                              <EyeIcon className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              onClick={() => downloadFile(applicantDetails.applicationInfo.resumeUrl, 'resume.pdf')}
                              variant="secondary"
                              className="btn-secondary text-xs px-2 py-1"
                            >
                              <ArrowDownTrayIcon className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                        
                        {applicantDetails.applicationInfo.additionalFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-bg-850 rounded-lg border border-border">
                            <div className="flex items-center gap-3">
                              <DocumentTextIcon className="w-5 h-5 text-primary" />
                              <span className="text-text-high">Additional File {index + 1}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => window.open(file, '_blank')}
                                variant="secondary"
                                className="btn-secondary text-xs px-2 py-1"
                              >
                                <EyeIcon className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button
                                onClick={() => downloadFile(file, `additional-file-${index + 1}.pdf`)}
                                variant="secondary"
                                className="btn-secondary text-xs px-2 py-1"
                              >
                                <ArrowDownTrayIcon className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Application Timeline */}
                    <div>
                      <label className="block text-sm font-medium text-text-mid mb-1">Application Timeline</label>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-mid">Submitted:</span>
                          <span className="text-text-high">{formatDateTime(applicantDetails.applicationInfo.submittedAt)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-mid">Last Updated:</span>
                          <span className="text-text-high">{formatDateTime(applicantDetails.applicationInfo.updatedAt)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-mid">Current Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(applicantDetails.applicationInfo.status)}`}>
                            {applicantDetails.applicationInfo.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interview Details Section - Visible from INTERVIEW_SCHEDULED onwards */}
                {shouldShowInterviewDetails() && applicantDetails.interviewReviews && applicantDetails.interviewReviews.length > 0 && (
                  <div className="card">
                    <div className="flex items-center gap-2 mb-6">
                      <CalendarIcon className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-semibold text-text-high">Interview Details</h3>
                    </div>
                    
                    <div className="space-y-6">
                      {applicantDetails.interviewReviews.map((interview, index) => (
                        <div key={interview.id} className="bg-bg-850 p-4 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-text-high">Interview #{index + 1}</h4>
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              {interview.interviewType.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-text-mid mb-1">Interview Date</label>
                              <p className="text-text-high">{formatDateTime(interview.interviewDate)}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text-mid mb-1">Interviewer</label>
                              <p className="text-text-high">{interview.interviewerName}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text-mid mb-1">Duration</label>
                              <p className="text-text-high">{interview.duration} minutes</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text-mid mb-1">Status</label>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                interview.recommendation === 'HIRE' ? 'bg-green-100 text-green-800' :
                                interview.recommendation === 'REJECT' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {interview.recommendation}
                              </span>
                            </div>
                          </div>
                          
                          {interview.notes && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-text-mid mb-1">Interview Notes</label>
                              <div className="bg-bg-800 p-3 rounded border border-border">
                                <p className="text-text-high text-sm">{interview.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interview Evaluation Report Section - Visible from ACCEPTED onwards */}
                {shouldShowEvaluationReport() && applicantDetails.interviewReviews && applicantDetails.interviewReviews.length > 0 && (
                  <div className="card">
                    <div className="flex items-center gap-2 mb-6">
                      <ClipboardDocumentListIcon className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-semibold text-text-high">Interview Evaluation Report</h3>
                    </div>
                    
                    <div className="space-y-6">
                      {applicantDetails.interviewReviews.map((interview, index) => (
                        <div key={interview.id} className="bg-bg-850 p-4 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-text-high">Evaluation #{index + 1}</h4>
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              By {interview.interviewerName}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-text-mid mb-1">Overall Rating</label>
                              <div className="flex items-center gap-1">
                                <span className="text-lg font-semibold text-text-high">{interview.overallRating}/5</span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon 
                                      key={star} 
                                      className={`w-4 h-4 ${star <= interview.overallRating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text-mid mb-1">Technical Skills</label>
                              <p className="text-text-high">{interview.technicalRating}/5</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text-mid mb-1">Communication</label>
                              <p className="text-text-high">{interview.communicationRating}/5</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text-mid mb-1">Cultural Fit</label>
                              <p className="text-text-high">{interview.culturalFitRating}/5</p>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-text-mid mb-1">Final Recommendation</label>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              interview.recommendation === 'HIRE' ? 'bg-green-100 text-green-800' :
                              interview.recommendation === 'REJECT' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {interview.recommendation}
                            </span>
                          </div>
                          
                          {interview.notes && (
                            <div>
                              <label className="block text-sm font-medium text-text-mid mb-1">Detailed Comments</label>
                              <div className="bg-bg-800 p-3 rounded border border-border">
                                <p className="text-text-high text-sm whitespace-pre-wrap">{interview.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Final Decision Section - Visible for HIRED/REJECTED */}
                {shouldShowAdminDecision() && (
                  <div className="card">
                    <div className="flex items-center gap-2 mb-6">
                      <CheckCircleIcon className={`w-6 h-6 ${isRejected() ? 'text-red-500' : 'text-green-500'}`} />
                      <h3 className="text-xl font-semibold text-text-high">Final Decision</h3>
                    </div>
                    
                    <div className="bg-bg-850 p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-text-high">
                          {isRejected() ? 'Application Rejected' : 'Candidate Hired'}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isRejected() ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {applicantDetails.applicationInfo.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-mid mb-1">Decision Date</label>
                          <p className="text-text-high">{formatDateTime(applicantDetails.applicationInfo.updatedAt)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-mid mb-1">Decision Made By</label>
                          <p className="text-text-high">Admin</p>
                        </div>
                      </div>
                      
                      {isRejected() && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-text-mid mb-1">Rejection Reason</label>
                          <div className="bg-bg-800 p-3 rounded border border-border">
                            <p className="text-text-high text-sm">
                              This information is kept confidential and is not shared with the candidate.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-text-mid">Failed to load applicant details</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
