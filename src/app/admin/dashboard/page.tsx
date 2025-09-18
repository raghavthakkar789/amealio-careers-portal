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
  UsersIcon, 
  BriefcaseIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserPlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [applicants, setApplicants] = useState<any[]>([])
  const [hrUsers, setHrUsers] = useState<any[]>([])
  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    pendingReviews: 0,
    hired: 0,
    rejected: 0,
    averageTimeToHire: 0,
    departmentStats: {} as Record<string, { applications: number; hired: number; pending: number }>
  })

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setApplicants([
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            position: 'Senior Software Engineer',
            status: 'PENDING_REVIEW',
            applicationDate: '2024-01-15',
            interviewScore: 4.2,
            hrRecommendation: 'HIRE',
            backgroundCheck: 'PENDING',
            referenceCheck: 'COMPLETED',
            experience: '5 years',
            skills: ['React', 'Node.js', 'TypeScript']
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            position: 'Product Manager',
            status: 'APPROVED',
            applicationDate: '2024-01-10',
            interviewScore: 4.8,
            hrRecommendation: 'HIRE',
            backgroundCheck: 'COMPLETED',
            referenceCheck: 'COMPLETED',
            experience: '7 years',
            skills: ['Product Strategy', 'Agile', 'User Research']
          }
        ])

        setHrUsers([
          {
            id: '1',
            name: 'Sarah Johnson',
            email: 'sarah@amealio.com',
            department: 'HR',
            createdAt: '2024-01-01',
            activeJobs: 5,
            totalHires: 12
          },
          {
            id: '2',
            name: 'Mike Wilson',
            email: 'mike@amealio.com',
            department: 'HR',
            createdAt: '2024-01-15',
            activeJobs: 3,
            totalHires: 8
          }
        ])

        setAnalytics({
          totalApplications: 156,
          pendingReviews: 23,
          hired: 45,
          rejected: 88,
          averageTimeToHire: 18,
          departmentStats: {
            'Engineering': { applications: 67, hired: 23, pending: 12 },
            'Marketing': { applications: 34, hired: 8, pending: 5 },
            'Sales': { applications: 28, hired: 7, pending: 3 },
            'HR': { applications: 15, hired: 4, pending: 2 },
            'Finance': { applications: 12, hired: 3, pending: 1 }
          }
        })
      } catch (error) {
        toast.error('Failed to load dashboard data')
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') {
    router.push('/login')
    return null
  }

  const handleFinalDecision = async (applicantId: string, decision: 'HIRE' | 'REJECT', salary?: string, startDate?: string) => {
    setLoading(true)
    try {
      // API call to make final decision
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`Final decision: ${decision}`)
      
      // Update applicant status
      setApplicants(prev => prev.map(applicant => 
        applicant.id === applicantId 
          ? { ...applicant, status: decision === 'HIRE' ? 'HIRED' : 'REJECTED' }
          : applicant
      ))
    } catch (error) {
      toast.error('Failed to make final decision')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateHRUser = async (formData: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/create-hr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('HR user created successfully')
        
        // Add to HR users list
        const newHRUser = {
          id: data.user.id,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          department: formData.department,

          createdAt: new Date().toISOString().split('T')[0], // Use date only to avoid timezone issues
          activeJobs: 0,
          totalHires: 0
        }
        setHrUsers(prev => [...prev, newHRUser])
      } else {
        toast.error(data.message || 'Failed to create HR user')
      }
    } catch (error) {
      toast.error('Failed to create HR user')
      console.error('Error creating HR user:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-850">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text-high mb-2">
              Admin Dashboard
            </h1>
            <p className="text-text-mid">
              Welcome back, {session.user?.name}! Manage the entire hiring process.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-8 border-b border-border">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'applicants', label: 'Applicant Profiles', icon: UsersIcon },
              { id: 'hr-management', label: 'HR Management', icon: UserPlusIcon },
              { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-mid hover:text-text-high'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-8 h-8 text-primary mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-text-high">{analytics.totalApplications}</p>
                      <p className="text-text-mid">Total Applications</p>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <ClockIcon className="w-8 h-8 text-amber mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-text-high">{analytics.pendingReviews}</p>
                      <p className="text-text-mid">Pending Reviews</p>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-8 h-8 text-emerald mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-text-high">{analytics.hired}</p>
                      <p className="text-text-mid">Hired</p>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center">
                    <XCircleIcon className="w-8 h-8 text-rose mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-text-high">{analytics.rejected}</p>
                      <p className="text-text-mid">Rejected</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Stats */}
              <div className="card">
                <h2 className="text-2xl font-bold text-text-high mb-6">Department Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analytics.departmentStats).map(([dept, stats]: [string, { applications: number; hired: number; pending: number }]) => (
                    <div key={dept} className="bg-bg-850 p-4 rounded-lg border border-border hover:shadow-medium transition-all duration-200">
                      <h3 className="font-semibold text-text-high mb-2">{dept}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-mid">Applications:</span>
                          <span className="text-text-high">{stats.applications}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-mid">Hired:</span>
                          <span className="text-emerald">{stats.hired}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-mid">Pending:</span>
                          <span className="text-amber">{stats.pending}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Applicant Profiles Tab */}
          {activeTab === 'applicants' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-2xl font-bold text-text-primary mb-6">Applicant Profiles</h2>
                <div className="space-y-4">
                  {applicants.map((applicant: any) => (
                    <div key={applicant.id} className="bg-bg-850 p-6 rounded-lg border border-border">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-text-primary">{applicant.name}</h3>
                          <p className="text-text-secondary">{applicant.position}</p>
                          <p className="text-text-secondary text-sm">{applicant.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            applicant.status === 'HIRED' ? 'bg-success-bg text-success-text' :
                            applicant.status === 'REJECTED' ? 'bg-error-bg text-error-text' :
                            'bg-warning-bg text-warning-text'
                          }`}>
                            {applicant.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-text-primary mb-2">Application Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Applied:</span>
                              <span className="text-text-primary">{new Date(applicant.applicationDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Experience:</span>
                              <span className="text-text-primary">{applicant.experience}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Interview Score:</span>
                              <span className="text-text-primary">{applicant.interviewScore}/5</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-text-primary mb-2">Background Checks</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Background:</span>
                              <span className={`${
                                applicant.backgroundCheck === 'COMPLETED' ? 'text-success-text' :
                                applicant.backgroundCheck === 'PENDING' ? 'text-warning-text' :
                                'text-error-text'
                              }`}>
                                {applicant.backgroundCheck}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary">References:</span>
                              <span className={`${
                                applicant.referenceCheck === 'COMPLETED' ? 'text-success-text' :
                                applicant.referenceCheck === 'PENDING' ? 'text-warning-text' :
                                'text-error-text'
                              }`}>
                                {applicant.referenceCheck}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary">HR Recommendation:</span>
                              <span className={`${
                                applicant.hrRecommendation === 'HIRE' ? 'text-success-text' :
                                'text-error-text'
                              }`}>
                                {applicant.hrRecommendation}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-text-primary mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {applicant.skills.map((skill: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-primary-800 text-primary-200 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Final Decision Actions */}
                      {applicant.status === 'PENDING_REVIEW' && (
                        <div className="flex gap-4 pt-4 border-t border-border">
                          <Button
                            onClick={() => handleFinalDecision(applicant.id, 'HIRE')}
                            className="btn-success"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                            Approve Hire
                          </Button>
                          <Button
                            onClick={() => handleFinalDecision(applicant.id, 'REJECT')}
                            className="btn-error"
                          >
                            <XCircleIcon className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button className="btn-secondary">
                            <EyeIcon className="w-4 h-4 mr-2" />
                            View Full Profile
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HR Management Tab */}
          {activeTab === 'hr-management' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-2xl font-bold text-text-primary mb-6">HR Users Management</h2>
                
                {/* Create HR User Form */}
                <div className="bg-bg-850 p-6 rounded-lg border border-border mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Create New HR User</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleCreateHRUser({
                      firstName: formData.get('firstName'),
                      lastName: formData.get('lastName'),
                      email: formData.get('email'),
                      password: formData.get('password'),
                      department: formData.get('department')
                    })
                  }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="firstName"
                      placeholder="First Name"
                      required
                      className="input-field"
                    />
                    <Input
                      name="lastName"
                      placeholder="Last Name"
                      required
                      className="input-field"
                    />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      required
                      className="input-field"
                    />
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password (min 8 chars)"
                      required
                      className="input-field"
                    />
                    <select
                      name="department"
                      required
                      className="input-field"
                    >
                      <option value="">Select Department</option>
                      <option value="HR">Human Resources</option>
                      <option value="ENGINEERING">Engineering</option>
                      <option value="MARKETING">Marketing</option>
                      <option value="SALES">Sales</option>
                      <option value="FINANCE">Finance</option>
                      <option value="OPERATIONS">Operations</option>
                    </select>
                    <Button type="submit" className="btn-primary">
                      <UserPlusIcon className="w-4 h-4 mr-2" />
                      Create HR User
                    </Button>
                  </form>
                </div>

                {/* HR Users List */}
                <div className="space-y-4">
                  {hrUsers.map((hrUser: any) => (
                    <div key={hrUser.id} className="bg-bg-850 p-4 rounded-lg border border-border">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-text-primary">{hrUser.name}</h3>
                          <p className="text-text-secondary text-sm">{hrUser.email}</p>
                          <p className="text-text-secondary text-sm">
                            Created: {new Date(hrUser.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-text-primary">{hrUser.activeJobs}</p>
                            <p className="text-text-secondary text-sm">Active Jobs</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-text-primary">{hrUser.totalHires}</p>
                            <p className="text-text-secondary text-sm">Total Hires</p>
                          </div>
                          <div className="flex gap-2">
                            <Button className="btn-secondary">
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            <Button className="btn-error">
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-2xl font-bold text-text-primary mb-6">Hiring Analytics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-bg-850 p-6 rounded-lg border border-border">
                    <h3 className="font-semibold text-text-primary mb-4">Time-to-Hire Analytics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Average Time to Hire:</span>
                        <span className="text-text-primary font-semibold">{analytics.averageTimeToHire} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Fastest Hire:</span>
                        <span className="text-success-text font-semibold">5 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Longest Process:</span>
                        <span className="text-warning-text font-semibold">45 days</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-bg-850 p-6 rounded-lg border border-border">
                    <h3 className="font-semibold text-text-primary mb-4">Source Tracking</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">LinkedIn:</span>
                        <span className="text-text-primary">45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Company Website:</span>
                        <span className="text-text-primary">30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Referrals:</span>
                        <span className="text-text-primary">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Other:</span>
                        <span className="text-text-primary">10%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="btn-primary">
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Export Analytics Report
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
