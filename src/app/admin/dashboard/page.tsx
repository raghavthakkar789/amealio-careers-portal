'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { 
  UsersIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserPlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  KeyIcon,
  BriefcaseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { 
  Applicant, 
  HRUser, 
  Application, 
  Job, 
  DashboardStats,
  HRPerformanceMetrics,
  DashboardApplicant,
  DashboardHRUser
} from '@/types/admin'
import FinalApprovalModal from '@/components/application/FinalApprovalModal'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

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
  const [applicants, setApplicants] = useState<DashboardApplicant[]>([])
  const [acceptedApplications, setAcceptedApplications] = useState<Application[]>([])
  const [hrUsers, setHrUsers] = useState<DashboardHRUser[]>([])
  const [pendingHRRequests, setPendingHRRequests] = useState<number>(0)
  const [adminUsers, setAdminUsers] = useState<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
    isActive: boolean;
  }[]>([])
  const [showFinalApprovalModal, setShowFinalApprovalModal] = useState(false)
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null)
  const [loadingFinalApproval, setLoadingFinalApproval] = useState(false)
  const [analytics, setAnalytics] = useState<DashboardStats>({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalInterviews: 0,
    pendingHRRequests: 0,
    activeJobs: 0,
    recentApplications: 0,
    upcomingInterviews: 0,
    pendingReviews: 0,
    hired: 0,
    rejected: 0,
    averageTimeToHire: 0,
    departmentStats: {}
  })

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
  }, [session, status, router])

  // Fetch accepted applications for final approval
  const fetchAcceptedApplications = async () => {
    setLoadingFinalApproval(true)
    try {
      const response = await fetch('/api/admin/oversight/applications?status=ACCEPTED')
      if (response.ok) {
        const data = await response.json()
        setAcceptedApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching accepted applications:', error)
      toast.error('Failed to fetch accepted applications')
    } finally {
      setLoadingFinalApproval(false)
    }
  }

  // Handle final hiring decision
  const handleFinalHire = async (applicationId: string) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'HIRED',
          action: 'HIRE',
          notes: 'Final hiring decision by Admin'
        })
      })

      if (response.ok) {
        toast.success('Candidate hired successfully!')
        await fetchAcceptedApplications() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to hire candidate')
      }
    } catch (error) {
      console.error('Error hiring candidate:', error)
      toast.error('Failed to hire candidate')
    }
  }

  // Handle final rejection
  const handleFinalReject = async (applicationId: string, rejectionReason: string) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REJECTED',
          action: 'FINAL_REJECT',
          notes: rejectionReason
        })
      })

      if (response.ok) {
        toast.success('Application rejected successfully')
        await fetchAcceptedApplications() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to reject application')
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
      toast.error('Failed to reject application')
    }
  }

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch HR users from database
        const hrResponse = await fetch('/api/admin/hr-performance')
        if (hrResponse.ok) {
          const hrData = await hrResponse.json()
          if (hrData.hrUsers && Array.isArray(hrData.hrUsers)) {
            const transformedHrUsers = hrData.hrUsers.map((hr: {
              id: string;
              firstName: string;
              lastName: string;
              email: string;
              createdAt: string;
              jobsPosted: number;
              hiresMade: number;
            }) => ({
              id: hr.id,
              name: `${hr.firstName} ${hr.lastName}`,
              email: hr.email,
              department: 'HR', // Default department
              createdAt: hr.createdAt,
              activeJobs: hr.jobsPosted,
              totalHires: hr.hiresMade
            }))
            setHrUsers(transformedHrUsers)
          }
        }

        // Fetch pending HR requests count
        const hrRequestsResponse = await fetch('/api/hr-requests')
        if (hrRequestsResponse.ok) {
          const hrRequestsData = await hrRequestsResponse.json()
          if (hrRequestsData.requests && Array.isArray(hrRequestsData.requests)) {
            const pendingCount = hrRequestsData.requests.filter((request: { status: string }) => 
              request.status === 'PENDING'
            ).length
            setPendingHRRequests(pendingCount)
          }
        }

        // Fetch admin users
        const adminsResponse = await fetch('/api/admin/admins')
        if (adminsResponse.ok) {
          const adminsData = await adminsResponse.json()
          if (adminsData.admins && Array.isArray(adminsData.admins)) {
            const transformedAdmins = adminsData.admins.map((admin: {
              id: string;
              firstName: string;
              lastName: string;
              email: string;
              createdAt: string;
              isActive: boolean;
            }) => ({
              id: admin.id,
              name: `${admin.firstName} ${admin.lastName}`,
              email: admin.email,
              createdAt: admin.createdAt,
              isActive: admin.isActive
            }))
            setAdminUsers(transformedAdmins)
          }
        }

        // Fetch applicants from API
        try {
          const applicantsResponse = await fetch('/api/admin/oversight/applicants')
          if (applicantsResponse.ok) {
            const applicantsData = await applicantsResponse.json()
            setApplicants(applicantsData.applicants || [])
          }
        } catch (error) {
          console.error('Error fetching applicants:', error)
        }

        // Fetch analytics from API
        try {
          const analyticsResponse = await fetch('/api/admin/oversight/analytics')
          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json()
            setAnalytics(analyticsData)
          } else {
            // Fallback to basic analytics if API fails
            setAnalytics({
              totalUsers: 0,
              totalJobs: 0,
              totalApplications: 0,
              totalInterviews: 0,
              pendingHRRequests: 0,
              activeJobs: 0,
              recentApplications: 0,
              upcomingInterviews: 0,
              pendingReviews: 0,
              hired: 0,
              rejected: 0,
              averageTimeToHire: 0,
              departmentStats: {},
              stageStats: {
                pending: 0,
                underReview: 0,
                interviewScheduled: 0,
                interviewCompleted: 0,
                accepted: 0,
                hired: 0,
                rejected: 0
              }
            })
          }
        } catch (error) {
          console.error('Error fetching analytics:', error)
          // Fallback analytics
          setAnalytics({
            totalUsers: 0,
            totalJobs: 0,
            totalApplications: 0,
            totalInterviews: 0,
            pendingHRRequests: 0,
            activeJobs: 0,
            recentApplications: 0,
            upcomingInterviews: 0,
            pendingReviews: 0,
            hired: 0,
            rejected: 0,
            averageTimeToHire: 0,
            departmentStats: {},
            stageStats: {
              pending: 0,
              underReview: 0,
              interviewScheduled: 0,
              interviewCompleted: 0,
              accepted: 0,
              hired: 0,
              rejected: 0
            }
          })
        }

        // Fetch accepted applications for final approval
        await fetchAcceptedApplications()
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
    return null
  }

  const handleFinalDecision = async (decision: 'HIRE' | 'REJECT', notes?: string) => {
    if (!selectedApplicantId) return
    
    setLoading(true)
    try {
      // API call to make final decision
      const response = await fetch(`/api/applications/${selectedApplicantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: decision === 'HIRE' ? 'HIRED' : 'REJECTED',
          action: 'FINAL_DECISION',
          notes: notes || `Final decision: ${decision} by admin`
        }),
      })

      if (response.ok) {
        toast.success(`Final decision: ${decision}`)
        
        // Update applicant status
        setApplicants(prev => prev.map(applicant => 
          applicant.id === selectedApplicantId 
            ? { ...applicant, status: decision === 'HIRE' ? 'HIRED' : 'REJECTED' }
            : applicant
        ))
        
        setShowFinalApprovalModal(false)
        setSelectedApplicantId(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to make final decision')
      }
    } catch {
      toast.error('Failed to make final decision')
    } finally {
      setLoading(false)
    }
  }

  const handleViewFullProfile = (applicantId: string) => {
    setSelectedApplicantId(applicantId)
    setShowFinalApprovalModal(true)
  }

  const handleCloseFinalApprovalModal = () => {
    setShowFinalApprovalModal(false)
    setSelectedApplicantId(null)
  }

  const handleCreateHRUser = async (formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    department: string;
  }) => {
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
        
        // Refresh HR users list to get updated data
        const hrResponse = await fetch('/api/admin/hr-performance')
        if (hrResponse.ok) {
          const hrData = await hrResponse.json()
          if (hrData.hrUsers && Array.isArray(hrData.hrUsers)) {
            const transformedHrUsers = hrData.hrUsers.map((hr: {
              id: string;
              firstName: string;
              lastName: string;
              email: string;
              createdAt: string;
              jobsPosted: number;
              hiresMade: number;
            }) => ({
              id: hr.id,
              name: `${hr.firstName} ${hr.lastName}`,
              email: hr.email,
              department: 'HR',
              createdAt: hr.createdAt,
              activeJobs: hr.jobsPosted,
              totalHires: hr.hiresMade
            }))
            setHrUsers(transformedHrUsers)
          }
        }
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
                    <ShieldCheckIcon className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
              Admin Dashboard
            </h1>
                  <p className="text-xl text-text-mid max-w-2xl mx-auto">
                    Welcome back, {session.user?.name}! Oversee the entire hiring ecosystem and manage organizational growth.
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

          {/* Enhanced Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex gap-2 mb-8 border-b border-border"
          >
            {[
              { id: 'overview', label: 'System Overview & Oversight', icon: ChartBarIcon, color: 'from-primary to-purple-600' },
              { id: 'applications', label: 'All Applications', icon: DocumentTextIcon, color: 'from-blue-500 to-blue-600' },
              { id: 'applicants', label: 'Final Approval', icon: UsersIcon, color: 'from-emerald-500 to-emerald-600' },
              { id: 'hr-management', label: 'HR Management & Requests', icon: UserPlusIcon, color: 'from-amber-500 to-amber-600' },
              { id: 'admin-management', label: 'Admin Management', icon: ShieldCheckIcon, color: 'from-red-500 to-red-600' },
              { id: 'analytics', label: 'Analytics', icon: ArrowTrendingUpIcon, color: 'from-rose-500 to-rose-600' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 border-b-2 transition-all duration-300 rounded-t-lg ${
                  activeTab === tab.id
                    ? `border-primary text-primary bg-gradient-to-r ${tab.color} bg-opacity-10`
                    : 'border-transparent text-text-mid hover:text-text-high hover:bg-bg-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-8"
            >
              {/* Enhanced Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card hover-lift">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center mr-4">
                      <DocumentTextIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-text-high">{analytics?.totalApplications || 0}</p>
                      <p className="text-text-mid">Total Applications</p>
                      <p className="text-xs text-emerald-600">+15% this month</p>
                    </div>
                  </div>
                </div>
                
                <div className="card hover-lift">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mr-4">
                      <ClockIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-text-high">{analytics?.pendingReviews || 0}</p>
                      <p className="text-text-mid">Pending Reviews</p>
                      <p className="text-xs text-amber-600">Requires attention</p>
                    </div>
                  </div>
                </div>
                
                <div className="card hover-lift">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
                      <CheckCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-text-high">{analytics?.hired || 0}</p>
                      <p className="text-text-mid">Hired</p>
                      <p className="text-xs text-emerald-600">+8 this month</p>
                    </div>
                  </div>
                </div>
                
                <div className="card hover-lift">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg flex items-center justify-center mr-4">
                      <XCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-text-high">{analytics?.rejected || 0}</p>
                      <p className="text-text-mid">Rejected</p>
                      <p className="text-xs text-rose-600">-5% this month</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Oversight Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-6"
              >
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-text-primary">System Oversight</h2>
                    <Button
                      onClick={() => router.push('/admin/oversight')}
                      className="btn-primary"
                    >
                      <ChartBarIcon className="w-4 h-4 mr-2" />
                      Open Oversight Dashboard
                    </Button>
                  </div>
                  <p className="text-text-secondary mb-6">
                    Complete system oversight with master control over all applicants, applications, HR performance, and job management.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-bg-800 p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <UsersIcon className="w-6 h-6 text-primary" />
                        <h3 className="font-semibold text-text-high">Applicant Management</h3>
                      </div>
                      <p className="text-sm text-text-mid">View all applicants with complete profiles and application history</p>
                    </div>
                    <div className="bg-bg-800 p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <DocumentTextIcon className="w-6 h-6 text-primary" />
                        <h3 className="font-semibold text-text-high">Application Control</h3>
                      </div>
                      <p className="text-sm text-text-mid">Manage all applications with status tracking and rejection controls</p>
                    </div>
                    <div className="bg-bg-800 p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <UserGroupIcon className="w-6 h-6 text-primary" />
                        <h3 className="font-semibold text-text-high">HR Performance</h3>
                      </div>
                      <p className="text-sm text-text-mid">Monitor HR team performance and review metrics</p>
                    </div>
                    <div className="bg-bg-800 p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <BriefcaseIcon className="w-6 h-6 text-primary" />
                        <h3 className="font-semibold text-text-high">Job Management</h3>
                      </div>
                      <p className="text-sm text-text-mid">Complete job control with create, update, and delete operations</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Department Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="space-y-6"
              >
                <div className="card">
                  <h2 className="text-2xl font-bold text-text-high mb-6">Department Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(analytics?.departmentStats || {}).map(([dept, stats]: [string, { applications: number; hired: number; pending: number }]) => (
                      <div key={dept} className="bg-bg-850 p-4 rounded-lg border border-border hover:shadow-medium transition-all duration-200">
                        <h3 className="font-semibold text-text-high mb-2">{dept}</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-text-mid">Applications:</span>
                            <span className="text-text-high">{stats.applications}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-mid">Hired:</span>
                            <span className="text-emerald-600">{stats.hired}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-mid">Pending:</span>
                            <span className="text-amber-600">{stats.pending}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* All Applications Tab */}
          {activeTab === 'applications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">All Applications</h2>
                  <Button
                    onClick={() => router.push('/admin/applications')}
                    className="btn-primary"
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Manage Applications
                  </Button>
                </div>
                <p className="text-text-mid mb-6">
                  View and manage all job applications across the platform. You have full access to all applications and can make hiring decisions.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-bg-850 p-4 rounded-lg border border-border">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <DocumentTextIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-text-high">{analytics?.totalApplications || 0}</p>
                        <p className="text-text-mid text-sm">Total Applications</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-bg-850 p-4 rounded-lg border border-border">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                        <ClockIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-text-high">{analytics?.pendingReviews || 0}</p>
                        <p className="text-text-mid text-sm">Pending Reviews</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-bg-850 p-4 rounded-lg border border-border">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-text-high">{analytics?.hired || 0}</p>
                        <p className="text-text-mid text-sm">Hired</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Final Approval Tab */}
          {activeTab === 'applicants' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">Final Approval</h2>
                  <Button
                    onClick={fetchAcceptedApplications}
                    variant="secondary"
                    className="btn-secondary"
                    disabled={loadingFinalApproval}
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                {loadingFinalApproval ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : acceptedApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircleIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">No Applications Pending Final Approval</h3>
                    <p className="text-text-secondary">All accepted applications have been processed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {acceptedApplications.map((application) => (
                      <div key={application.id} className="bg-bg-850 p-6 rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-text-primary">
                              {application.applicant.firstName} {application.applicant.lastName}
                            </h3>
                            <p className="text-text-secondary">{application.jobTitle}</p>
                            <p className="text-text-secondary text-sm">{application.applicant.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                              {application.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-text-primary mb-2">Application Details</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-text-secondary">Applied:</span>
                                <span className="text-text-primary">
                                  {new Date(application.submittedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-secondary">Department:</span>
                                <span className="text-text-primary">{application.job.department.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-secondary">Expected Salary:</span>
                                <span className="text-text-primary">{application.expectedSalary || 'Not specified'}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-text-primary mb-2">Interview Information</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-text-secondary">Status:</span>
                                <span className="text-emerald-600">Interview Completed</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-secondary">HR Recommendation:</span>
                                <span className="text-emerald-600">Accepted</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-secondary">Ready for:</span>
                                <span className="text-text-primary">Final Decision</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-text-primary mb-2">Skills & Experience</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-text-secondary">Experience:</span>
                                <span className="text-text-primary">{application.experience || 'Not specified'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-secondary">Education:</span>
                                <span className="text-text-primary">{application.education || 'Not specified'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-secondary">Skills:</span>
                                <span className="text-text-primary">{application.skills || 'Not specified'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3">
                          <Button
                            onClick={() => {
                              setSelectedApplicantId(application.id)
                              setShowFinalApprovalModal(true)
                            }}
                            className="btn-secondary"
                          >
                            <EyeIcon className="w-4 h-4 mr-2" />
                            View Full Profile
                          </Button>
                          <Button
                            onClick={() => {
                              if (confirm('Are you sure you want to hire this candidate?')) {
                                handleFinalHire(application.id)
                              }
                            }}
                            className="btn-primary"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                            Hire Candidate
                          </Button>
                          <Button
                            onClick={() => {
                              const defaultReason = 'This information is kept confidential and is not shared with the candidate.'
                              const reason = prompt('Please provide a reason for final rejection:', defaultReason)
                              if (reason && reason.trim()) {
                                if (confirm('Are you sure you want to reject this candidate at the final stage?')) {
                                  handleFinalReject(application.id, reason.trim())
                                }
                              } else if (reason !== null) {
                                toast.error('Rejection reason is required')
                              }
                            }}
                            className="btn-danger"
                          >
                            <XCircleIcon className="w-4 h-4 mr-2" />
                            Final Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HR Management & Requests Tab */}
          {activeTab === 'hr-management' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-2xl font-bold text-text-primary mb-6">HR Management & Requests</h2>
                
                {/* Create HR User Form */}
                <div className="bg-bg-850 p-6 rounded-lg border border-border mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Create New HR User</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleCreateHRUser({
                      firstName: formData.get('firstName') as string,
                      lastName: formData.get('lastName') as string,
                      email: formData.get('email') as string,
                      password: formData.get('password') as string,
                      department: formData.get('department') as string
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
                    <Button type="submit" className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors">
                      <UserPlusIcon className="w-4 h-4 mr-2" />
                      Create HR User
                    </Button>
                  </form>
                </div>

                {/* HR Request System */}
                <div className="bg-gradient-to-r from-violet-500/10 to-purple-600/10 p-6 rounded-lg border border-violet-500/20 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <UserGroupIcon className="w-8 h-8 text-violet-500" />
                      <h3 className="text-lg font-semibold text-text-primary">HR Request System</h3>
                      {pendingHRRequests > 0 && (
                        <div className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {pendingHRRequests} Pending
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => router.push('/admin/hr-management')}
                      className="btn-primary"
                    >
                      <UserGroupIcon className="w-4 h-4 mr-2" />
                      Manage HR Requests
                    </Button>
                  </div>
                  <p className="text-text-secondary mb-4">
                    Review and manage HR requests submitted by existing HR team members. Approve or reject requests and assign passwords to new HR users.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <UserGroupIcon className="w-6 h-6 text-violet-500" />
                      </div>
                      <p className="text-sm text-text-secondary">HR members can request new team members</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <ClockIcon className="w-6 h-6 text-amber-500" />
                      </div>
                      <p className="text-sm text-text-secondary">Admin reviews and approves requests</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <KeyIcon className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="text-sm text-text-secondary">Admin assigns passwords to new HR users</p>
                    </div>
                  </div>
                </div>

                {/* HR Users List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">Existing HR Users</h3>
                    <Button
                      onClick={() => {
                        const fetchHrUsers = async () => {
                          try {
                            // Fetch HR users
                            const hrResponse = await fetch('/api/admin/hr-performance')
                            if (hrResponse.ok) {
                              const hrData = await hrResponse.json()
                              if (hrData.hrUsers && Array.isArray(hrData.hrUsers)) {
                                const transformedHrUsers = hrData.hrUsers.map((hr: {
                                  id: string;
                                  firstName: string;
                                  lastName: string;
                                  email: string;
                                  createdAt: string;
                                  jobsPosted: number;
                                  hiresMade: number;
                                }) => ({
                                  id: hr.id,
                                  name: `${hr.firstName} ${hr.lastName}`,
                                  email: hr.email,
                                  department: 'HR',
                                  createdAt: hr.createdAt,
                                  activeJobs: hr.jobsPosted,
                                  totalHires: hr.hiresMade
                                }))
                                setHrUsers(transformedHrUsers)
                              }
                            }

                            // Fetch pending HR requests count
                            const hrRequestsResponse = await fetch('/api/hr-requests')
                            if (hrRequestsResponse.ok) {
                              const hrRequestsData = await hrRequestsResponse.json()
                              if (hrRequestsData.requests && Array.isArray(hrRequestsData.requests)) {
                                const pendingCount = hrRequestsData.requests.filter((request: { status: string }) => 
                                  request.status === 'PENDING'
                                ).length
                                setPendingHRRequests(pendingCount)
                              }
                            }

                            toast.success('HR data refreshed')
                          } catch {
                            toast.error('Failed to refresh HR data')
                          }
                        }
                        fetchHrUsers()
                      }}
                      className="bg-bg-800 hover:bg-bg-850 text-text-high px-3 py-2 rounded-lg font-medium transition-colors border border-border"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  
                  {hrUsers.length === 0 ? (
                    <div className="bg-bg-850 p-8 rounded-lg border border-border text-center">
                      <UserGroupIcon className="w-12 h-12 text-text-mid mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-text-primary mb-2">No HR Users Found</h3>
                      <p className="text-text-secondary">Create your first HR user using the form above.</p>
                    </div>
                  ) : (
                    hrUsers.map((hrUser) => (
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
                              <Button className="bg-bg-800 hover:bg-bg-850 text-text-high px-3 py-2 rounded-lg font-medium transition-colors border border-border">
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                              <Button className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg font-medium transition-colors">
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}


          {/* Admin Management Tab */}
          {activeTab === 'admin-management' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">Admin Management</h2>
                  <Button
                    onClick={() => router.push('/admin/admin-management')}
                    className="btn-primary"
                  >
                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                    Manage Admins
                  </Button>
                </div>
                <p className="text-text-secondary mb-6">
                  Create and manage system administrators. Add new admins, edit existing admin accounts, and maintain system security.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-bg-800 p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheckIcon className="w-6 h-6 text-primary" />
                      <h3 className="font-semibold text-text-high">System Access</h3>
                    </div>
                    <p className="text-sm text-text-mid">Full system access and control</p>
                  </div>
                  <div className="bg-bg-800 p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <UserPlusIcon className="w-6 h-6 text-primary" />
                      <h3 className="font-semibold text-text-high">User Management</h3>
                    </div>
                    <p className="text-sm text-text-mid">Create and manage user accounts</p>
                  </div>
                  <div className="bg-bg-800 p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <KeyIcon className="w-6 h-6 text-primary" />
                      <h3 className="font-semibold text-text-high">Security Control</h3>
                    </div>
                    <p className="text-sm text-text-mid">Manage system security settings</p>
                  </div>
                </div>

                {/* Existing Admins List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">Existing Administrators</h3>
                    <Button
                      onClick={() => {
                        const fetchAdmins = async () => {
                          try {
                            const adminsResponse = await fetch('/api/admin/admins')
                            if (adminsResponse.ok) {
                              const adminsData = await adminsResponse.json()
                              if (adminsData.admins && Array.isArray(adminsData.admins)) {
                                const transformedAdmins = adminsData.admins.map((admin: {
                                  id: string;
                                  firstName: string;
                                  lastName: string;
                                  email: string;
                                  createdAt: string;
                                  isActive: boolean;
                                }) => ({
                                  id: admin.id,
                                  name: `${admin.firstName} ${admin.lastName}`,
                                  email: admin.email,
                                  createdAt: admin.createdAt,
                                  isActive: admin.isActive
                                }))
                                setAdminUsers(transformedAdmins)
                                toast.success('Admin list refreshed')
                              }
                            }
                          } catch {
                            toast.error('Failed to refresh admin list')
                          }
                        }
                        fetchAdmins()
                      }}
                      className="bg-bg-800 hover:bg-bg-850 text-text-high px-3 py-2 rounded-lg font-medium transition-colors border border-border"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  
                  {adminUsers.length === 0 ? (
                    <div className="bg-bg-850 p-8 rounded-lg border border-border text-center">
                      <ShieldCheckIcon className="w-12 h-12 text-text-mid mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-text-primary mb-2">No Administrators Found</h3>
                      <p className="text-text-secondary">No admin users are currently registered in the system.</p>
                    </div>
                  ) : (
                    adminUsers.map((admin) => (
                      <div key={admin.id} className="bg-bg-850 p-4 rounded-lg border border-border">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-text-primary">{admin.name}</h3>
                            <p className="text-text-secondary text-sm">{admin.email}</p>
                            <p className="text-text-secondary text-sm">
                              Created: {new Date(admin.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                admin.isActive 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-rose-100 text-rose-700'
                              }`}>
                                {admin.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button className="bg-bg-800 hover:bg-bg-850 text-text-high px-3 py-2 rounded-lg font-medium transition-colors border border-border">
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                              <Button className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg font-medium transition-colors">
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                        <span className="text-emerald-600 font-semibold">5 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Longest Process:</span>
                        <span className="text-amber-600 font-semibold">45 days</span>
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
                  <Button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Export Analytics Report
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Final Approval Modal */}
      {selectedApplicantId && (
        <FinalApprovalModal
          isOpen={showFinalApprovalModal}
          onClose={handleCloseFinalApprovalModal}
          applicationId={selectedApplicantId}
          onFinalDecision={handleFinalDecision}
        />
      )}
    </div>
  )
}
