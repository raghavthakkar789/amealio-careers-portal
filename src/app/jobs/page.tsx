'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { JobCard } from '@/components/cards/JobCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.summary?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !selectedDepartment || job.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const departments = ['ENGINEERING', 'MARKETING', 'SALES', 'HR', 'FINANCE', 'OPERATIONS']

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Button
            onClick={() => router.back()}
            variant="secondary"
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              Open Positions
            </h1>
            <p className="text-xl text-text-secondary">
              Find your next opportunity at amealio
            </p>
          </div>

          {/* Search and Filter */}
          <div className="card mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Search Jobs</label>
                <Input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedDepartment('')
                  }}
                  variant="secondary"
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <p className="text-text-secondary">
              Showing {filteredJobs.length} of {jobs.length} positions
            </p>
          </div>

          {/* Job Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                No positions found
              </h3>
              <p className="text-text-secondary mb-4">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedDepartment('')
                }}
                className="btn-primary"
              >
                View All Positions
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
