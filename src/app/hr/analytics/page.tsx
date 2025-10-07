'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { 
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  BriefcaseIcon,
  UsersIcon,
  StarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  totalApplications: number
  applicationsThisMonth: number
  applicationsLastMonth: number
  totalInterviews: number
  interviewsThisMonth: number
  totalHires: number
  hiresThisMonth: number
  rejectionRate: number
  averageTimeToHire: number
  averageInterviewScore: number
  topPerformingJobs: Array<{
    id: string
    title: string
    applications: number
    hires: number
    conversionRate: number
  }>
  monthlyTrends: Array<{
    month: string
    applications: number
    interviews: number
    hires: number
  }>
  departmentStats: Array<{
    department: string
    applications: number
    interviews: number
    hires: number
    avgTimeToHire: number
  }>
  sourcePerformance: Array<{
    source: string
    applications: number
    hires: number
    conversionRate: number
  }>
  hrPerformance: {
    totalJobsPosted: number
    activeJobs: number
    closedJobs: number
    averageResponseTime: number
    candidateSatisfactionScore: number
  }
}

export default function HRAnalytics() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')


  // Authentication check
  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user?.role !== 'HR') {
      router.push('/login')
      return
    }
  }, [session, status, router])

  // Load analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        // Fetch analytics from API
        try {
          const response = await fetch('/api/hr/analytics')
          if (response.ok) {
            const data = await response.json()
            setAnalytics(data)
          } else {
            // Fallback to empty analytics if API fails
            setAnalytics({
              totalApplications: 0,
              applicationsThisMonth: 0,
              applicationsLastMonth: 0,
              totalInterviews: 0,
              interviewsThisMonth: 0,
              totalHires: 0,
              hiresThisMonth: 0,
              rejectionRate: 0,
              averageTimeToHire: 0,
              averageInterviewScore: 0,
              topPerformingJobs: [],
              monthlyTrends: [],
              departmentStats: [],
              sourcePerformance: [],
              hrPerformance: {
                totalJobsPosted: 0,
                activeJobs: 0,
                closedJobs: 0,
                averageResponseTime: 0,
                candidateSatisfactionScore: 0
              }
            })
          }
        } catch (error) {
          console.error('Error fetching analytics:', error)
          // Fallback analytics
          setAnalytics({
            totalApplications: 0,
            applicationsThisMonth: 0,
            applicationsLastMonth: 0,
            totalInterviews: 0,
            interviewsThisMonth: 0,
            totalHires: 0,
            hiresThisMonth: 0,
            rejectionRate: 0,
            averageTimeToHire: 0,
            averageInterviewScore: 0,
            topPerformingJobs: [],
            monthlyTrends: [],
            departmentStats: [],
            sourcePerformance: [],
            hrPerformance: {
              totalJobsPosted: 0,
              activeJobs: 0,
              closedJobs: 0,
              averageResponseTime: 0,
              candidateSatisfactionScore: 0
            }
          })
        }
      } catch (error) {
        toast.error('Failed to load analytics data')
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-850 via-bg-900 to-bg-850">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session || session.user?.role !== 'HR') {
    return null
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-850 via-bg-900 to-bg-850">
        <div className="text-center">
          <p className="text-text-mid">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  const applicationsGrowth = ((analytics.applicationsThisMonth - analytics.applicationsLastMonth) / analytics.applicationsLastMonth * 100).toFixed(1)
  const hiresGrowth = ((analytics.hiresThisMonth - 6) / 6 * 100).toFixed(1) // Assuming previous month had 6 hires

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-850 via-bg-900 to-bg-850">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#40299B]/20 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 flex justify-start">
                <Button
                  onClick={() => router.push('/hr/dashboard')}
                  variant="secondary"
                  className="btn-secondary hover-lift"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
              <div className="flex-1 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mb-4"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-[#40299B] rounded-full flex items-center justify-center mx-auto mb-4 shadow-large">
                    <ChartBarIcon className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-[#40299B] bg-clip-text text-transparent mb-4">
                    HR Analytics
                  </h1>
                  <p className="text-xl text-text-mid max-w-2xl mx-auto">
                    Comprehensive insights into your recruitment performance and hiring metrics.
                  </p>
                </motion.div>
              </div>
              <div className="flex-1 flex justify-end">
                {/* Empty div to maintain layout balance */}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex gap-2 mb-8 border-b border-border"
          >
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon, color: 'from-primary to-[#40299B]' },
              { id: 'performance', label: 'Performance', icon: StarIcon, color: 'from-emerald-500 to-emerald-600' },
              { id: 'trends', label: 'Trends', icon: ArrowTrendingUpIcon, color: 'from-amber-500 to-amber-600' },
              { id: 'sources', label: 'Sources', icon: UsersIcon, color: 'from-rose-500 to-rose-600' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 border-b-2 transition-all duration-300 rounded-t-lg ${
                  activeTab === tab.id
                    ? `border-primary text-primary bg-gradient-to-r ${tab.color} bg-opacity-10`
                    : 'border-transparent text-text-mid hover:text-text-high hover:bg-bg-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-8"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card hover-lift">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-[#40299B] rounded-lg flex items-center justify-center mr-4">
                      <DocumentTextIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-text-high">{analytics.totalApplications}</p>
                      <p className="text-text-mid">Total Applications</p>
                      <div className="flex items-center mt-1">
                        {parseFloat(applicationsGrowth) > 0 ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-600 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-rose-600 mr-1" />
                        )}
                        <p className={`text-xs ${parseFloat(applicationsGrowth) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {applicationsGrowth}% this month
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card hover-lift">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
                      <CheckCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-text-high">{analytics.totalHires}</p>
                      <p className="text-text-mid">Total Hires</p>
                      <div className="flex items-center mt-1">
                        {parseFloat(hiresGrowth) > 0 ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-600 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-rose-600 mr-1" />
                        )}
                        <p className={`text-xs ${parseFloat(hiresGrowth) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {hiresGrowth}% this month
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card hover-lift">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mr-4">
                      <ClockIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-text-high">{analytics.averageTimeToHire}</p>
                      <p className="text-text-mid">Avg. Time to Hire</p>
                      <p className="text-xs text-amber-600">Days</p>
                    </div>
                  </div>
                </div>
                
                <div className="card hover-lift">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg flex items-center justify-center mr-4">
                      <StarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-text-high">{analytics.averageInterviewScore}</p>
                      <p className="text-text-mid">Avg. Interview Score</p>
                      <p className="text-xs text-rose-600">Out of 5</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* HR Performance Metrics */}
              <div className="card">
                <h2 className="text-2xl font-bold text-text-high mb-6">Your Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-bg-850 p-6 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-text-high">Jobs Management</h3>
                      <BriefcaseIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-mid">Total Posted:</span>
                        <span className="text-text-high font-semibold">{analytics.hrPerformance.totalJobsPosted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-mid">Active:</span>
                        <span className="text-emerald-600 font-semibold">{analytics.hrPerformance.activeJobs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-mid">Closed:</span>
                        <span className="text-text-high font-semibold">{analytics.hrPerformance.closedJobs}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-bg-850 p-6 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-text-high">Response Time</h3>
                      <ClockIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-text-high mb-2">{analytics.hrPerformance.averageResponseTime}</p>
                      <p className="text-text-mid">Average Days</p>
                      <p className="text-xs text-emerald-600 mt-2">Excellent response time!</p>
                    </div>
                  </div>

                  <div className="bg-bg-850 p-6 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-text-high">Candidate Satisfaction</h3>
                      <StarIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-text-high mb-2">{analytics.hrPerformance.candidateSatisfactionScore}</p>
                      <p className="text-text-mid">Out of 5</p>
                      <p className="text-xs text-emerald-600 mt-2">Great candidate experience!</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Top Performing Jobs */}
              <div className="card">
                <h2 className="text-2xl font-bold text-text-high mb-6">Top Performing Jobs</h2>
                <div className="space-y-4">
                  {analytics.topPerformingJobs.map((job, index) => (
                    <div key={job.id} className="bg-bg-850 p-6 rounded-lg border border-border hover:shadow-medium transition-all duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-[#40299B] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">#{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-text-high">{job.title}</h3>
                            <p className="text-text-mid text-sm">Job ID: {job.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-600">{job.conversionRate}%</p>
                          <p className="text-text-mid text-sm">Conversion Rate</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between">
                          <span className="text-text-mid">Applications:</span>
                          <span className="text-text-high font-semibold">{job.applications}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-mid">Hires:</span>
                          <span className="text-emerald-600 font-semibold">{job.hires}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Performance */}
              <div className="card">
                <h2 className="text-2xl font-bold text-text-high mb-6">Department Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.departmentStats.map((dept) => (
                    <div key={dept.department} className="bg-bg-850 p-4 rounded-lg border border-border hover:shadow-medium transition-all duration-200">
                      <h3 className="font-semibold text-text-high mb-3">{dept.department}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-mid">Applications:</span>
                          <span className="text-text-high">{dept.applications}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-mid">Interviews:</span>
                          <span className="text-amber-600">{dept.interviews}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-mid">Hires:</span>
                          <span className="text-emerald-600">{dept.hires}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-mid">Avg. Time:</span>
                          <span className="text-text-high">{dept.avgTimeToHire} days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-2xl font-bold text-text-high mb-6">Monthly Trends</h2>
                <div className="space-y-4">
                  {analytics.monthlyTrends.map((trend) => (
                    <div key={trend.month} className="bg-bg-850 p-6 rounded-lg border border-border">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-text-high">{trend.month} 2024</h3>
                        <CalendarIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{trend.applications}</p>
                          <p className="text-text-mid text-sm">Applications</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-amber-600">{trend.interviews}</p>
                          <p className="text-text-mid text-sm">Interviews</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-600">{trend.hires}</p>
                          <p className="text-text-mid text-sm">Hires</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sources Tab */}
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-2xl font-bold text-text-high mb-6">Source Performance</h2>
                <div className="space-y-4">
                  {analytics.sourcePerformance.map((source) => (
                    <div key={source.source} className="bg-bg-850 p-6 rounded-lg border border-border hover:shadow-medium transition-all duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-text-high">{source.source}</h3>
                          <p className="text-text-mid text-sm">Recruitment Source</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-600">{source.conversionRate}%</p>
                          <p className="text-text-mid text-sm">Conversion Rate</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between">
                          <span className="text-text-mid">Applications:</span>
                          <span className="text-text-high font-semibold">{source.applications}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-mid">Hires:</span>
                          <span className="text-emerald-600 font-semibold">{source.hires}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex justify-center mt-8"
          >
            <Button className="btn-primary hover-glow">
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Export Analytics Report
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
