'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeftIcon,
  StarIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { formatDate, formatDateTime } from '@/lib/utils'

interface InterviewDetails {
  id: string
  scheduledAt: string
  interviewType: string
  location?: string
  meetingLink?: string
  notes?: string
  candidate: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  application: {
    id: string
    jobTitle: string
    status: string
  }
}

interface EvaluationForm {
  overallRating: number
  technicalSkills: number
  communication: number
  culturalFit: number
  strengths: string
  areasForImprovement: string
  comments: string
  recommendation: 'STRONGLY_RECOMMEND' | 'RECOMMEND' | 'NEUTRAL' | 'DO_NOT_RECOMMEND'
  additionalNotes: string
}

export default function InterviewEvaluationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const interviewId = params.id as string

  const [interviewDetails, setInterviewDetails] = useState<InterviewDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<EvaluationForm>({
    overallRating: 0,
    technicalSkills: 0,
    communication: 0,
    culturalFit: 0,
    strengths: '',
    areasForImprovement: '',
    comments: '',
    recommendation: 'NEUTRAL',
    additionalNotes: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || (session.user?.role !== 'HR' && session.user?.role !== 'ADMIN')) {
      router.push('/login')
      return
    }
    
    fetchInterviewDetails()
  }, [session, status, router, interviewId])

  const fetchInterviewDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/interviews/${interviewId}`)
      if (response.ok) {
        const data = await response.json()
        setInterviewDetails(data.interview)
      } else {
        toast.error('Failed to fetch interview details')
        router.push('/hr/interviews')
      }
    } catch (error) {
      console.error('Error fetching interview details:', error)
      toast.error('Failed to fetch interview details')
      router.push('/hr/interviews')
    } finally {
      setLoading(false)
    }
  }

  const handleRatingChange = (field: keyof EvaluationForm, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleInputChange = (field: keyof EvaluationForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.id) {
      toast.error('User session not found')
      return
    }

    // Validate required fields
    if (formData.overallRating === 0) {
      toast.error('Please provide an overall rating')
      return
    }

    if (formData.technicalSkills === 0) {
      toast.error('Please rate technical skills')
      return
    }

    if (formData.communication === 0) {
      toast.error('Please rate communication skills')
      return
    }

    if (formData.culturalFit === 0) {
      toast.error('Please rate cultural fit')
      return
    }

    if (!formData.comments.trim()) {
      toast.error('Please provide interview comments')
      return
    }

    if (formData.recommendation === 'NEUTRAL') {
      toast.error('Please select a recommendation')
      return
    }

    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/interviews/${interviewId}/evaluation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          hrReviewerId: session.user.id
        })
      })

      if (response.ok) {
        toast.success('Interview evaluation submitted successfully!')
        router.push('/hr/interviews')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to submit evaluation')
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error)
      toast.error('Failed to submit evaluation')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStarRating = (value: number, onChange: (value: number) => void, label: string) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-high">{label}</label>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <StarIcon 
              className={`w-8 h-8 transition-colors ${
                star <= value ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400`} 
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-text-mid">({value}/5)</span>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-850">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!interviewDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-850">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-high mb-2">Interview Not Found</h2>
          <p className="text-text-mid mb-4">The interview you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/hr/interviews')} className="btn-primary">
            Back to Interviews
          </Button>
        </div>
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
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => router.push('/hr/interviews')}
              variant="secondary"
              className="btn-secondary"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Interviews
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-text-high">Interview Evaluation</h1>
              <p className="text-text-mid">Complete the evaluation for the conducted interview</p>
            </div>
          </div>

          {/* Interview Details Card */}
          <div className="card mb-8">
            <div className="flex items-center gap-2 mb-6">
              <CalendarIcon className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-text-high">Interview Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-mid mb-1">Candidate</label>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-text-mid" />
                  <p className="text-text-high font-medium">
                    {interviewDetails.candidate.firstName} {interviewDetails.candidate.lastName}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-mid mb-1">Position</label>
                <p className="text-text-high">{interviewDetails.application.jobTitle}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-mid mb-1">Interview Date & Time</label>
                <p className="text-text-high">{formatDateTime(interviewDetails.scheduledAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-mid mb-1">Interview Type</label>
                <p className="text-text-high">{interviewDetails.interviewType.replace('_', ' ')}</p>
              </div>
              
              {interviewDetails.location && (
                <div>
                  <label className="block text-sm font-medium text-text-mid mb-1">Location</label>
                  <p className="text-text-high">{interviewDetails.location}</p>
                </div>
              )}
              
              {interviewDetails.meetingLink && (
                <div>
                  <label className="block text-sm font-medium text-text-mid mb-1">Meeting Link</label>
                  <a 
                    href={interviewDetails.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline"
                  >
                    Join Meeting
                  </a>
                </div>
              )}
            </div>
            
            {interviewDetails.notes && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-text-mid mb-2">Interview Notes</label>
                <div className="bg-bg-800 p-4 rounded-lg border border-border">
                  <p className="text-text-high text-sm whitespace-pre-wrap">{interviewDetails.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Evaluation Form */}
          <form onSubmit={handleSubmit} className="card">
            <div className="flex items-center gap-2 mb-6">
              <DocumentTextIcon className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-text-high">Interview Evaluation Form</h2>
            </div>

            <div className="space-y-8">
              {/* Ratings Section */}
              <div>
                <h3 className="text-lg font-semibold text-text-high mb-4">Candidate Ratings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderStarRating(
                    formData.overallRating,
                    (value) => handleRatingChange('overallRating', value),
                    'Overall Rating *'
                  )}
                  
                  {renderStarRating(
                    formData.technicalSkills,
                    (value) => handleRatingChange('technicalSkills', value),
                    'Technical Skills *'
                  )}
                  
                  {renderStarRating(
                    formData.communication,
                    (value) => handleRatingChange('communication', value),
                    'Communication Skills *'
                  )}
                  
                  {renderStarRating(
                    formData.culturalFit,
                    (value) => handleRatingChange('culturalFit', value),
                    'Cultural Fit *'
                  )}
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <label className="block text-sm font-medium text-text-high mb-2">Recommendation *</label>
                <select
                  value={formData.recommendation}
                  onChange={(e) => handleInputChange('recommendation', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                >
                  <option value="NEUTRAL">Select Recommendation</option>
                  <option value="STRONGLY_RECOMMEND">Strongly Recommend</option>
                  <option value="RECOMMEND">Recommend</option>
                  <option value="DO_NOT_RECOMMEND">Do Not Recommend</option>
                </select>
              </div>

              {/* Strengths */}
              <div>
                <label className="block text-sm font-medium text-text-high mb-2">Strengths</label>
                <textarea
                  value={formData.strengths}
                  onChange={(e) => handleInputChange('strengths', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="List the candidate's key strengths and positive attributes..."
                />
              </div>

              {/* Areas for Improvement */}
              <div>
                <label className="block text-sm font-medium text-text-high mb-2">Areas for Improvement</label>
                <textarea
                  value={formData.areasForImprovement}
                  onChange={(e) => handleInputChange('areasForImprovement', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Identify areas where the candidate could improve..."
                />
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-text-high mb-2">Interview Comments *</label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Provide detailed comments about the interview, candidate's performance, and your overall assessment..."
                  required
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-text-high mb-2">Additional Notes</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Any additional observations or notes..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
                <Button
                  type="button"
                  onClick={() => router.push('/hr/interviews')}
                  variant="secondary"
                  className="btn-secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Submit Evaluation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
