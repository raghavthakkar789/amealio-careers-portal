'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

import { HRRequest, HRUser } from '@/types/admin'

export default function AdminHRManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hrRequests, setHrRequests] = useState<HRRequest[]>([])
  const [hrUsers, setHrUsers] = useState<HRUser[]>([])
  const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<HRUser | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchHRRequests()
    fetchHRUsers()
  }, [session, status, router])

  const fetchHRRequests = async () => {
    try {
      const response = await fetch('/api/hr-requests')
      if (response.ok) {
        const data = await response.json()
        setHrRequests(data.requests)
      } else {
        toast.error('Failed to fetch HR requests')
      }
    } catch (error) {
      console.error('Error fetching HR requests:', error)
      toast.error('Failed to fetch HR requests')
    }
  }

  const fetchHRUsers = async () => {
    try {
      const response = await fetch('/api/admin/hr-users')
      if (response.ok) {
        const data = await response.json()
        setHrUsers(data.users)
      } else {
        toast.error('Failed to fetch HR users')
      }
    } catch (error) {
      console.error('Error fetching HR users:', error)
      toast.error('Failed to fetch HR users')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: string, password: string) => {
    try {
      const response = await fetch(`/api/hr-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'APPROVE',
          password: password
        }),
      })

      if (response.ok) {
        toast.success('HR request approved successfully!')
        fetchHRRequests()
        fetchHRUsers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to approve request')
      }
    } catch (error) {
      toast.error('Failed to approve request')
      console.error('Error approving request:', error)
    }
  }

  const handleRejectRequest = async (requestId: string, reason: string) => {
    try {
      const response = await fetch(`/api/hr-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'REJECT',
          rejectionReason: reason
        }),
      })

      if (response.ok) {
        toast.success('HR request rejected successfully!')
        fetchHRRequests()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to reject request')
      }
    } catch (error) {
      toast.error('Failed to reject request')
      console.error('Error rejecting request:', error)
    }
  }

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword.trim()) {
      toast.error('Please enter a valid password')
      return
    }

    try {
      const response = await fetch(`/api/admin/hr-users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newPassword
        }),
      })

      if (response.ok) {
        toast.success('Password updated successfully!')
        setShowPasswordModal(false)
        setNewPassword('')
        setSelectedUser(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update password')
      }
    } catch (error) {
      toast.error('Failed to update password')
      console.error('Error updating password:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
      case 'APPROVED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Approved</span>
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Rejected</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-850">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') {
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
                onClick={() => router.push('/admin/dashboard')}
                variant="secondary"
                className="btn-secondary"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-text-high">HR Management</h1>
                <p className="text-text-mid">Manage HR requests and user accounts</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card mb-6">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'requests'
                    ? 'bg-primary text-white'
                    : 'text-text-mid hover:text-text-high'
                }`}
              >
                <ClockIcon className="w-4 h-4 inline mr-2" />
                HR Requests ({hrRequests.filter(r => r.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-primary text-white'
                    : 'text-text-mid hover:text-text-high'
                }`}
              >
                <UserGroupIcon className="w-4 h-4 inline mr-2" />
                HR Users ({hrUsers.length})
              </button>
            </div>
          </div>

          {/* HR Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {hrRequests.length === 0 ? (
                <div className="card text-center py-12">
                  <UserGroupIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-high mb-2">
                    No HR Requests
                  </h3>
                  <p className="text-text-mid">
                    No HR requests have been submitted yet.
                  </p>
                </div>
              ) : (
                hrRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-text-high">
                              {request.firstName} {request.lastName}
                            </h3>
                            <p className="text-text-mid">{request.email}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {request.phoneNumber && (
                            <div>
                              <p className="text-sm text-text-mid">Phone</p>
                              <p className="font-medium text-text-high flex items-center gap-1">
                                <PhoneIcon className="w-4 h-4" />
                                {request.phoneNumber}
                              </p>
                            </div>
                          )}
                          {request.department && (
                            <div>
                              <p className="text-sm text-text-mid">Department</p>
                              <p className="font-medium text-text-high flex items-center gap-1">
                                <BuildingOfficeIcon className="w-4 h-4" />
                                {request.department}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-text-mid">Requested By</p>
                            <p className="font-medium text-text-high">
                              {request.requestedByName}
                            </p>
                          </div>
                        </div>

                        {request.reason && (
                          <div className="mb-4">
                            <p className="text-sm text-text-mid mb-2">Reason</p>
                            <p className="text-text-high bg-bg-800 p-3 rounded-lg">
                              {request.reason}
                            </p>
                          </div>
                        )}

                        <div className="text-sm text-text-mid">
                          <p>Requested: {new Date(request.createdAt).toLocaleDateString()}</p>
                          {request.approvedAt && (
                            <p>Processed: {new Date(request.approvedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>

                      {request.status === 'PENDING' && (
                        <div className="flex flex-col gap-2 ml-4">
                          <HRRequestApprovalForm
                            request={request}
                            onApprove={handleApproveRequest}
                            onReject={handleRejectRequest}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* HR Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {hrUsers.length === 0 ? (
                <div className="card text-center py-12">
                  <UserGroupIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-high mb-2">
                    No HR Users
                  </h3>
                  <p className="text-text-mid">
                    No HR users have been created yet.
                  </p>
                </div>
              ) : (
                hrUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-text-high">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-text-mid flex items-center gap-1">
                            <EnvelopeIcon className="w-4 h-4" />
                            {user.email}
                          </p>
                          {user.phoneNumber && (
                            <p className="text-text-mid flex items-center gap-1">
                              <PhoneIcon className="w-4 h-4" />
                              {user.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-text-mid">Created</p>
                          <p className="font-medium text-text-high">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                          <p className={`text-xs ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        
                        <Button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowPasswordModal(true)
                          }}
                          variant="secondary"
                          className="btn-secondary"
                        >
                          <KeyIcon className="w-4 h-4 mr-2" />
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-800 rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-high">
                Change Password
              </h2>
              <Button
                onClick={() => {
                  setShowPasswordModal(false)
                  setSelectedUser(null)
                  setNewPassword('')
                }}
                variant="secondary"
                className="btn-secondary"
              >
                ×
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-text-mid mb-2">
                Setting new password for: <span className="font-semibold text-text-high">{selectedUser.firstName} {selectedUser.lastName}</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="form-label">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-mid hover:text-text-high"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleChangePassword}
                className="btn-primary flex-1"
                disabled={!newPassword.trim()}
              >
                Update Password
              </Button>
              <Button
                onClick={() => {
                  setShowPasswordModal(false)
                  setSelectedUser(null)
                  setNewPassword('')
                }}
                variant="secondary"
                className="btn-secondary flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Component for HR Request Approval Form
function HRRequestApprovalForm({ 
  request, 
  onApprove, 
  onReject 
}: { 
  request: HRRequest
  onApprove: (id: string, password: string) => void
  onReject: (id: string, reason: string) => void
}) {
  const [showApprovalForm, setShowApprovalForm] = useState(false)
  const [showRejectionForm, setShowRejectionForm] = useState(false)
  const [password, setPassword] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const handleApprove = () => {
    if (!password.trim()) {
      toast.error('Please enter a password')
      return
    }
    onApprove(request.id, password)
    setShowApprovalForm(false)
    setPassword('')
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason')
      return
    }
    onReject(request.id, rejectionReason)
    setShowRejectionForm(false)
    setRejectionReason('')
  }

  if (showApprovalForm) {
    return (
      <div className="space-y-3">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password for new HR"
          className="input-field"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleApprove}
            className="btn-primary flex-1"
            disabled={!password.trim()}
          >
            <CheckCircleIcon className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button
            onClick={() => {
              setShowApprovalForm(false)
              setPassword('')
            }}
            variant="secondary"
            className="btn-secondary flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  if (showRejectionForm) {
    return (
      <div className="space-y-3">
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Enter rejection reason"
          className="input-field"
          rows={3}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleReject}
            className="btn-secondary flex-1 text-red-600 hover:text-red-700"
            disabled={!rejectionReason.trim()}
          >
            <XCircleIcon className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button
            onClick={() => {
              setShowRejectionForm(false)
              setRejectionReason('')
            }}
            variant="secondary"
            className="btn-secondary flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => setShowApprovalForm(true)}
        className="btn-primary"
      >
        <CheckCircleIcon className="w-4 h-4 mr-2" />
        Approve
      </Button>
      <Button
        onClick={() => setShowRejectionForm(true)}
        variant="secondary"
        className="btn-secondary text-red-600 hover:text-red-700"
      >
        <XCircleIcon className="w-4 h-4 mr-2" />
        Reject
      </Button>
    </div>
  )
}
