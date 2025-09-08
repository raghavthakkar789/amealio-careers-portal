'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { MapPinIcon, ClockIcon, BriefcaseIcon } from '@heroicons/react/24/outline'

interface JobCardProps {
  job: {
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
}

export function JobCard({ job }: JobCardProps) {
  const router = useRouter()

  const handleApply = () => {
    router.push(`/jobs/${job.id}/apply`)
  }

  const handleViewDetails = () => {
    router.push(`/jobs/${job.id}`)
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card-grey group cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-text-high mb-2 group-hover:text-link transition-colors">
            {job.title}
          </h3>
          <p className="text-text-mid capitalize font-medium">
            {job.department.replace('_', ' ').toLowerCase()}
          </p>
        </div>
        <span className="px-3 py-1 bg-purple-800 text-purple-200 text-sm rounded-full">
          {job.employmentTypes[0].replace('_', ' ')}
        </span>
      </div>

      {job.summary && (
        <p className="text-text-mid mb-4 line-clamp-2 leading-relaxed">
          {job.summary}
        </p>
      )}

      <div className="space-y-2 mb-4">
        {(job.location || job.remoteWork) && (
          <div className="flex items-center text-text-dim">
            <MapPinIcon className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {job.remoteWork ? 'Remote' : job.location || 'Location TBD'}
            </span>
          </div>
        )}

        <div className="flex items-center text-text-dim">
          <ClockIcon className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center text-text-dim">
          <BriefcaseIcon className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">
            {job.employmentTypes.map(type => type.replace('_', ' ')).join(', ')}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-semibold text-text-high mb-2">Key Skills:</h4>
        <div className="flex flex-wrap gap-2">
          {job.requiredSkills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-bg-850 text-text-mid text-xs rounded-md border border-border"
            >
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 4 && (
            <span className="px-2 py-1 bg-bg-850 text-text-mid text-xs rounded-md border border-border">
              +{job.requiredSkills.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={(e) => {
            e.stopPropagation()
            handleApply()
          }}
          className="btn-primary flex-1"
        >
          Apply Now
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation()
            handleViewDetails()
          }}
          className="bg-bg-850 text-text-high hover:bg-bg-900 border-2 border-border hover:border-link flex-1 h-12 px-6 font-semibold rounded-lg transition-all duration-200"
        >
          View Details
        </Button>
      </div>
    </motion.div>
  )
}
