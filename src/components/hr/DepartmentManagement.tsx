'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Department {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    jobs: number
  }
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments)
      } else {
        toast.error('Failed to fetch departments')
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      toast.error('Failed to fetch departments')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setDepartments(prev => [...prev, data.department])
        toast.success('Department created successfully!')
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create department')
      }
    } catch (error) {
      console.error('Error creating department:', error)
      toast.error('Failed to create department')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDepartment) return

    setFormLoading(true)

    try {
      const response = await fetch(`/api/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setDepartments(prev => 
          prev.map(dept => 
            dept.id === editingDepartment.id ? data.department : dept
          )
        )
        toast.success('Department updated successfully!')
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update department')
      }
    } catch (error) {
      console.error('Error updating department:', error)
      toast.error('Failed to update department')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteDepartment = async (department: Department) => {
    if (department._count?.jobs > 0) {
      toast.error(`Cannot delete department with ${department._count.jobs} active job(s). Please close or reassign all jobs first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete "${department.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/departments/${department.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDepartments(prev => prev.filter(dept => dept.id !== department.id))
        toast.success('Department deleted successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete department')
      }
    } catch (error) {
      console.error('Error deleting department:', error)
      toast.error('Failed to delete department')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    })
    setShowCreateForm(false)
    setEditingDepartment(null)
  }

  const startEdit = (department: Department) => {
    setFormData({
      name: department.name,
      description: department.description || '',
      isActive: department.isActive
    })
    setEditingDepartment(department)
    setShowCreateForm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-text-high mb-2">
            Department Management
          </h2>
          <p className="text-text-mid">
            Manage departments and ensure proper job categorization
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary hover-glow"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Departments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <motion.div
            key={department.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card hover-lift"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-high">
                    {department.name}
                  </h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    department.isActive 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {department.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(department)}
                  className="p-2 text-text-mid hover:text-primary transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteDepartment(department)}
                  className={`p-2 transition-colors ${
                    department._count?.jobs > 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-text-mid hover:text-red-500'
                  }`}
                  disabled={department._count?.jobs > 0}
                  title={
                    department._count?.jobs > 0
                      ? `Cannot delete: ${department._count.jobs} active job(s)`
                      : 'Delete department'
                  }
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {department.description && (
              <p className="text-text-mid text-sm mb-4">
                {department.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-text-mid text-sm">Active Jobs:</span>
                <span className={`font-semibold ${
                  department._count?.jobs > 0 ? 'text-emerald-600' : 'text-text-mid'
                }`}>
                  {department._count?.jobs || 0}
                </span>
              </div>
              {department._count?.jobs > 0 && (
                <div className="flex items-center gap-1 text-amber-600">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span className="text-xs">Protected</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                {editingDepartment ? 'Edit Department' : 'Create New Department'}
              </h2>

              <form onSubmit={editingDepartment ? handleUpdateDepartment : handleCreateDepartment} className="space-y-6">
                <div>
                  <label className="form-label">Department Name *</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="input-field"
                    placeholder="e.g., Engineering, Marketing, Sales"
                  />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field"
                    rows={3}
                    placeholder="Brief description of the department..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-text-primary">
                    Active Department
                  </label>
                </div>

                <div className="flex gap-4 pt-6 border-t border-border">
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="btn-primary flex-1"
                  >
                    {formLoading ? 'Saving...' : (editingDepartment ? 'Update Department' : 'Create Department')}
                  </Button>
                  <Button
                    type="button"
                    onClick={resetForm}
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
    </div>
  )
}
