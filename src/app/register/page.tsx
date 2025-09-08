'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { validateEmail, validatePhone, calculateAge } from '@/lib/utils'
import { getSession, signOut } from 'next-auth/react'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
  })
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('First and last name are required')
      return false
    }

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address')
      return false
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }

    if (formData.dateOfBirth) {
      const age = calculateAge(new Date(formData.dateOfBirth))
      if (age < 18) {
        toast.error('You must be at least 18 years old to register')
        return false
      }
    }

    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      toast.error('Please enter a valid phone number')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Registration successful! Please check your email to verify your account.')
        router.push('/login')
      } else {
        toast.error(data.message || 'Registration failed')
      }
    } catch (error) {
      toast.error('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-purple-900 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-bg-800 rounded-2xl shadow-2xl p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-high mb-2">
              {isLoggedIn ? 'Already Have Account' : 'Create Your Account'}
            </h1>
            <p className="text-text-mid">
              {isLoggedIn ? 'You already have an account' : 'Join the amealio team and start your journey with us'}
            </p>
          </div>

          {isLoggedIn && (
            <div className="mb-6 p-4 bg-success-bg border border-success-text rounded-lg">
              <p className="text-success-text text-center mb-4">
                You already have an account and are logged in.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => router.push('/dashboard')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  className="input-field"
                />
                <p className="text-xs text-text-mid mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password *
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dateOfBirth" className="form-label">
                  Date of Birth *
                </label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="form-label">
                Address *
              </label>
              <Input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your full address"
                required
                className="input-field"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                required
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-text-mid">
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="text-link hover:text-link-hover"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-link hover:text-link-hover"
                >
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-text-mid">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-link hover:text-link-hover font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
