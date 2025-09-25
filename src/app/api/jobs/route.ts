import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock database
const mockJobs = new Map([
  ['job-1', {
    id: 'job-1',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    summary: 'We are looking for a senior software engineer...',
    employmentTypes: ['FULL_TIME'],
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    applicationDeadline: '2024-02-15',
    isActive: true,
    isDraft: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    createdBy: 'hr-user-1',
    description: {
      description: 'Join our engineering team...',
      responsibilities: ['Develop new features', 'Code reviews'],
      requirements: ['5+ years experience', 'React expertise'],
      benefits: ['Health insurance', 'Flexible hours'],
      location: 'San Francisco, CA',
      remoteWork: true
    }
  }],
  ['job-2', {
    id: 'job-2',
    title: 'Product Manager',
    department: 'Product',
    summary: 'Lead product strategy and development...',
    employmentTypes: ['FULL_TIME'],
    requiredSkills: ['Product Management', 'Analytics', 'Leadership'],
    applicationDeadline: undefined, // No deadline
    isActive: true,
    isDraft: false,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    createdBy: 'hr-user-1',
    description: {
      description: 'Drive product strategy...',
      responsibilities: ['Product roadmap', 'Stakeholder management'],
      requirements: ['3+ years PM experience', 'Analytical skills'],
      benefits: ['Competitive salary', 'Stock options'],
      location: 'New York, NY',
      remoteWork: false
    }
  }],
  ['job-3', {
    id: 'job-3',
    title: 'UX Designer',
    department: 'Design',
    summary: 'Create amazing user experiences...',
    employmentTypes: ['FULL_TIME', 'CONTRACT'],
    requiredSkills: ['Figma', 'User Research', 'Prototyping'],
    applicationDeadline: '2024-01-30',
    isActive: false, // Inactive job
    isDraft: false,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-25',
    createdBy: 'hr-user-2',
    description: {
      description: 'Design intuitive interfaces...',
      responsibilities: ['UI/UX design', 'User research'],
      requirements: ['Portfolio required', 'Figma expertise'],
      benefits: ['Design tools', 'Conference budget'],
      location: 'Remote',
      remoteWork: true
    }
  }]
])

const mockApplications = new Map([
  ['app-1', {
    id: 'app-1',
    jobId: 'job-1',
    status: 'UNDER_REVIEW'
  }],
  ['app-2', {
    id: 'app-2',
    jobId: 'job-2',
    status: 'INTERVIEW_SCHEDULED'
  }],
  ['app-3', {
    id: 'app-3',
    jobId: 'job-3',
    status: 'HIRED'
  }]
])

// GET /api/jobs - Get jobs based on user role
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user
    let jobs: any[] = []

    if (user.role === 'ADMIN') {
      // Admin can see all jobs
      jobs = Array.from(mockJobs.values())
    } else if (user.role === 'HR') {
      // HR can see jobs they created
      jobs = Array.from(mockJobs.values()).filter(job => job.createdBy === user.id)
    } else if (user.role === 'APPLICANT') {
      // Applicants can only see active, non-draft jobs
      jobs = Array.from(mockJobs.values()).filter(job => job.isActive && !job.isDraft)
    }

    return NextResponse.json({ jobs })

  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/jobs - Create new job
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== 'HR' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      department, 
      summary, 
      employmentTypes, 
      requiredSkills, 
      applicationDeadline,
      hasDeadline,
      isActive,
      isDraft,
      description
    } = body

    // Validate required fields
    if (!title || !department || !summary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create new job
    const newJob = {
      id: `job-${Date.now()}`,
      title,
      department,
      summary,
      employmentTypes: employmentTypes || [],
      requiredSkills: requiredSkills || [],
      applicationDeadline: hasDeadline ? applicationDeadline : undefined,
      isActive: isActive !== false,
      isDraft: isDraft || false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: session.user.id,
      description: description || {
        description: '',
        responsibilities: [],
        requirements: [],
        benefits: [],
        location: '',
        remoteWork: false
      }
    }

    mockJobs.set(newJob.id, newJob)

    return NextResponse.json({ 
      job: newJob,
      message: 'Job created successfully' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/jobs/[id] - Update job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const job = mockJobs.get(id)
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check access permissions
    const hasAccess = await checkJobAccess(session.user, job)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      title, 
      department, 
      summary, 
      employmentTypes, 
      requiredSkills, 
      applicationDeadline,
      hasDeadline,
      isActive,
      isDraft,
      description
    } = body

    // Update job
    const updatedJob = {
      ...job,
      title: title || job.title,
      department: department || job.department,
      summary: summary || job.summary,
      employmentTypes: employmentTypes || job.employmentTypes,
      requiredSkills: requiredSkills || job.requiredSkills,
      applicationDeadline: hasDeadline ? applicationDeadline : undefined,
      isActive: isActive !== undefined ? isActive : job.isActive,
      isDraft: isDraft !== undefined ? isDraft : job.isDraft,
      updatedAt: new Date().toISOString().split('T')[0],
      description: description || job.description
    }

    mockJobs.set(id, updatedJob)

    return NextResponse.json({ 
      job: updatedJob,
      message: 'Job updated successfully' 
    })

  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/jobs/[id] - Delete job (with protection)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const job = mockJobs.get(id)
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check access permissions
    const hasAccess = await checkJobAccess(session.user, job)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if job has pending applications
    const pendingApplications = Array.from(mockApplications.values()).filter(app => 
      app.jobId === id && !['HIRED', 'REJECTED'].includes(app.status)
    )

    if (pendingApplications.length > 0) {
      return NextResponse.json({ 
        error: `Cannot delete job. There are ${pendingApplications.length} pending applications that must be processed first.`,
        pendingApplications: pendingApplications.length,
        applications: pendingApplications.map(app => ({
          id: app.id,
          status: app.status
        }))
      }, { status: 400 })
    }

    // Safe to delete job
    mockJobs.delete(id)

    // Also delete all applications for this job
    const jobApplications = Array.from(mockApplications.values()).filter(app => app.jobId === id)
    jobApplications.forEach(app => mockApplications.delete(app.id))

    return NextResponse.json({ 
      message: 'Job deleted successfully',
      deletedApplications: jobApplications.length
    })

  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to check job access
async function checkJobAccess(user: any, job: any): Promise<boolean> {
  if (user.role === 'ADMIN') {
    return true // Admin has access to all jobs
  }
  
  if (user.role === 'HR') {
    // HR can access jobs they created
    return job.createdBy === user.id
  }
  
  return false // Applicants cannot modify jobs
}
