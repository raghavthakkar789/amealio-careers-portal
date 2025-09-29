'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { JobCard } from '@/components/cards/JobCard'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  title: string
  department: string
  employmentTypes: string[]
  applicationDeadline?: string
  requiredSkills: string[]
  summary?: string
  location?: string
  remoteWork?: boolean
  createdAt: string
}

export function JobListingsSection() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleJobs, setVisibleJobs] = useState(6)
  const router = useRouter()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs')
        if (response.ok) {
          const data = await response.json()
          // Transform the data to match the expected interface
          const transformedJobs = data.jobs.map((job: {
            id: string
            title: string
            department?: { name: string }
            employmentTypes: string[]
            jobDescription?: { location?: string; remoteWork?: boolean }
            createdAt: string
            requiredSkills?: string[]
            summary?: string
            applicationDeadline?: string
          }) => ({
            id: job.id,
            title: job.title,
            department: job.department?.name || 'Unknown',
            employmentTypes: job.employmentTypes || [],
            location: job.jobDescription?.location || 'Not specified',
            remoteWork: job.jobDescription?.remoteWork || false,
            createdAt: job.createdAt,
            requiredSkills: job.requiredSkills || [],
            summary: job.summary || '',
            applicationDeadline: job.applicationDeadline
          }))
          setJobs(transformedJobs)
        } else {
          console.error('Failed to fetch jobs')
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const loadMoreJobs = () => {
    setVisibleJobs(prev => prev + 6)
  }

  if (loading) {
    return (
      <section className="py-20 bg-bg-850">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="job-listings" className="py-20 bg-bg-850">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-text-high mb-4">
            Open Positions
          </h2>
          <p className="text-xl text-text-mid max-w-2xl mx-auto">
            Discover opportunities that match your skills and passion. Join our team and help us build the future.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {jobs.slice(0, visibleJobs).map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <JobCard job={job} />
            </motion.div>
          ))}
        </div>
``
        {visibleJobs < jobs.length && (
          <div className="text-center">
            <Button
              onClick={loadMoreJobs}
              className="btn-primary"
            >
              Load More Positions
            </Button>
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            onClick={() => router.push('/jobs')}
            variant="secondary"
            className="btn-secondary"
          >
            View All Positions
          </Button>
        </div>
      </div>
    </section>
  )
}
