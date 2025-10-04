'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import CountryCodeSelector from '@/components/ui/CountryCodeSelector'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { validateEmail, validatePhone } from '@/lib/utils'
import { getSession, signOut } from 'next-auth/react'
import { ArrowRightOnRectangleIcon, ArrowLeftIcon, UserIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    countryCode: '+91',
    linkedinProfile: ''
  })
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateField = async (name: string, value: string) => {
    setIsValidating(true)
    const errors: Record<string, string> = {}

    switch (name) {
      case 'email':
        if (value && !validateEmail(value)) {
          errors.email = 'Please enter a valid email address'
        } else if (value) {
          // Check if email already exists
          try {
            const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(value)}`)
            if (response.ok) {
              const data = await response.json()
              if (data.exists) {
                errors.email = 'This email is already registered'
              }
            }
          } catch (error) {
            console.error('Error checking email:', error)
          }
        }
        break
      case 'phoneNumber':
        if (value && !validatePhone(value)) {
          errors.phoneNumber = 'Please enter a valid phone number'
        }
        break
      case 'password':
        if (value && value.length < 8) {
          errors.password = 'Password must be at least 8 characters long'
        }
        break
      case 'confirmPassword':
        if (value && value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match'
        }
        break
    }

    setValidationErrors(prev => ({ ...prev, ...errors }))
    setIsValidating(false)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number'
    }


    setValidationErrors(errors)
    return Object.keys(errors).length === 0
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
        toast.success('Registration successful! You can now log in to your account.')
        router.push('/login')
      } else {
        toast.error(data.message || 'Registration failed')
      }
    } catch {
      toast.error('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-850 flex items-center justify-center px-4 py-8">
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
        className="w-full max-w-2xl"
      >
        <div className="bg-bg-800 rounded-2xl shadow-large p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-high mb-2">
              {isLoggedIn ? 'Already Have Account' : 'Create Your Account'}
            </h1>
            <p className="text-text-mid">
              {isLoggedIn ? 'You already have an account' : 'Join the amealio team and start your journey with us'}
            </p>
          </div>

          {isLoggedIn && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-700 text-center mb-4">
                You already have an account and are logged in.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => router.push('/applicant/dashboard')}
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
            {/* Applicant Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-800">Applicant Account</h3>
                  <p className="text-sm text-blue-600">You are registering as a job applicant</p>
                </div>
              </div>
            </div>

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
                  className={`input-field ${validationErrors.firstName ? 'border-red-500' : ''}`}
                />
                {validationErrors.firstName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    {validationErrors.firstName}
                  </p>
                )}
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
                  className={`input-field ${validationErrors.lastName ? 'border-red-500' : ''}`}
                />
                {validationErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    {validationErrors.lastName}
                  </p>
                )}
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
                onBlur={(e) => validateField('email', e.target.value)}
                placeholder="Enter your email address"
                required
                className={`input-field ${validationErrors.email ? 'border-red-500' : ''}`}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  {validationErrors.email}
                </p>
              )}
              {formData.email && !validationErrors.email && (
                <p className="text-green-500 text-sm mt-1 flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Email is available
                </p>
              )}
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
                  onBlur={(e) => validateField('password', e.target.value)}
                  placeholder="Create a password"
                  required
                  className={`input-field ${validationErrors.password ? 'border-red-500' : ''}`}
                />
                {validationErrors.password ? (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    {validationErrors.password}
                  </p>
                ) : (
                  <p className="text-xs text-text-mid mt-1">
                    Must be at least 8 characters long
                  </p>
                )}
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
                  onBlur={(e) => validateField('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className={`input-field ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    {validationErrors.confirmPassword}
                  </p>
                )}
                {formData.confirmPassword && !validationErrors.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-green-500 text-sm mt-1 flex items-center">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Passwords match
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="form-label">
                Phone Number
              </label>
              <div className="flex gap-2">
                <CountryCodeSelector
                  value={formData.countryCode}
                  onChange={(value) => setFormData(prev => ({ ...prev, countryCode: value }))}
                  className="w-32.5"
                  allowTyping={true}
                />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onBlur={(e) => validateField('phoneNumber', e.target.value)}
                  placeholder="1234567890"
                  className={`input-field flex-1 ${validationErrors.phoneNumber ? 'border-red-500' : ''}`}
                />
              </div>
              {validationErrors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  {validationErrors.phoneNumber}
                </p>
              )}
              {formData.phoneNumber && formData.phoneNumber.replace(/\D/g, '').length !== 10 && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  Contact number must be exactly 10 digits only.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="linkedinProfile" className="form-label">
                LinkedIn Profile
              </label>
              <Input
                id="linkedinProfile"
                name="linkedinProfile"
                type="url"
                value={formData.linkedinProfile}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
                className="input-field"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                required
                className="rounded border-border text-primary focus:ring-primary/20"
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
