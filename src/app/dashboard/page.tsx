'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Redirect based on role
    if (session.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else if (session.user?.role === 'HR') {
      router.push('/hr/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              Welcome, {session.user?.name}!
            </h1>
            <p className="text-xl text-text-secondary">
              Manage your job applications and track your progress
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                My Applications
              </h3>
              <p className="text-text-secondary mb-4">
                View and manage all your job applications
              </p>
              <Button
                onClick={() => router.push('/applications')}
                className="btn-primary w-full"
              >
                View Applications
              </Button>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Available Jobs
              </h3>
              <p className="text-text-secondary mb-4">
                Browse open positions and apply
              </p>
              <Button
                onClick={() => router.push('/jobs')}
                className="btn-primary w-full"
              >
                Browse Jobs
              </Button>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                My Profile
              </h3>
              <p className="text-text-secondary mb-4">
                Update your personal information
              </p>
              <Button
                onClick={() => router.push('/profile')}
                className="btn-primary w-full"
              >
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-text-primary">
                    Application Submitted
                  </h4>
                  <p className="text-text-secondary">
                    Senior Software Engineer - 2 days ago
                  </p>
                </div>
                <span className="status-badge status-pending">
                  Pending Review
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-text-primary">
                    Interview Scheduled
                  </h4>
                  <p className="text-text-secondary">
                    Product Manager - 1 week ago
                  </p>
                </div>
                <span className="status-badge status-review">
                  Scheduled
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
