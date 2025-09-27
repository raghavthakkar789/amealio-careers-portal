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
  UserPlusIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Admin {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

export default function AdminManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    
    fetchAdmins()
  }, [session, status, router])

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/admins')
      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins)
      } else {
        toast.error('Failed to fetch admins')
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
      toast.error('Failed to fetch admins')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    try {
      const url = editingAdmin ? `/api/admin/admins/${editingAdmin.id}` : '/api/admin/admins'
      const method = editingAdmin ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: 'ADMIN'
        }),
      })

      if (response.ok) {
        toast.success(editingAdmin ? 'Admin updated successfully' : 'Admin created successfully')
        setShowAddForm(false)
        setEditingAdmin(null)
        resetForm()
        fetchAdmins()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save admin')
      }
    } catch (error) {
      console.error('Error saving admin:', error)
      toast.error('Failed to save admin')
    }
  }

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setFormData({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      password: '',
      confirmPassword: ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return

    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Admin deleted successfully')
        fetchAdmins()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete admin')
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
      toast.error('Failed to delete admin')
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    setShowPassword(false)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingAdmin(null)
    resetForm()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-850">
        <LoadingSpinner size="lg" />
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
                <h1 className="text-3xl font-bold text-text-high">Admin Management</h1>
                <p className="text-text-mid">Manage system administrators</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-high">
                  {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
                </h2>
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  className="btn-secondary"
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-high mb-2">
                      First Name
                    </label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-high mb-2">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-high mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-high mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingAdmin}
                      placeholder={editingAdmin ? 'Leave blank to keep current password' : 'Enter password'}
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

                {!editingAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-text-high mb-2">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required={!editingAdmin}
                      placeholder="Confirm password"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="btn-primary"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {editingAdmin ? 'Update Admin' : 'Create Admin'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="secondary"
                    className="btn-secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Admins List */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheckIcon className="w-6 h-6 text-text-high" />
              <h2 className="text-xl font-semibold text-text-high">System Administrators</h2>
            </div>

            {admins.length === 0 ? (
              <div className="text-center py-12">
                <ShieldCheckIcon className="w-16 h-16 text-text-mid mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-high mb-2">No Admins Found</h3>
                <p className="text-text-mid">No administrators have been added yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-text-high">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-text-high">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-text-high">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-text-high">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-text-high">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin, index) => (
                      <motion.tr
                        key={admin.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="border-b border-border hover:bg-bg-800 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <ShieldCheckIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-text-high">
                                {admin.firstName} {admin.lastName}
                              </p>
                              <p className="text-sm text-text-mid">Admin</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-text-high">{admin.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            admin.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-text-mid">
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEdit(admin)}
                              variant="secondary"
                              className="btn-secondary text-xs px-2 py-1"
                            >
                              <PencilIcon className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            {admin.id !== session?.user?.id && (
                              <Button
                                onClick={() => handleDelete(admin.id)}
                                variant="secondary"
                                className="btn-secondary text-xs px-2 py-1 text-red-600 hover:text-red-700"
                              >
                                <TrashIcon className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
