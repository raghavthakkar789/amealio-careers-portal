'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
  fallbackUrl?: string
}

export function AuthGuard({ 
  children, 
  requiredRole, 
  fallbackUrl = '/login' 
}: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated || status === 'loading') return

    if (!session) {
      router.push(fallbackUrl)
      return
    }

    if (requiredRole && session.user?.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      if (session.user?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else if (session.user?.role === 'HR') {
        router.push('/hr/dashboard')
      } else {
        router.push('/dashboard')
      }
      return
    }
  }, [session, status, router, requiredRole, fallbackUrl, isHydrated])

  if (!isHydrated || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-850 via-bg-900 to-bg-850">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (requiredRole && session.user?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
