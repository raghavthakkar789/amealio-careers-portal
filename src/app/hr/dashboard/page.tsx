'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { 
  PlusIcon, 
  BriefcaseIcon, 
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function HRDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showCreateJob, setShowCreateJob] = useState(false)
  const [loading, setLoading] = useState(false)

  // Job creation form state
  const [jobForm, setJobForm] = useState({
    title: '',
    department: '',
    summary: '',
    employmentTypes: [] as string[],
    requiredSkills: [] as string[],
    applicationDeadline: '',
  })

  // Job description form state
  const [jobDescriptionForm, setJobDescriptionForm] = useState({
    description: '',
    responsibilities: [] as string[],
    requirements: [] as string[],
    benefits: [] as string[],
    location: '',
    remoteWork: false,
  })

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session || session.user?.role !== 'HR') {
    router.push('/login')
    return null
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create job first
      const jobResponse = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...jobForm,
          createdById: session.user?.id,
        }),
      })

      if (!jobResponse.ok) {
        throw new Error('Failed to create job')
      }

      const job = await jobResponse.json()

      // Create job description
      const descriptionResponse = await fetch('/api/job-descriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...jobDescriptionForm,
          jobId: job.id,
        }),
      })

      if (!descriptionResponse.ok) {
        throw new Error('Failed to create job description')
      }

      toast.success('Job and description created successfully!')
      setShowCreateJob(false)
      
      // Reset forms
      setJobForm({
        title: '',
        department: '',
        summary: '',
        employmentTypes: [],
        requiredSkills: [],
        applicationDeadline: '',
      })
      setJobDescriptionForm({
        description: '',
        responsibilities: [],
        requirements: [],
        benefits: [],
        location: '',
        remoteWork: false,
      })
    } catch (error) {
      toast.error('Failed to create job')
      console.error('Error creating job:', error)
    } finally {
      setLoading(false)
    }
  }

  const addArrayItem = (field: string, value: string, formType: 'job' | 'description') => {
    if (!value.trim()) return

    if (formType === 'job') {
      setJobForm(prev => ({
        ...prev,
        [field]: [...prev[field as keyof typeof prev] as string[], value]
      }))
    } else {
      setJobDescriptionForm(prev => ({
        ...prev,
        [field]: [...prev[field as keyof typeof prev] as string[], value]
      }))
    }
  }

  const removeArrayItem = (field: string, index: number, formType: 'job' | 'description') => {
    if (formType === 'job') {
      setJobForm(prev => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
      }))
    } else {
      setJobDescriptionForm(prev => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
      }))
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
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              HR Dashboard
            </h1>
            <p className="text-text-secondary">
              Welcome back, {session.user?.name}! Manage jobs and applications.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card-dark">
              <div className="flex items-center">
                <BriefcaseIcon className="w-8 h-8 text-primary-400 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-text-primary">24</p>
                  <p className="text-text-secondary">Active Jobs</p>
                </div>
              </div>
            </div>
            
            <div className="card-dark">
              <div className="flex items-center">
                <DocumentTextIcon className="w-8 h-8 text-primary-400 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-text-primary">156</p>
                  <p className="text-text-secondary">Applications</p>
                </div>
              </div>
            </div>
            
            <div className="card-dark">
              <div className="flex items-center">
                <UsersIcon className="w-8 h-8 text-primary-400 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-text-primary">12</p>
                  <p className="text-text-secondary">Interviews</p>
                </div>
              </div>
            </div>
            
            <div className="card-dark">
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-primary-400 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-text-primary">8</p>
                  <p className="text-text-secondary">Hired</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <Button
              onClick={() => setShowCreateJob(true)}
              className="btn-primary"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create New Job
            </Button>
            <Button
              onClick={() => router.push('/hr/applications')}
              className="btn-secondary"
            >
              View Applications
            </Button>
            <Button
              onClick={() => router.push('/hr/interviews')}
              className="btn-secondary"
            >
              Manage Interviews
            </Button>
          </div>

          {/* Create Job Modal */}
          {showCreateJob && (
            <div className="modal-overlay">
              <div className="modal-content max-w-4xl">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-text-primary mb-6">
                    Create New Job Posting
                  </h2>

                  <form onSubmit={handleCreateJob} className="space-y-6">
                    {/* Job Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Job Title</label>
                        <Input
                          value={jobForm.title}
                          onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Senior Software Engineer"
                          required
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="form-label">Department</label>
                        <select
                          value={jobForm.department}
                          onChange={(e) => setJobForm(prev => ({ ...prev, department: e.target.value }))}
                          required
                          className="input-field"
                        >
                          <option value="">Select Department</option>
                          <option value="ENGINEERING">Engineering</option>
                          <option value="MARKETING">Marketing</option>
                          <option value="SALES">Sales</option>
                          <option value="HR">Human Resources</option>
                          <option value="FINANCE">Finance</option>
                          <option value="OPERATIONS">Operations</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Job Summary</label>
                      <textarea
                        value={jobForm.summary}
                        onChange={(e) => setJobForm(prev => ({ ...prev, summary: e.target.value }))}
                        placeholder="Brief summary of the role..."
                        rows={3}
                        className="input-field"
                      />
                    </div>

                    {/* Job Description */}
                    <div>
                      <label className="form-label">Job Description</label>
                      <textarea
                        value={jobDescriptionForm.description}
                        onChange={(e) => setJobDescriptionForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Detailed job description..."
                        rows={6}
                        className="input-field"
                        required
                      />
                    </div>

                    {/* Responsibilities */}
                    <div>
                      <label className="form-label">Key Responsibilities</label>
                      <div className="space-y-2">
                        {jobDescriptionForm.responsibilities.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-text-secondary">{index + 1}.</span>
                            <span className="flex-1 text-text-primary">{item}</span>
                            <button
                              type="button"
                              onClick={() => removeArrayItem('responsibilities', index, 'description')}
                              className="text-error-text hover:text-error-text/80"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add responsibility..."
                            className="input-field flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addArrayItem('responsibilities', e.currentTarget.value, 'description')
                                e.currentTarget.value = ''
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder="Add responsibility..."]') as HTMLInputElement
                              if (input?.value) {
                                addArrayItem('responsibilities', input.value, 'description')
                                input.value = ''
                              }
                            }}
                            className="btn-secondary"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div>
                      <label className="form-label">Requirements</label>
                      <div className="space-y-2">
                        {jobDescriptionForm.requirements.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-text-secondary">{index + 1}.</span>
                            <span className="flex-1 text-text-primary">{item}</span>
                            <button
                              type="button"
                              onClick={() => removeArrayItem('requirements', index, 'description')}
                              className="text-error-text hover:text-error-text/80"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add requirement..."
                            className="input-field flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addArrayItem('requirements', e.currentTarget.value, 'description')
                                e.currentTarget.value = ''
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder="Add requirement..."]') as HTMLInputElement
                              if (input?.value) {
                                addArrayItem('requirements', input.value, 'description')
                                input.value = ''
                              }
                            }}
                            className="btn-secondary"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div>
                      <label className="form-label">Benefits</label>
                      <div className="space-y-2">
                        {jobDescriptionForm.benefits.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-text-secondary">{index + 1}.</span>
                            <span className="flex-1 text-text-primary">{item}</span>
                            <button
                              type="button"
                              onClick={() => removeArrayItem('benefits', index, 'description')}
                              className="text-error-text hover:text-error-text/80"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add benefit..."
                            className="input-field flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addArrayItem('benefits', e.currentTarget.value, 'description')
                                e.currentTarget.value = ''
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder="Add benefit..."]') as HTMLInputElement
                              if (input?.value) {
                                addArrayItem('benefits', input.value, 'description')
                                input.value = ''
                              }
                            }}
                            className="btn-secondary"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Location and Remote Work */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Location</label>
                        <Input
                          value={jobDescriptionForm.location}
                          onChange={(e) => setJobDescriptionForm(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g., Bangalore, India"
                          className="input-field"
                        />
                      </div>
                      <div className="flex items-center mt-6">
                        <input
                          type="checkbox"
                          id="remoteWork"
                          checked={jobDescriptionForm.remoteWork}
                          onChange={(e) => setJobDescriptionForm(prev => ({ ...prev, remoteWork: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="remoteWork" className="ml-2 text-text-primary">
                          Remote work available
                        </label>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6 border-t border-border">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex-1"
                      >
                        {loading ? 'Creating...' : 'Create Job Posting'}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowCreateJob(false)}
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
