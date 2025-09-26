'use client'

import React, { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
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
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import DepartmentManagement from '@/components/hr/DepartmentManagement'

export default function HRDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showCreateJob, setShowCreateJob] = useState(false)
  const [showDepartmentManagement, setShowDepartmentManagement] = useState(false)
  const [showAddHR, setShowAddHR] = useState(false)
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Array<{id: string, name: string}>>([])

  // HR Request form state
  const [hrRequestForm, setHrRequestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    reason: ''
  })

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
      toast.success('Logged out successfully!')
    } catch {
      toast.error('Failed to logout. Please try again.')
    }
  }

  // Job creation form state
  const [jobForm, setJobForm] = useState({
    title: '',
    departmentId: '',
    summary: '',
    employmentTypes: [] as string[],
    requiredSkills: [] as string[],
    applicationDeadline: '',
  })

  // Fetch departments on component mount
  useEffect(() => {
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
    fetchDepartments()
  }, [])

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
      <div className="min-h-screen flex items-center justify-center bg-bg-850">
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
        departmentId: '',
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
    } catch {
      toast.error('Failed to create job')
      console.error('Error creating job')
    } finally {
      setLoading(false)
    }
  }

  const handleAddHRRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/hr-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hrRequestForm),
      })

      if (response.ok) {
        toast.success('HR request submitted successfully!')
        setShowAddHR(false)
        setHrRequestForm({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          department: '',
          reason: ''
        })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit HR request')
      }
    } catch (error) {
      toast.error('Failed to submit HR request')
      console.error('Error submitting HR request:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-bg-850 via-bg-900 to-bg-850">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 flex justify-start">
                <Button
                  onClick={() => router.push('/')}
                  variant="secondary"
                  className="btn-secondary hover-lift"
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </div>
              <div className="flex-1 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mb-4"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-large">
                    <UserGroupIcon className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
              HR Dashboard
            </h1>
                  <p className="text-xl text-text-mid max-w-2xl mx-auto">
                    Welcome back, {session.user?.name}! Manage recruitment, track applications, and streamline hiring processes.
                  </p>
                </motion.div>
              </div>
              <div className="flex-1 flex justify-end">
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  className="btn-secondary hover-lift"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="card hover-lift">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <BriefcaseIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-high">24</p>
                  <p className="text-text-mid">Active Jobs</p>
                  <p className="text-xs text-emerald-600">+3 this week</p>
                </div>
              </div>
            </div>
            
            <div className="card hover-lift">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-high">156</p>
                  <p className="text-text-mid">Applications</p>
                  <p className="text-xs text-emerald-600">+12 today</p>
                </div>
              </div>
            </div>
            
            <div className="card hover-lift">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mr-4">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-high">12</p>
                  <p className="text-text-mid">Interviews</p>
                  <p className="text-xs text-amber-600">5 this week</p>
                </div>
              </div>
            </div>
            
            <div className="card hover-lift">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg flex items-center justify-center mr-4">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-high">8</p>
                  <p className="text-text-mid">Hired</p>
                  <p className="text-xs text-emerald-600">+2 this month</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <div className="card hover-lift group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BriefcaseIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-text-high mb-3">
                  Job Management
                </h3>
                <p className="text-text-mid mb-4 text-sm">
                  Create, edit, and manage all job postings
                </p>
                <Button
                  onClick={() => router.push('/hr/jobs')}
                  className="btn-primary w-full hover-glow"
                >
                  <BriefcaseIcon className="w-4 h-4 mr-2" />
                  Manage Jobs
                </Button>
              </div>
            </div>

            <div className="card hover-lift group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ClipboardDocumentListIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-text-high mb-3">
                  Applications
                </h3>
                <p className="text-text-mid mb-4 text-sm">
                  Review and manage candidate applications
                </p>
            <Button
              onClick={() => router.push('/hr/applications')}
                  className="btn-primary w-full hover-glow"
            >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  View All
            </Button>
              </div>
            </div>

            <div className="card hover-lift group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CalendarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-text-high mb-3">
                  Interviews
                </h3>
                <p className="text-text-mid mb-4 text-sm">
                  Schedule and manage interview sessions
                </p>
            <Button
              onClick={() => router.push('/hr/interviews')}
                  className="btn-primary w-full hover-glow"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </div>
            </div>

            <div className="card hover-lift group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ChartBarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-text-high mb-3">
                  Analytics
                </h3>
                <p className="text-text-mid mb-4 text-sm">
                  Track hiring metrics and performance
                </p>
                <Button
                  onClick={() => router.push('/hr/analytics')}
                  className="btn-primary w-full hover-glow"
                >
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </div>
            </div>

            <div className="card hover-lift group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BuildingOfficeIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-text-high mb-3">
                  Departments
                </h3>
                <p className="text-text-mid mb-4 text-sm">
                  Manage departments and job categories
                </p>
                <Button
                  onClick={() => setShowDepartmentManagement(true)}
                  className="btn-primary w-full hover-glow"
                >
                  <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </div>
            </div>

            <div className="card hover-lift group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UserGroupIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-text-high mb-3">
                  Add Another HR
                </h3>
                <p className="text-text-mid mb-4 text-sm">
                  Request to add a new HR team member
                </p>
                <Button
                  onClick={() => setShowAddHR(true)}
                  className="btn-primary w-full hover-glow"
                >
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Request HR
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity & Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Recent Applications */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-text-high">
                  Recent Applications
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-bg-800 to-bg-850 rounded-xl border border-border hover:shadow-medium transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">AS</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-high">Arjun Sharma</h4>
                      <p className="text-sm text-text-mid">Senior Developer • 2 hours ago</p>
                    </div>
                  </div>
                  <span className="status-badge status-pending">New</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-bg-800 to-bg-850 rounded-xl border border-border hover:shadow-medium transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">PP</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-high">Priya Patel</h4>
                      <p className="text-sm text-text-mid">Product Manager • 4 hours ago</p>
                    </div>
                  </div>
                  <span className="status-badge status-review">Review</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-bg-800 to-bg-850 rounded-xl border border-border hover:shadow-medium transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">RK</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-high">Rahul Kumar</h4>
                      <p className="text-sm text-text-mid">UX Designer • 1 day ago</p>
                    </div>
                  </div>
                  <span className="status-badge status-success">Approved</span>
                </div>
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-text-high">
                  Upcoming Interviews
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-bg-800 to-bg-850 rounded-xl border border-border hover:shadow-medium transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-high">Sarah Wilson</h4>
                      <p className="text-sm text-text-mid">Today • 2:00 PM</p>
                    </div>
                  </div>
                  <span className="status-badge status-review">Video Call</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-bg-800 to-bg-850 rounded-xl border border-border hover:shadow-medium transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-high">Alex Chen</h4>
                      <p className="text-sm text-text-mid">Tomorrow • 10:00 AM</p>
                    </div>
                  </div>
                  <span className="status-badge status-pending">In Person</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-bg-800 to-bg-850 rounded-xl border border-border hover:shadow-medium transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
                      <PhoneIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-high">David Brown</h4>
                      <p className="text-sm text-text-mid">Friday • 3:30 PM</p>
                    </div>
                  </div>
                  <span className="status-badge status-review">Phone Call</span>
                </div>
              </div>
            </div>
          </motion.div>

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

          {/* Department Management Modal */}
          {showDepartmentManagement && (
            <div className="modal-overlay">
              <div className="modal-content max-w-6xl">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-text-primary">
                      Department Management
                    </h2>
                    <Button
                      onClick={() => setShowDepartmentManagement(false)}
                      className="btn-secondary"
                    >
                      Close
                    </Button>
                  </div>
                  <DepartmentManagement />
                </div>
              </div>
            </div>
          )}

          {/* Add HR Request Modal */}
          {showAddHR && (
            <div className="modal-overlay">
              <div className="modal-content max-w-2xl">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-text-primary">
                      Request New HR Member
                    </h2>
                    <Button
                      onClick={() => setShowAddHR(false)}
                      className="btn-secondary"
                    >
                      Close
                    </Button>
                  </div>
                  
                  <form onSubmit={handleAddHRRequest} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">First Name *</label>
                        <Input
                          type="text"
                          value={hrRequestForm.firstName}
                          onChange={(e) => setHrRequestForm(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                          className="input-field"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="form-label">Last Name *</label>
                        <Input
                          type="text"
                          value={hrRequestForm.lastName}
                          onChange={(e) => setHrRequestForm(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                          className="input-field"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Email Address *</label>
                      <Input
                        type="email"
                        value={hrRequestForm.email}
                        onChange={(e) => setHrRequestForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="input-field"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="form-label">Phone Number</label>
                      <Input
                        type="tel"
                        value={hrRequestForm.phoneNumber}
                        onChange={(e) => setHrRequestForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="input-field"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="form-label">Department</label>
                      <select
                        value={hrRequestForm.department}
                        onChange={(e) => setHrRequestForm(prev => ({ ...prev, department: e.target.value }))}
                        className="input-field"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Reason for Request</label>
                      <textarea
                        value={hrRequestForm.reason}
                        onChange={(e) => setHrRequestForm(prev => ({ ...prev, reason: e.target.value }))}
                        className="input-field"
                        rows={3}
                        placeholder="Explain why this HR member is needed..."
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        className="btn-primary flex-1"
                        disabled={loading}
                      >
                        {loading ? 'Submitting...' : 'Submit Request'}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowAddHR(false)}
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
