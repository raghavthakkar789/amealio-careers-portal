'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeftIcon, 
  MapPinIcon, 
  ClockIcon, 
  BriefcaseIcon,
  CheckCircleIcon,
  StarIcon,
  UsersIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface JobDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function JobDetailsPage({ params }: JobDetailsPageProps) {
  const resolvedParams = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<any>(null)

  // Fetch job details from API
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${resolvedParams.id}`)
        if (response.ok) {
          const jobData = await response.json()
          setJob(jobData)
        } else {
          toast.error('Job not found')
          router.push('/jobs')
        }
      } catch (error) {
        toast.error('Failed to load job details')
        console.error('Error fetching job:', error)
        router.push('/jobs')
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [resolvedParams.id, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Job Not Found</h2>
          <Button onClick={() => router.push('/jobs')} className="btn-primary">
            Back to Jobs
          </Button>
        </div>
      </div>
    )
  }

  const handleApply = () => {
    if (!session) {
      router.push('/login')
      return
    }
    router.push(`/jobs/${job.id}/apply`)
  }

  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false)

  // Calculate deadline status on client side to avoid hydration mismatch
  useEffect(() => {
    if (job?.applicationDeadline) {
      const now = new Date()
      const deadline = new Date(job.applicationDeadline)
      setIsDeadlinePassed(deadline < now)
    }
  }, [job?.applicationDeadline])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => router.back()}
              className="btn-secondary mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-text-primary mb-2">
                  {job.title}
                </h1>
                <div className="flex items-center gap-4 text-text-secondary">
                  <span className="flex items-center">
                    <BriefcaseIcon className="w-4 h-4 mr-1" />
                    {job.department}
                  </span>
                  <span className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {job.location}
                    {job.remoteWork && ' (Remote)'}
                  </span>
                  <span className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleApply}
                  disabled={isDeadlinePassed}
                  className="btn-primary"
                >
                  {isDeadlinePassed ? 'Application Closed' : 'Apply Now'}
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Job link copied to clipboard!')
                  }}
                  className="btn-secondary"
                >
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Application Deadline Alert */}
          {job.applicationDeadline && (
            <div className={`card mb-8 ${isDeadlinePassed ? 'bg-error-bg border-error-text' : 'bg-warning-bg border-warning-text'}`}>
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                <span className={`font-medium ${isDeadlinePassed ? 'text-error-text' : 'text-warning-text'}`}>
                  {isDeadlinePassed 
                    ? `Application deadline passed: ${new Date(job.applicationDeadline).toLocaleDateString()}`
                    : `Application deadline: ${new Date(job.applicationDeadline).toLocaleDateString()}`
                  }
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Summary */}
              <div className="card">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Job Summary</h2>
                <p className="text-text-secondary leading-relaxed">{job.summary}</p>
              </div>

              {/* Job Description */}
              <div className="card">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Job Description</h2>
                <div className="text-text-secondary leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>

              {/* Responsibilities */}
              <div className="card">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Key Responsibilities</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((responsibility: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-text-secondary">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="card">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((requirement: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <StarIcon className="w-5 h-5 text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-text-secondary">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="card">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Benefits & Perks</h2>
                <ul className="space-y-3">
                  {job.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <StarIcon className="w-5 h-5 text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-text-secondary">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Job Details Card */}
                <div className="card">
                  <h3 className="text-xl font-semibold text-text-primary mb-4">Job Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <BriefcaseIcon className="w-5 h-5 text-primary-400 mr-3" />
                      <div>
                        <p className="text-text-secondary text-sm">Employment Type</p>
                        <p className="text-text-primary font-medium">
                          {job.employmentTypes.map((type: string) => type.replace('_', ' ')).join(', ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPinIcon className="w-5 h-5 text-primary-400 mr-3" />
                      <div>
                        <p className="text-text-secondary text-sm">Location</p>
                        <p className="text-text-primary font-medium">
                          {job.location}
                          {job.remoteWork && ' (Remote Available)'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <ClockIcon className="w-5 h-5 text-primary-400 mr-3" />
                      <div>
                        <p className="text-text-secondary text-sm">Posted</p>
                        <p className="text-text-primary font-medium">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Required Skills */}
                <div className="card">
                  <h3 className="text-xl font-semibold text-text-primary mb-4">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-md border border-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hiring Manager */}
                <div className="card">
                  <h3 className="text-xl font-semibold text-text-primary mb-4">Hiring Manager</h3>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                      <UsersIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      {job.createdBy ? (
                        <>
                          <p className="text-text-primary font-medium">
                            {job.createdBy.firstName} {job.createdBy.lastName}
                          </p>
                          <p className="text-text-secondary text-sm">{job.createdBy.email}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-text-primary font-medium">HR Team</p>
                          <p className="text-text-secondary text-sm">hr@amealio.com</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="card">
                  <Button
                    onClick={handleApply}
                    disabled={isDeadlinePassed}
                    className="btn-primary w-full"
                  >
                    {isDeadlinePassed ? 'Application Closed' : 'Apply for this Job'}
                  </Button>
                  {!session && (
                    <p className="text-text-secondary text-sm mt-2 text-center">
                      You need to be logged in to apply
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
