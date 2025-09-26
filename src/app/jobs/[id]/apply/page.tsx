'use client'

import { useState, use, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { ArrowLeftIcon, DocumentTextIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'

interface JobApplicationPageProps {
  params: Promise<{
    id: string
  }>
}

export default function JobApplicationPage({ params }: JobApplicationPageProps) {
  const resolvedParams = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [jobLoading, setJobLoading] = useState(true)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [job, setJob] = useState<{
    id: string
    title: string
    department: string
    location: string
    remoteWork: boolean
    description: string
    requirements: string[]
    responsibilities: string[]
    benefits: string[]
    applicationDeadline?: string
  } | null>(null)
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false)

  const [formData, setFormData] = useState({
    coverLetter: '',
    experience: '',
    education: '',
    skills: '',
    availability: '',
    expectedSalary: '',
    references: '',
    linkedinProfile: '',
  })
  const [isLinkedInEditMode, setIsLinkedInEditMode] = useState(false)

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${resolvedParams.id}`)
        if (response.ok) {
          const jobData = await response.json()
          // Transform the job data to match the expected interface
          const transformedJob = {
            id: jobData.id,
            title: jobData.title,
            department: jobData.department?.name || 'Unknown',
            location: jobData.jobDescription?.location || 'Not specified',
            remoteWork: jobData.jobDescription?.remoteWork || false,
            description: jobData.description || '',
            requirements: jobData.jobDescription?.requirements || [],
            responsibilities: jobData.jobDescription?.responsibilities || [],
            benefits: jobData.jobDescription?.benefits || [],
            applicationDeadline: jobData.applicationDeadline
          }
          setJob(transformedJob)
        } else {
          toast.error('Job not found')
          router.push('/jobs')
        }
      } catch (error) {
        toast.error('Failed to load job details')
        console.error('Error fetching job:', error)
        router.push('/jobs')
      } finally {
        setJobLoading(false)
      }
    }

    fetchJob()
  }, [resolvedParams.id, router])

  // Calculate deadline status on client side to avoid hydration mismatch
  useEffect(() => {
    if (job?.applicationDeadline) {
      const now = new Date()
      const deadline = new Date(job.applicationDeadline)
      setIsDeadlinePassed(deadline < now)
    }
  }, [job?.applicationDeadline])

  // Pre-populate LinkedIn field from session
  useEffect(() => {
    if (session?.user?.linkedinProfile) {
      setFormData(prev => ({
        ...prev,
        linkedinProfile: session.user.linkedinProfile || ''
      }))
    }
  }, [session])

  // Check for edit mode and load existing application data
  useEffect(() => {
    const editParam = searchParams.get('edit')
    const appId = searchParams.get('applicationId')
    
    if (editParam === 'true' && appId) {
      setIsEditMode(true)
      setApplicationId(appId)
      
      // Load existing application data
      const loadExistingApplication = async () => {
        try {
          // Mock existing application data - replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500))
          
          setFormData({
            coverLetter: 'I am excited to apply for this position...',
            experience: '5-10 years',
            education: 'Bachelor of Computer Science',
            skills: 'React, Node.js, TypeScript, AWS',
            availability: 'Immediately available',
            expectedSalary: '₹12,00,000 - ₹15,00,000',
            references: 'Available upon request',
            linkedinProfile: 'https://linkedin.com/in/johndoe',
          })
          
          toast.success('Application loaded for editing')
        } catch (error) {
          toast.error('Failed to load application data')
          console.error('Error loading application:', error)
        }
      }
      
      loadExistingApplication()
    }
  }, [searchParams])

  // Handle authentication redirect
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
    }
  }, [session, status, router])

  if (status === 'loading' || jobLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Job Not Found</h2>
          <Button onClick={() => router.push('/jobs')} className="btn-primary">
            Back to Jobs
          </Button>
        </div>
      </div>
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'additional') => {
    const files = e.target.files
    if (files) {
      if (type === 'resume') {
        setResumeFile(files[0])
      } else {
        setAdditionalFiles(Array.from(files))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if deadline has passed
    if (isDeadlinePassed) {
      toast.error('Application deadline has passed. Applications are no longer being accepted.')
      return
    }
    
    setLoading(true)

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('jobId', job.id)
      formDataToSend.append('applicantId', session?.user?.id || '')
      formDataToSend.append('coverLetter', formData.coverLetter)
      formDataToSend.append('experience', formData.experience)
      formDataToSend.append('education', formData.education)
      formDataToSend.append('skills', formData.skills)
      formDataToSend.append('availability', formData.availability)
      formDataToSend.append('expectedSalary', formData.expectedSalary)
      formDataToSend.append('references', formData.references)

      if (resumeFile) {
        formDataToSend.append('resume', resumeFile)
      }

      additionalFiles.forEach((file, index) => {
        formDataToSend.append(`additionalFile_${index}`, file)
      })

      // First update user's LinkedIn profile if provided
      if (formData.linkedinProfile) {
        await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            linkedinProfile: formData.linkedinProfile,
          }),
        })
      }

      // Determine API endpoint based on edit mode
      const apiEndpoint = isEditMode 
        ? `/api/applications/${applicationId}` 
        : '/api/applications'
      
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(apiEndpoint, {
        method,
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('API Error Response:', errorData)
        console.error('Response Status:', response.status)
        throw new Error(`Failed to ${isEditMode ? 'update' : 'submit'} application: ${response.status}`)
      }

      const action = isEditMode ? 'updated' : 'submitted'
      toast.success(`Application ${action} successfully!`)
      router.push('/applicant/applications')
    } catch (error) {
      toast.error('Failed to submit application')
      console.error('Error submitting application:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => router.push(`/jobs/${resolvedParams.id}`)}
              className="btn-secondary mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Job Details
            </Button>
            
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              {isEditMode ? 'Edit Application' : 'Apply for'} {job.title}
            </h1>
            <p className="text-text-secondary">
              {job.department} • {job.location} • {job.remoteWork ? 'Remote' : 'On-site'}
              {isEditMode && <span className="ml-2 text-amber-600 font-medium">• Editing Mode</span>}
            </p>
          </div>

          {/* Application Deadline Alert */}
          {job.applicationDeadline && (
            <div className={`card mb-8 ${isDeadlinePassed ? 'bg-error-bg border-error-text' : 'bg-warning-bg border-warning-text'}`}>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={`font-medium ${isDeadlinePassed ? 'text-error-text' : 'text-warning-text'}`}>
                  {isDeadlinePassed 
                    ? `Application deadline passed: ${new Date(job.applicationDeadline).toLocaleDateString()}`
                    : `Application deadline: ${new Date(job.applicationDeadline).toLocaleDateString()}`
                  }
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job Details Sidebar */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Job Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Description</h4>
                    <p className="text-text-secondary text-sm">{job.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Requirements</h4>
                    <ul className="text-text-secondary text-sm space-y-1">
                      {(job.requirements || []).map((req: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary-400 mr-2">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Responsibilities</h4>
                    <ul className="text-text-secondary text-sm space-y-1">
                      {(job.responsibilities || []).map((resp: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary-400 mr-2">•</span>
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Benefits</h4>
                    <ul className="text-text-secondary text-sm space-y-1">
                      {(job.benefits || []).map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary-400 mr-2">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-2xl font-bold text-text-primary mb-6">
                  Application Form
                </h2>
                
                {isDeadlinePassed && (
                  <div className="bg-error-bg border border-error-text rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-error-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-error-text font-medium">
                        Application deadline has passed. This form is now read-only and applications cannot be submitted.
                      </span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* File Uploads */}
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">
                        <DocumentTextIcon className="w-5 h-5 inline mr-2" />
                        Resume/CV *
                      </label>
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="*/*"
                          onChange={(e) => handleFileUpload(e, 'resume')}
                          required
                          disabled={isDeadlinePassed}
                          className="input-field"
                        />
                        {resumeFile && (
                          <p className="text-success-text text-sm mt-2">
                            Selected: {resumeFile.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="form-label">
                        <CloudArrowUpIcon className="w-5 h-5 inline mr-2" />
                        Additional Documents
                      </label>
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="*/*"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'additional')}
                          disabled={isDeadlinePassed}
                          className="input-field"
                        />
                        {additionalFiles.length > 0 && (
                          <div className="mt-2">
                            <p className="text-success-text text-sm">Selected files:</p>
                            <ul className="text-text-secondary text-sm">
                              {additionalFiles.map((file, index) => (
                                <li key={index}>• {file.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label className="form-label">Cover Letter *</label>
                    <textarea
                      value={formData.coverLetter}
                      onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                      placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                      rows={6}
                      required
                      disabled={isDeadlinePassed}
                      className="input-field"
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="form-label">Work Experience *</label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                      required
                      disabled={isDeadlinePassed}
                      className="input-field"
                    >
                      <option value="">Select your work experience</option>
                      <option value="Applying for internship">Applying for internship</option>
                      <option value="Internship completed">Internship completed</option>
                      <option value="0-6 months">0-6 months</option>
                      <option value="6 months-1 year">6 months-1 year</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="2-3 years">2-3 years</option>
                      <option value="3-4 years">3-4 years</option>
                      <option value="4-5 years">4-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="10-15 years">10-15 years</option>
                      <option value="15-20 years">15-20 years</option>
                      <option value="20+ years">20+ years</option>
                    </select>
                  </div>

                  {/* Education */}
                  <div>
                    <label className="form-label">Education *</label>
                    <textarea
                      value={formData.education}
                      onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                      placeholder="List your educational background..."
                      rows={3}
                      required
                      disabled={isDeadlinePassed}
                      className="input-field"
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="form-label">Technical Skills *</label>
                    <textarea
                      value={formData.skills}
                      onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                      placeholder="List your technical skills and certifications..."
                      rows={3}
                      required
                      disabled={isDeadlinePassed}
                      className="input-field"
                    />
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="form-label">Availability *</label>
                    <Input
                      value={formData.availability}
                      onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                      placeholder="When can you start? (e.g., Immediately, 2 weeks notice)"
                      required
                      disabled={isDeadlinePassed}
                      className="input-field"
                    />
                  </div>

                  {/* Expected Salary */}
                  <div>
                    <label className="form-label">Expected Salary</label>
                    <Input
                      value={formData.expectedSalary}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                      placeholder="Expected salary range in ₹ (optional)"
                      disabled={isDeadlinePassed}
                      className="input-field"
                    />
                  </div>

                  {/* LinkedIn Profile */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="form-label">LinkedIn Profile</label>
                      {session?.user?.linkedinProfile && !isLinkedInEditMode && (
                        <button
                          type="button"
                          onClick={() => setIsLinkedInEditMode(true)}
                          className="text-sm text-primary hover:text-primary-600 transition-colors"
                          disabled={isDeadlinePassed}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    
                    {session?.user?.linkedinProfile && !isLinkedInEditMode ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Using your registered LinkedIn profile:</p>
                            <a 
                              href={formData.linkedinProfile} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-600 text-sm font-medium"
                            >
                              {formData.linkedinProfile}
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Input
                        value={formData.linkedinProfile}
                        onChange={(e) => setFormData(prev => ({ ...prev, linkedinProfile: e.target.value }))}
                        placeholder="https://linkedin.com/in/your-profile"
                        type="url"
                        disabled={isDeadlinePassed}
                        className="input-field"
                      />
                    )}
                    
                    {isLinkedInEditMode && (
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsLinkedInEditMode(false)
                            setFormData(prev => ({
                              ...prev,
                              linkedinProfile: session?.user?.linkedinProfile || ''
                            }))
                          }}
                          className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsLinkedInEditMode(false)
                            // Update user profile with new LinkedIn URL
                            fetch('/api/user/profile', {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                linkedinProfile: formData.linkedinProfile,
                              }),
                            }).then(() => {
                              toast.success('LinkedIn profile updated')
                            }).catch(() => {
                              toast.error('Failed to update LinkedIn profile')
                            })
                          }}
                          className="text-sm text-primary hover:text-primary-600 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    )}
                    
                    <p className="text-xs text-text-mid mt-1">
                      Share your LinkedIn profile to showcase your professional background
                    </p>
                  </div>

                  {/* References */}
                  <div>
                    <label className="form-label">References</label>
                    <textarea
                      value={formData.references}
                      onChange={(e) => setFormData(prev => ({ ...prev, references: e.target.value }))}
                      placeholder="Professional references (optional)"
                      rows={3}
                      disabled={isDeadlinePassed}
                      className="input-field"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6 border-t border-border">
                    <Button
                      type="submit"
                      disabled={loading || isDeadlinePassed}
                      className={`flex-1 ${isDeadlinePassed ? 'btn-disabled' : 'btn-primary'}`}
                    >
                      {loading 
                        ? (isEditMode ? 'Updating...' : 'Submitting...') 
                        : isDeadlinePassed 
                          ? 'Application Closed'
                          : (isEditMode ? 'Update Application' : 'Submit Application')
                      }
                    </Button>
                    <Button
                      type="button"
                      onClick={() => router.back()}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
