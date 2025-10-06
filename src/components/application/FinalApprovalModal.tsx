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
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
   HandThumbUpIcon,
   HandThumbDownIcon
} from '@heroicons/react/24/outline'

interface HRRecommendation {
  id: string
  hrName: string
  hrEmail: string
  recommendation: 'HIRE' | 'REJECT' | 'PENDING'
  notes: string
  rating: number
  strengths: string[]
  concerns: string[]
  createdAt: string
}

interface InterviewReview {
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
  recommendation: 'HIRE' | 'REJECT' | 'MAYBE'
  interviewDate: string
  duration: number
}

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
  hrRecommendations: HRRecommendation[]
  interviewReviews: InterviewReview[]
}

interface FinalApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string
  onFinalDecision: (decision: 'HIRE' | 'REJECT', notes?: string) => void
}

export default function FinalApprovalModal({ 
  isOpen, 
  onClose, 
  applicationId,
  onFinalDecision
}: FinalApprovalModalProps) {
  const [applicantDetails, setApplicantDetails] = useState<ApplicantDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [finalNotes, setFinalNotes] = useState('')

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchApplicantDetails()
    }
  }, [isOpen, applicationId])

  const fetchApplicantDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}/applicant`)
      if (response.ok) {
        const data = await response.json()
        setApplicantDetails(data.applicantDetails)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to fetch applicant details')
      }
    } catch (error) {
      console.error('Error fetching applicant details:', error)
      toast.error('Failed to fetch applicant details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'HIRE': return 'bg-green-100 text-green-800'
      case 'REJECT': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'MAYBE': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  const handleFinalDecision = (decision: 'HIRE' | 'REJECT') => {
    onFinalDecision(decision, finalNotes)
    onClose()
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
          className="bg-bg-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-high">Final Approval Review</h2>
                <p className="text-text-mid">Complete applicant assessment with HR recommendations and interview feedback</p>
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

           {/* Tabs */}
           <div className="flex gap-2 px-6 py-4 border-b border-border overflow-x-auto">
             {[
               { id: 'overview', label: 'Overview', icon: UserIcon },
               { id: 'application', label: 'Application Details', icon: DocumentTextIcon },
               { id: 'hr-recommendations', label: 'HR Recommendations', icon: UserGroupIcon },
               { id: 'interviews', label: 'Interview Reviews', icon: ChatBubbleLeftRightIcon }
             ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-500 bg-emerald-500 bg-opacity-10'
                    : 'border-transparent text-text-mid hover:text-text-high hover:bg-bg-850'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : applicantDetails ? (
              <div className="p-6 space-y-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Quick Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="card">
                        <div className="flex items-center gap-3 mb-4">
                          <UserIcon className="w-6 h-6 text-primary" />
                          <h3 className="text-lg font-semibold text-text-high">Applicant Summary</h3>
                        </div>
                        <div className="space-y-2">
                          <p className="text-text-high font-medium">{applicantDetails.personalInfo.fullName}</p>
                          <p className="text-text-mid">{applicantDetails.personalInfo.email}</p>
                          <p className="text-text-mid">{applicantDetails.applicationInfo.jobTitle}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            applicantDetails.applicationInfo.status === 'HIRED' ? 'bg-green-100 text-green-800' :
                            applicantDetails.applicationInfo.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {applicantDetails.applicationInfo.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="card">
                        <div className="flex items-center gap-3 mb-4">
                          <UserGroupIcon className="w-6 h-6 text-primary" />
                          <h3 className="text-lg font-semibold text-text-high">HR Recommendations</h3>
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-bold text-text-high">{applicantDetails.hrRecommendations.length}</p>
                          <p className="text-text-mid">Total Reviews</p>
                          {applicantDetails.hrRecommendations.length > 0 && (
                            <div className="flex gap-1">
                              {applicantDetails.hrRecommendations.map((rec, index) => (
                                <span key={index} className={`px-2 py-1 rounded text-xs ${getRecommendationColor(rec.recommendation)}`}>
                                  {rec.recommendation}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="card">
                        <div className="flex items-center gap-3 mb-4">
                          <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary" />
                          <h3 className="text-lg font-semibold text-text-high">Interview Reviews</h3>
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-bold text-text-high">{applicantDetails.interviewReviews.length}</p>
                          <p className="text-text-mid">Interviews Completed</p>
                          {applicantDetails.interviewReviews.length > 0 && (
                            <div className="flex items-center gap-1">
                              <StarIcon className="w-4 h-4 text-yellow-400" />
                              <span className="text-text-high">
                                {(applicantDetails.interviewReviews.reduce((sum, review) => sum + review.overallRating, 0) / applicantDetails.interviewReviews.length).toFixed(1)}/5
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Application Timeline */}
                    <div className="card">
                      <h3 className="text-lg font-semibold text-text-high mb-4">Application Timeline</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-bg-850 rounded-lg">
                          <span className="text-text-mid">Application Submitted</span>
                          <span className="text-text-high">{formatDateTime(applicantDetails.applicationInfo.submittedAt)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-bg-850 rounded-lg">
                          <span className="text-text-mid">Last Updated</span>
                          <span className="text-text-high">{formatDateTime(applicantDetails.applicationInfo.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Application Details Tab */}
                {activeTab === 'application' && (
                  <div className="space-y-6">
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
                        </div>
                        
                        <div className="space-y-4">
                          {applicantDetails.personalInfo.address && (
                            <div>
                              <label className="block text-sm font-medium text-text-mid mb-1">Address</label>
                              <div className="flex items-center gap-2">
                                <MapPinIcon className="w-4 h-4 text-text-mid" />
                                <p className="text-text-high">{applicantDetails.personalInfo.address}</p>
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
                          
                          {applicantDetails.applicationInfo.expectedSalary && (
                            <div>
                              <label className="block text-sm font-medium text-text-mid mb-1">Expected Salary</label>
                              <div className="flex items-center gap-2">
                                <CurrencyDollarIcon className="w-4 h-4 text-text-mid" />
                                <p className="text-text-high">{applicantDetails.applicationInfo.expectedSalary}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Experience, Education, Skills */}
                        {applicantDetails.applicationInfo.experience && (
                          <div>
                            <label className="block text-sm font-medium text-text-mid mb-1">Experience</label>
                            <p className="text-text-high whitespace-pre-wrap">{applicantDetails.applicationInfo.experience}</p>
                          </div>
                        )}

                        {applicantDetails.applicationInfo.education && (
                          <div>
                            <label className="block text-sm font-medium text-text-mid mb-1">Education</label>
                            <div className="flex items-start gap-2">
                              <AcademicCapIcon className="w-4 h-4 text-text-mid mt-1" />
                              <p className="text-text-high whitespace-pre-wrap">{applicantDetails.applicationInfo.education}</p>
                            </div>
                          </div>
                        )}

                        {applicantDetails.applicationInfo.skills && (
                          <div>
                            <label className="block text-sm font-medium text-text-mid mb-1">Skills</label>
                            <div className="flex items-start gap-2">
                              <StarIcon className="w-4 h-4 text-text-mid mt-1" />
                              <p className="text-text-high whitespace-pre-wrap">{applicantDetails.applicationInfo.skills}</p>
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

                        {/* Documents */}
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
                                  onClick={() => {
                                    const link = document.createElement('a')
                                    link.href = applicantDetails.applicationInfo.resumeUrl
                                    link.download = 'resume.pdf'
                                    link.target = '_blank'
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                  }}
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
                                    onClick={() => {
                                      const link = document.createElement('a')
                                      link.href = file
                                      link.download = `additional-file-${index + 1}.pdf`
                                      link.target = '_blank'
                                      document.body.appendChild(link)
                                      link.click()
                                      document.body.removeChild(link)
                                    }}
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
                      </div>
                    </div>
                  </div>
                )}

                {/* HR Recommendations Tab */}
                {activeTab === 'hr-recommendations' && (
                  <div className="space-y-6">
                    {applicantDetails.hrRecommendations.length === 0 ? (
                      <div className="text-center py-12">
                        <UserGroupIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                        <p className="text-text-mid">No HR recommendations available</p>
                      </div>
                    ) : (
                      applicantDetails.hrRecommendations.map((recommendation, index) => (
                        <div key={recommendation.id} className="card">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <UserGroupIcon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-text-high">{recommendation.hrName}</h3>
                                <p className="text-sm text-text-mid">{recommendation.hrEmail}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(recommendation.recommendation)}`}>
                                {recommendation.recommendation}
                              </span>
                              <div className="flex items-center gap-1">
                                {getRatingStars(recommendation.rating)}
                                <span className="text-sm text-text-mid ml-1">({recommendation.rating}/5)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-text-mid mb-1">Recommendation Notes</label>
                              <div className="bg-bg-850 p-4 rounded-lg border border-border">
                                <p className="text-text-high whitespace-pre-wrap">{recommendation.notes}</p>
                              </div>
                            </div>
                            
                            {recommendation.strengths.length > 0 && (
                              <div>
                                <label className="block text-sm font-medium text-text-mid mb-2">Strengths</label>
                                <div className="flex flex-wrap gap-2">
                                  {recommendation.strengths.map((strength, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                      {strength}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {recommendation.concerns.length > 0 && (
                              <div>
                                <label className="block text-sm font-medium text-text-mid mb-2">Areas of Concern</label>
                                <div className="flex flex-wrap gap-2">
                                  {recommendation.concerns.map((concern, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                      {concern}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="text-sm text-text-mid">
                              Reviewed on {formatDateTime(recommendation.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Interview Reviews Tab */}
                {activeTab === 'interviews' && (
                  <div className="space-y-6">
                    {applicantDetails.interviewReviews.length === 0 ? (
                      <div className="text-center py-12">
                        <ChatBubbleLeftRightIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                        <p className="text-text-mid">No interview reviews available</p>
                      </div>
                    ) : (
                      applicantDetails.interviewReviews.map((review, index) => (
                        <div key={review.id} className="card">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-text-high">{review.interviewerName}</h3>
                                <p className="text-sm text-text-mid">{review.interviewerRole} • {review.interviewType}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(review.recommendation)}`}>
                                {review.recommendation}
                              </span>
                              <div className="flex items-center gap-1">
                                {getRatingStars(review.overallRating)}
                                <span className="text-sm text-text-mid ml-1">({review.overallRating}/5)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            {/* Rating Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-bg-850 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <StarIcon className="w-4 h-4 text-yellow-400" />
                                  <span className="text-sm font-medium text-text-high">Technical</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {getRatingStars(review.technicalRating)}
                                  <span className="text-sm text-text-mid ml-1">({review.technicalRating}/5)</span>
                                </div>
                              </div>
                              
                              <div className="bg-bg-850 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-400" />
                                  <span className="text-sm font-medium text-text-high">Communication</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {getRatingStars(review.communicationRating)}
                                  <span className="text-sm text-text-mid ml-1">({review.communicationRating}/5)</span>
                                </div>
                              </div>
                              
                              <div className="bg-bg-850 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <UserGroupIcon className="w-4 h-4 text-green-400" />
                                  <span className="text-sm font-medium text-text-high">Cultural Fit</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {getRatingStars(review.culturalFitRating)}
                                  <span className="text-sm text-text-mid ml-1">({review.culturalFitRating}/5)</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-text-mid mb-1">Interview Notes</label>
                              <div className="bg-bg-850 p-4 rounded-lg border border-border">
                                <p className="text-text-high whitespace-pre-wrap">{review.notes}</p>
                              </div>
                            </div>
                            
                            {review.strengths.length > 0 && (
                              <div>
                                <label className="block text-sm font-medium text-text-mid mb-2">Strengths</label>
                                <div className="flex flex-wrap gap-2">
                                  {review.strengths.map((strength, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                      {strength}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {review.areasForImprovement.length > 0 && (
                              <div>
                                <label className="block text-sm font-medium text-text-mid mb-2">Areas for Improvement</label>
                                <div className="flex flex-wrap gap-2">
                                  {review.areasForImprovement.map((area, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                      {area}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex justify-between text-sm text-text-mid">
                              <span>Interview Date: {formatDate(review.interviewDate)}</span>
                              <span>Duration: {review.duration} minutes</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-text-mid">Failed to load applicant details</p>
              </div>
            )}
           </div>

           {/* Footer with Final Decision */}
           {applicantDetails && (
             <div className="border-t border-border bg-bg-850 p-4 md:p-6">
               <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-3">
                     <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                     <h3 className="text-lg font-semibold text-text-high">Final Hiring Decision</h3>
                   </div>
                   
                   {/* Summary of Recommendations */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                     <div className="bg-bg-800 p-3 rounded-lg">
                       <div className="flex items-center gap-2 mb-2">
                         <UserGroupIcon className="w-4 h-4 text-primary" />
                         <span className="font-medium text-text-high text-sm">HR Recommendations</span>
                       </div>
                       <div className="space-y-1">
                         {applicantDetails.hrRecommendations.length > 0 ? (
                           applicantDetails.hrRecommendations.map((rec, idx) => (
                             <div key={idx} className="flex items-center justify-between text-xs">
                               <span className="text-text-mid">{rec.hrName}</span>
                               <span className={`px-2 py-1 rounded text-xs ${getRecommendationColor(rec.recommendation)}`}>
                                 {rec.recommendation}
                               </span>
                             </div>
                           ))
                         ) : (
                           <p className="text-text-mid text-xs">No HR recommendations</p>
                         )}
                       </div>
                     </div>
                     
                     <div className="bg-bg-800 p-3 rounded-lg">
                       <div className="flex items-center gap-2 mb-2">
                         <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-500" />
                         <span className="font-medium text-text-high text-sm">Interview Reviews</span>
                       </div>
                       <div className="space-y-1">
                         {applicantDetails.interviewReviews.length > 0 ? (
                           applicantDetails.interviewReviews.map((review, idx) => (
                             <div key={idx} className="flex items-center justify-between text-xs">
                               <span className="text-text-mid">{review.interviewerName}</span>
                               <span className={`px-2 py-1 rounded text-xs ${getRecommendationColor(review.recommendation)}`}>
                                 {review.recommendation}
                               </span>
                             </div>
                           ))
                         ) : (
                           <p className="text-text-mid text-xs">No interview reviews</p>
                         )}
                       </div>
                     </div>
                   </div>
                   
                   {/* Final Notes */}
                   <div className="mb-4">
                     <label className="block text-sm font-medium text-text-high mb-2">Final Decision Notes (Optional)</label>
                     <textarea
                       value={finalNotes}
                       onChange={(e) => setFinalNotes(e.target.value)}
                       placeholder="Add any additional notes for your final decision..."
                       className="w-full px-3 py-2 bg-bg-800 border border-border rounded-lg text-text-high placeholder-text-mid focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                       rows={2}
                     />
                   </div>
                 </div>
                 
                 {/* Decision Buttons */}
                 <div className="flex gap-3 lg:ml-6">
                   <Button
                     onClick={() => handleFinalDecision('HIRE')}
                     className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 flex-1 lg:flex-none"
                   >
                     <HandThumbUpIcon className="w-5 h-5" />
                     Approve Hire
                   </Button>
                   <Button
                     onClick={() => handleFinalDecision('REJECT')}
                     className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 flex-1 lg:flex-none"
                   >
                     <HandThumbDownIcon className="w-5 h-5" />
                     Reject Application
                   </Button>
                 </div>
               </div>
             </div>
           )}
         </motion.div>
       </motion.div>
     </AnimatePresence>
   )
 }
