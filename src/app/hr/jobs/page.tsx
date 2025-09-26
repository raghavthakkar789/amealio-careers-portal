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
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  BriefcaseIcon,
  UsersIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface Job {
  id: string
  title: string
  department: {
    id: string
    name: string
  }
  summary: string
  employmentTypes: string[]
  requiredSkills: string[]
  applicationDeadline?: string
  isActive: boolean
  isDraft: boolean
  createdAt: string
  updatedAt: string
  _count: {
    applications: number
  }
  jobDescription?: {
    description: string
    responsibilities: string[]
    requirements: string[]
    benefits: string[]
    location?: string
    remoteWork: boolean
  }
}

export default function HRJobManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [departments, setDepartments] = useState<Array<{id: string, name: string}>>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'INACTIVE'>('ALL')

  // Job form state
  const [jobForm, setJobForm] = useState({
    title: '',
    departmentId: '',
    summary: '',
    employmentTypes: [] as string[],
    requiredSkills: [] as string[],
    applicationDeadline: '',
    hasDeadline: true,
    isActive: true,
    isDraft: false
  })

  // Job description form state
  const [jobDescriptionForm, setJobDescriptionForm] = useState({
    description: '',
    responsibilities: [] as string[],
    requirements: [] as string[],
    benefits: [] as string[],
    location: '',
    remoteWork: false
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user?.role !== 'HR') {
      router.push('/login')
      return
    }

    fetchJobs()
    fetchDepartments()
  }, [session, status, router])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs)
      } else {
        toast.error('Failed to fetch jobs')
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments.map((dept: any) => ({
          id: dept.id,
          name: dept.name
        })))
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const selectedDepartment = departments.find(d => d.id === jobForm.departmentId)
      const newJob: Job = {
        id: `job-${Date.now()}`,
        title: jobForm.title,
        department: {
          id: jobForm.departmentId,
          name: selectedDepartment?.name || 'Unknown Department'
        },
        summary: jobForm.summary,
        employmentTypes: jobForm.employmentTypes,
        requiredSkills: jobForm.requiredSkills,
        applicationDeadline: jobForm.hasDeadline ? jobForm.applicationDeadline : undefined,
        isActive: jobForm.isActive,
        isDraft: jobForm.isDraft,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        _count: { applications: 0 },
        jobDescription: {
          description: jobDescriptionForm.description,
          responsibilities: jobDescriptionForm.responsibilities,
          requirements: jobDescriptionForm.requirements,
          benefits: jobDescriptionForm.benefits,
          location: jobDescriptionForm.location,
          remoteWork: jobDescriptionForm.remoteWork
        }
      }
      
      setJobs(prev => [newJob, ...prev])
      setShowCreateForm(false)
      resetForms()
      toast.success('Job created successfully!')
    } catch {
      toast.error('Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  const handleEditJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingJob) return
    
    setLoading(true)
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const selectedDepartment = departments.find(d => d.id === jobForm.departmentId)
      const updatedJob: Job = {
        ...editingJob,
        title: jobForm.title,
        department: {
          id: jobForm.departmentId,
          name: selectedDepartment?.name || 'Unknown Department'
        },
        summary: jobForm.summary,
        employmentTypes: jobForm.employmentTypes,
        requiredSkills: jobForm.requiredSkills,
        applicationDeadline: jobForm.hasDeadline ? jobForm.applicationDeadline : undefined,
        isActive: jobForm.isActive,
        isDraft: jobForm.isDraft,
        updatedAt: new Date().toISOString().split('T')[0],
        jobDescription: {
          ...editingJob.jobDescription,
          description: jobDescriptionForm.description,
          responsibilities: jobDescriptionForm.responsibilities,
          requirements: jobDescriptionForm.requirements,
          benefits: jobDescriptionForm.benefits,
          location: jobDescriptionForm.location,
          remoteWork: jobDescriptionForm.remoteWork
        }
      }
      
      setJobs(prev => prev.map(job => job.id === editingJob.id ? updatedJob : job))
      setEditingJob(null)
      resetForms()
      toast.success('Job updated successfully!')
    } catch {
      toast.error('Failed to update job')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    // Check if job has pending applications
    const pendingApplications = jobs.filter(job => 
      job.id === jobId && job._count.applications > 0
    )

    if (pendingApplications.length > 0) {
      const job = jobs.find(j => j.id === jobId)
      toast.error(
        `Cannot delete job "${job?.title}". There are ${job?._count.applications} applications that must be processed first. Please review and process all applications before deleting this job.`,
        { duration: 6000 }
      )
      return
    }

    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }
    
    setLoading(true)
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setJobs(prev => prev.filter(job => job.id !== jobId))
      toast.success('Job deleted successfully!')
    } catch {
      toast.error('Failed to delete job')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleJobStatus = async (jobId: string) => {
    setLoading(true)
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, isActive: !job.isActive, updatedAt: new Date().toISOString().split('T')[0] }
          : job
      ))
      
      const job = jobs.find(j => j.id === jobId)
      toast.success(`Job ${job?.isActive ? 'deactivated' : 'activated'} successfully!`)
    } catch {
      toast.error('Failed to update job status')
    } finally {
      setLoading(false)
    }
  }

  const resetForms = () => {
    setJobForm({
      title: '',
      departmentId: '',
      summary: '',
      employmentTypes: [],
      requiredSkills: [],
      applicationDeadline: '',
      hasDeadline: true,
      isActive: true,
      isDraft: false
    })
    setJobDescriptionForm({
      description: '',
      responsibilities: [],
      requirements: [],
      benefits: [],
      location: '',
      remoteWork: false
    })
  }

  const startEdit = (job: Job) => {
    setEditingJob(job)
    setJobForm({
      title: job.title,
      departmentId: job.department.id,
      summary: job.summary,
      employmentTypes: job.employmentTypes,
      requiredSkills: job.requiredSkills,
      applicationDeadline: job.applicationDeadline || '',
      hasDeadline: !!job.applicationDeadline,
      isActive: job.isActive,
      isDraft: job.isDraft
    })
    setJobDescriptionForm({
      description: job.jobDescription?.description || '',
      responsibilities: job.jobDescription?.responsibilities || [],
      requirements: job.jobDescription?.requirements || [],
      benefits: job.jobDescription?.benefits || [],
      location: job.jobDescription?.location || '',
      remoteWork: job.jobDescription?.remoteWork || false
    })
  }

  const filteredJobs = jobs.filter(job => {
    if (filterStatus === 'ALL') return true
    if (filterStatus === 'ACTIVE') return job.isActive && !job.isDraft
    if (filterStatus === 'DRAFT') return job.isDraft
    if (filterStatus === 'INACTIVE') return !job.isActive && !job.isDraft
    return true
  })

  const getStatusBadge = (job: Job) => {
    if (job.isDraft) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Draft</span>
    }
    if (!job.isActive) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Inactive</span>
    }
    return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
  }

  const getDeadlineStatus = (job: Job) => {
    if (!job.applicationDeadline) {
      return <span className="text-gray-500 text-sm">No deadline</span>
    }
    
    const deadline = new Date(job.applicationDeadline)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return <span className="text-red-500 text-sm">Expired</span>
    } else if (diffDays <= 7) {
      return <span className="text-orange-500 text-sm">{diffDays} days left</span>
    } else {
      return <span className="text-green-500 text-sm">{diffDays} days left</span>
    }
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/hr/dashboard')}
                variant="secondary"
                className="btn-secondary"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-text-high">Job Management</h1>
                <p className="text-text-mid">Create, edit, and manage job postings</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create New Job
            </Button>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex items-center gap-4">
              <span className="text-text-mid font-medium">Filter by status:</span>
              <div className="flex gap-2">
                {(['ALL', 'ACTIVE', 'DRAFT', 'INACTIVE'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      filterStatus === status
                        ? 'bg-primary text-white border-primary'
                        : 'bg-bg-800 text-text-mid border-border hover:border-primary/50'
                    }`}
                  >
                    {status} ({jobs.filter(job => {
                      if (status === 'ALL') return true
                      if (status === 'ACTIVE') return job.isActive && !job.isDraft
                      if (status === 'DRAFT') return job.isDraft
                      if (status === 'INACTIVE') return !job.isActive && !job.isDraft
                      return true
                    }).length})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="card text-center py-12">
                <BriefcaseIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-high mb-2">
                  No Jobs Found
                </h3>
                <p className="text-text-mid mb-4">
                  {filterStatus === 'ALL' 
                    ? "You haven't created any jobs yet."
                    : `No jobs found with status: ${filterStatus}`
                  }
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Your First Job
                </Button>
              </div>
            ) : (
              filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <BriefcaseIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-text-high">
                            {job.title}
                          </h3>
                          <p className="text-text-mid">{job.department.name}</p>
                        </div>
                        {getStatusBadge(job)}
                      </div>
                      
                      <p className="text-text-mid mb-4">{job.summary}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-text-mid">Applications</p>
                          <p className="font-medium text-text-high flex items-center gap-1">
                            <UsersIcon className="w-4 h-4" />
                            {job._count.applications}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-text-mid">Deadline</p>
                          <p className="font-medium text-text-high flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {getDeadlineStatus(job)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-text-mid">Created</p>
                          <p className="font-medium text-text-high">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-text-mid">Updated</p>
                          <p className="font-medium text-text-high">
                            {new Date(job.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-text-mid mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-primary-800 text-primary-200 text-sm rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => router.push(`/jobs/${job.id}`)}
                        variant="secondary"
                        className="btn-secondary"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        View Job
                      </Button>
                      
                      <Button
                        onClick={() => startEdit(job)}
                        variant="secondary"
                        className="btn-secondary"
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      
                      <Button
                        onClick={() => handleToggleJobStatus(job.id)}
                        variant="secondary"
                        className={`btn-secondary ${
                          job.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {job.isActive ? (
                          <>
                            <XCircleIcon className="w-4 h-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                            Activate
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => handleDeleteJob(job.id)}
                        variant="secondary"
                        className={`btn-secondary ${
                          job._count.applications > 0 
                            ? 'text-gray-400 hover:text-gray-500 cursor-not-allowed opacity-50' 
                            : 'text-red-600 hover:text-red-700'
                        }`}
                        disabled={job._count.applications > 0}
                        title={job._count.applications > 0 ? `Cannot delete: ${job._count.applications} applications pending` : 'Delete job'}
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Create/Edit Job Modal */}
      {(showCreateForm || editingJob) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-high">
                {editingJob ? 'Edit Job' : 'Create New Job'}
              </h2>
              <Button
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingJob(null)
                  resetForms()
                }}
                variant="secondary"
                className="btn-secondary"
              >
                ×
              </Button>
            </div>

            <form onSubmit={editingJob ? handleEditJob : handleCreateJob} className="space-y-6">
              {/* Basic Job Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Job Title *</label>
                  <Input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="input-field"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                
                <div>
                  <label className="form-label">Department *</label>
                  <select
                    value={jobForm.departmentId}
                    onChange={(e) => setJobForm(prev => ({ ...prev, departmentId: e.target.value }))}
                    required
                    className="input-field"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Job Summary *</label>
                <textarea
                  value={jobForm.summary}
                  onChange={(e) => setJobForm(prev => ({ ...prev, summary: e.target.value }))}
                  required
                  className="input-field"
                  rows={3}
                  placeholder="Brief description of the role..."
                />
              </div>

              {/* Employment Types */}
              <div>
                <label className="form-label">Employment Types *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'].map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={jobForm.employmentTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setJobForm(prev => ({ ...prev, employmentTypes: [...prev.employmentTypes, type] }))
                          } else {
                            setJobForm(prev => ({ ...prev, employmentTypes: prev.employmentTypes.filter(t => t !== type) }))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-text-mid">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <label className="form-label">Required Skills</label>
                <Input
                  type="text"
                  value={jobForm.requiredSkills.join(', ')}
                  onChange={(e) => {
                    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
                    setJobForm(prev => ({ ...prev, requiredSkills: skills }))
                  }}
                  className="input-field"
                  placeholder="e.g., React, Node.js, TypeScript, AWS"
                />
                <p className="text-xs text-text-mid mt-1">Separate skills with commas</p>
              </div>

              {/* Deadline Management */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-text-high mb-4">Application Deadline</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={jobForm.hasDeadline}
                      onChange={(e) => setJobForm(prev => ({ ...prev, hasDeadline: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-text-mid">Set application deadline</span>
                  </label>
                  
                  {jobForm.hasDeadline && (
                    <div>
                      <label className="form-label">Deadline Date *</label>
                      <Input
                        type="date"
                        value={jobForm.applicationDeadline}
                        onChange={(e) => setJobForm(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                        required={jobForm.hasDeadline}
                        className="input-field"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}
                  
                  {!jobForm.hasDeadline && (
                    <p className="text-text-mid text-sm bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                      <ClockIcon className="w-4 h-4 inline mr-2" />
                      This job will have no application deadline - applications will be accepted indefinitely.
                    </p>
                  )}
                </div>
              </div>

              {/* Job Status */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-text-high mb-4">Job Status</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={jobForm.isActive}
                      onChange={(e) => setJobForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-text-mid">Active (visible to applicants)</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={jobForm.isDraft}
                      onChange={(e) => setJobForm(prev => ({ ...prev, isDraft: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-text-mid">Save as draft (not visible to applicants)</span>
                  </label>
                </div>
              </div>

              {/* Job Description */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-text-high mb-4">Job Description</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Detailed Description</label>
                    <textarea
                      value={jobDescriptionForm.description}
                      onChange={(e) => setJobDescriptionForm(prev => ({ ...prev, description: e.target.value }))}
                      className="input-field"
                      rows={4}
                      placeholder="Detailed job description..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Responsibilities</label>
                      <textarea
                        value={jobDescriptionForm.responsibilities.join('\n')}
                        onChange={(e) => {
                          const responsibilities = e.target.value.split('\n').filter(item => item.trim())
                          setJobDescriptionForm(prev => ({ ...prev, responsibilities }))
                        }}
                        className="input-field"
                        rows={3}
                        placeholder="One responsibility per line..."
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Requirements</label>
                      <textarea
                        value={jobDescriptionForm.requirements.join('\n')}
                        onChange={(e) => {
                          const requirements = e.target.value.split('\n').filter(item => item.trim())
                          setJobDescriptionForm(prev => ({ ...prev, requirements }))
                        }}
                        className="input-field"
                        rows={3}
                        placeholder="One requirement per line..."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Benefits</label>
                    <textarea
                      value={jobDescriptionForm.benefits.join('\n')}
                      onChange={(e) => {
                        const benefits = e.target.value.split('\n').filter(item => item.trim())
                        setJobDescriptionForm(prev => ({ ...prev, benefits }))
                      }}
                      className="input-field"
                      rows={3}
                      placeholder="One benefit per line..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Location</label>
                      <Input
                        type="text"
                        value={jobDescriptionForm.location}
                        onChange={(e) => setJobDescriptionForm(prev => ({ ...prev, location: e.target.value }))}
                        className="input-field"
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        checked={jobDescriptionForm.remoteWork}
                        onChange={(e) => setJobDescriptionForm(prev => ({ ...prev, remoteWork: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-text-mid">Remote work available</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-border">
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingJob(null)
                    resetForms()
                  }}
                  variant="secondary"
                  className="btn-secondary"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      {editingJob ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <DocumentTextIcon className="w-4 h-4 mr-2" />
                      {editingJob ? 'Update Job' : 'Create Job'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
