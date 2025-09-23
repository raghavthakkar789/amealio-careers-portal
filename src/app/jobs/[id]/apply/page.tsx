'use client'

import { useState, use, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  const [loading, setLoading] = useState(false)
  const [jobLoading, setJobLoading] = useState(true)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
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
  } | null>(null)

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

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${resolvedParams.id}`)
        if (response.ok) {
          const jobData = await response.json()
          setJob(jobData)
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

  // Fetch user profile to pre-populate LinkedIn field
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          if (data.user?.linkedinProfile) {
            setFormData(prev => ({
              ...prev,
              linkedinProfile: data.user.linkedinProfile
            }))
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    if (session) {
      fetchUserProfile()
    }
  }, [session])

  if (status === 'loading' || jobLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
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
    setLoading(true)

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('jobId', job.id)
      formDataToSend.append('applicantId', session.user?.id || '')
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

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error('Failed to submit application')
      }

      toast.success('Application submitted successfully!')
      router.push('/applicant/dashboard')
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
              Apply for {job.title}
            </h1>
            <p className="text-text-secondary">
              {job.department} • {job.location} • {job.remoteWork ? 'Remote' : 'On-site'}
            </p>
          </div>

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
                      {job.requirements.map((req: string, index: number) => (
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
                      {job.responsibilities.map((resp: string, index: number) => (
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
                      {job.benefits.map((benefit: string, index: number) => (
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
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'resume')}
                          required
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
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'additional')}
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
                      className="input-field"
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="form-label">Work Experience *</label>
                    <textarea
                      value={formData.experience}
                      onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="Describe your relevant work experience..."
                      rows={4}
                      required
                      className="input-field"
                    />
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
                      className="input-field"
                    />
                  </div>

                  {/* Expected Salary */}
                  <div>
                    <label className="form-label">Expected Salary</label>
                    <Input
                      value={formData.expectedSalary}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                      placeholder="Expected salary range (optional)"
                      className="input-field"
                    />
                  </div>

                  {/* LinkedIn Profile */}
                  <div>
                    <label className="form-label">LinkedIn Profile</label>
                    <Input
                      value={formData.linkedinProfile}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedinProfile: e.target.value }))}
                      placeholder="https://linkedin.com/in/your-profile"
                      type="url"
                      className="input-field"
                    />
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
                      className="input-field"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6 border-t border-border">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1"
                    >
                      {loading ? 'Submitting...' : 'Submit Application'}
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
