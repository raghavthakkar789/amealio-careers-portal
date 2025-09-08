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
    // Simulate API call - replace with actual API call
    const fetchJobs = async () => {
      try {
        // Mock data for now
        const mockJobs: Job[] = [
          {
            id: '1',
            title: 'Senior Software Engineer',
            department: 'ENGINEERING',
            employmentTypes: ['FULL_TIME'],
            location: 'Bangalore, India',
            remoteWork: true,
            createdAt: '2024-01-15T10:00:00Z',
            requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
            summary: 'Join our engineering team to build scalable web applications.',
          },
          {
            id: '2',
            title: 'Product Manager',
            department: 'MARKETING',
            employmentTypes: ['FULL_TIME'],
            location: 'Mumbai, India',
            remoteWork: false,
            createdAt: '2024-01-14T10:00:00Z',
            requiredSkills: ['Product Strategy', 'Agile', 'User Research'],
            summary: 'Lead product development and strategy for our platform.',
          },
          {
            id: '3',
            title: 'Sales Representative',
            department: 'SALES',
            employmentTypes: ['FULL_TIME', 'PART_TIME'],
            location: 'Delhi, India',
            remoteWork: false,
            createdAt: '2024-01-13T10:00:00Z',
            requiredSkills: ['Sales', 'CRM', 'Communication'],
            summary: 'Drive revenue growth through strategic sales initiatives.',
          },
          {
            id: '4',
            title: 'UX Designer',
            department: 'MARKETING',
            employmentTypes: ['FULL_TIME'],
            location: 'Hyderabad, India',
            remoteWork: true,
            createdAt: '2024-01-12T10:00:00Z',
            requiredSkills: ['Figma', 'User Research', 'Prototyping'],
            summary: 'Create exceptional user experiences for our products.',
          },
          {
            id: '5',
            title: 'Data Scientist',
            department: 'ENGINEERING',
            employmentTypes: ['FULL_TIME'],
            location: 'Pune, India',
            remoteWork: false,
            createdAt: '2024-01-11T10:00:00Z',
            requiredSkills: ['Python', 'Machine Learning', 'SQL'],
            summary: 'Build data-driven solutions and insights.',
          },
          {
            id: '6',
            title: 'HR Coordinator',
            department: 'HR',
            employmentTypes: ['FULL_TIME'],
            location: 'Chennai, India',
            remoteWork: true,
            createdAt: '2024-01-10T10:00:00Z',
            requiredSkills: ['HRIS', 'Recruitment', 'Employee Relations'],
            summary: 'Support our HR operations and employee experience.',
          },
        ]
        
        setJobs(mockJobs)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching jobs:', error)
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
      <section className="py-20 bg-gray-50">
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
