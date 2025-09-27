'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { ArrowRightOnRectangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      setIsLoggedIn(!!session)
    }
    checkSession()
  }, [])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    setIsLoggedIn(false)
    toast.success('Logged out successfully')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid email or password')
      } else {
        const session = await getSession()
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else if (session?.user?.role === 'HR') {
          router.push('/hr/dashboard')
        } else {
          router.push('/applicant/dashboard')
        }
        setIsLoggedIn(true)
        toast.success('Login successful!')
      }
    } catch {
      toast.error('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-850 flex items-center justify-center px-4">
      {/* Back to Dashboard Button */}
      <div className="absolute top-4 left-4">
        <Button
          onClick={() => {
            if (!isLoggedIn) {
              router.push('/')
              return
            }
            
            // Redirect based on user role if logged in
            getSession().then(session => {
              if (session?.user?.role === 'ADMIN') {
                router.push('/admin/dashboard')
              } else if (session?.user?.role === 'HR') {
                router.push('/hr/dashboard')
              } else {
                router.push('/applicant/dashboard')
              }
            })
          }}
          className="btn-secondary"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-bg-800 rounded-2xl shadow-large p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-high mb-2">
              {isLoggedIn ? 'Already Logged In' : 'Welcome Back'}
            </h1>
            <p className="text-text-mid">
              {isLoggedIn ? 'You are currently logged in' : 'Sign in to your amealio account'}
            </p>
          </div>

          {isLoggedIn && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-700 text-center mb-4">
                You are already logged in to your account.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={async () => {
                    // Redirect based on user role
                    const session = await getSession()
                    if (session?.user?.role === 'ADMIN') {
                      router.push('/admin/dashboard')
                    } else if (session?.user?.role === 'HR') {
                      router.push('/hr/dashboard')
                    } else {
                      router.push('/applicant/dashboard')
                    }
                  }}
                  className="btn-primary"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="input-field"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="ml-2 text-sm text-text-mid">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-link hover:text-link-hover"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-text-mid">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-link hover:text-link-hover font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-text-mid mb-4">
                Demo Accounts (Click to auto-fill):
              </p>
              <div className="space-y-2 text-xs text-text-mid">
                <button
                  onClick={() => {
                    setEmail('admin@amealio.com')
                    setPassword('admin123')
                  }}
                  className="block w-full p-2 bg-bg-850 hover:bg-bg-900 rounded border border-border transition-colors hover:border-primary/50"
                  suppressHydrationWarning
                >
                  <strong>Admin:</strong> admin@amealio.com / admin123
                </button>
                <button
                  onClick={() => {
                    setEmail('hr@amealio.com')
                    setPassword('hr123')
                  }}
                  className="block w-full p-2 bg-bg-850 hover:bg-bg-900 rounded border border-border transition-colors hover:border-primary/50"
                  suppressHydrationWarning
                >
                  <strong>HR:</strong> hr@amealio.com / hr123
                </button>
                <button
                  onClick={() => {
                    setEmail('user@amealio.com')
                    setPassword('user123')
                  }}
                  className="block w-full p-2 bg-bg-850 hover:bg-bg-900 rounded border border-border transition-colors hover:border-primary/50"
                  suppressHydrationWarning
                >
                  <strong>Applicant:</strong> user@amealio.com / user123
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
