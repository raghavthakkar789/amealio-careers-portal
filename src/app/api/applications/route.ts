import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock database - in production, this would connect to Prisma/PostgreSQL
const mockApplications = new Map([
  ['app-1', {
    id: 'app-1',
    applicantId: 'user-1',
    applicantName: 'Arjun Sharma',
    applicantEmail: 'arjun.sharma@example.com',
    jobId: 'job-1',
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    company: 'amealio',
    status: 'UNDER_REVIEW',
    appliedDate: '2024-01-15',
    resumeUrl: '/api/files/resume-1',
    coverLetter: 'I am excited to apply for this position...',
    experience: '5+ years in software development',
    education: 'Bachelor of Computer Science',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    additionalFiles: [
      { id: 'resume-1', fileName: 'arjun-sharma-resume.pdf', fileType: 'application/pdf' }
    ],
    expectedSalary: '₹8,00,000 - ₹10,00,000',
    notes: 'Strong technical background',
    interviewDate: '2024-01-25' as string | undefined,
    interviewTime: '2:00 PM' as string | undefined,
    interviewMode: 'Video Call' as string | undefined
  }],
  ['app-2', {
    id: 'app-2',
    applicantId: 'user-2',
    applicantName: 'Priya Patel',
    applicantEmail: 'priya.patel@example.com',
    jobId: 'job-2',
    jobTitle: 'Product Manager',
    department: 'Product',
    company: 'amealio',
    status: 'INTERVIEW_SCHEDULED',
    appliedDate: '2024-01-10',
    resumeUrl: '/api/files/resume-2',
    coverLetter: 'I have extensive experience in product management...',
    experience: '3+ years in product management',
    education: 'MBA in Business Administration',
    skills: ['Product Management', 'Analytics', 'Leadership'],
    additionalFiles: [
      { id: 'resume-2', fileName: 'priya-patel-resume.pdf', fileType: 'application/pdf' },
      { id: 'portfolio-1', fileName: 'priya-patel-portfolio.pdf', fileType: 'application/pdf' }
    ],
    expectedSalary: '₹9,00,000 - ₹12,00,000',
    notes: 'Excellent analytical skills',
    interviewDate: '2024-01-20' as string | undefined,
    interviewTime: '10:00 AM' as string | undefined,
    interviewMode: 'In Person' as string | undefined
  }],
  ['app-3', {
    id: 'app-3',
    applicantId: 'user-3',
    applicantName: 'Rahul Kumar',
    applicantEmail: 'rahul.kumar@example.com',
    jobId: 'job-3',
    jobTitle: 'UX Designer',
    department: 'Design',
    company: 'amealio',
    status: 'HIRED',
    appliedDate: '2024-01-05',
    resumeUrl: '/api/files/resume-3',
    coverLetter: 'I am passionate about creating amazing user experiences...',
    experience: '4+ years in UX design',
    education: 'Bachelor of Design',
    skills: ['Figma', 'User Research', 'Prototyping'],
    additionalFiles: [
      { id: 'resume-3', fileName: 'rahul-kumar-resume.pdf', fileType: 'application/pdf' }
    ],
    expectedSalary: '₹7,00,000 - ₹8,50,000',
    notes: 'Great portfolio, hired',
    interviewDate: '2024-01-12' as string | undefined,
    interviewTime: '3:00 PM' as string | undefined,
    interviewMode: 'Video Call' as string | undefined
  }]
])

const mockJobs = new Map([
  ['job-1', {
    id: 'job-1',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    createdBy: 'hr-user-1',
    isActive: true,
    applicationsCount: 1
  }],
  ['job-2', {
    id: 'job-2',
    title: 'Product Manager',
    department: 'Product',
    createdBy: 'hr-user-1',
    isActive: true,
    applicationsCount: 1
  }],
  ['job-3', {
    id: 'job-3',
    title: 'UX Designer',
    department: 'Design',
    createdBy: 'hr-user-2',
    isActive: true,
    applicationsCount: 1
  }]
])

// GET /api/applications - Get applications based on user role
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user
    let applications: any[] = []

    // Filter applications based on user role
    if (user.role === 'ADMIN') {
      // Admin can see all applications
      applications = Array.from(mockApplications.values())
    } else if (user.role === 'HR') {
      // HR can see applications for jobs they created
      const hrJobs = Array.from(mockJobs.values()).filter(job => job.createdBy === user.id)
      const hrJobIds = hrJobs.map(job => job.id)
      applications = Array.from(mockApplications.values()).filter(app => 
        hrJobIds.includes(app.jobId)
      )
    } else if (user.role === 'APPLICANT') {
      // Applicants can only see their own applications
      applications = Array.from(mockApplications.values()).filter(app => 
        app.applicantId === user.id
      )
    }

    return NextResponse.json({ applications })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'APPLICANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jobId, jobTitle, department, resumeUrl, coverLetter, experience, education, skills, additionalFiles, expectedSalary } = body

    // Validate required fields
    if (!jobId || !jobTitle || !resumeUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if job exists and is active
    const job = mockJobs.get(jobId)
    if (!job || !job.isActive) {
      return NextResponse.json({ error: 'Job not found or inactive' }, { status: 404 })
    }

    // Create new application
    const newApplication = {
      id: `app-${Date.now()}`,
      applicantId: session.user.id,
      applicantName: session.user.name || 'Unknown',
      applicantEmail: session.user.email || 'unknown@example.com',
      jobId,
      jobTitle,
      department,
      company: 'amealio',
      status: 'PENDING',
      appliedDate: new Date().toISOString().split('T')[0],
      resumeUrl,
      coverLetter: coverLetter || '',
      experience: experience || '',
      education: education || '',
      skills: skills || [],
      additionalFiles: additionalFiles || [],
      expectedSalary: expectedSalary || 'No base',
      notes: '',
      interviewDate: undefined as string | undefined,
      interviewTime: undefined as string | undefined,
      interviewMode: undefined as string | undefined
    }

    mockApplications.set(newApplication.id, newApplication)

    // Update job application count
    if (job) {
      job.applicationsCount += 1
      mockJobs.set(jobId, job)
    }

    return NextResponse.json({ 
      application: newApplication,
      message: 'Application submitted successfully' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/applications/[id] - Update application status
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

    const user = session.user
    const application = mockApplications.get(id)
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check access permissions
    const hasAccess = await checkApplicationAccess(user, application)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { status, notes, interviewDate, interviewTime, interviewMode } = body

    // Update application
    const updatedApplication = {
      ...application,
      status: status || application.status,
      notes: notes || application.notes,
      interviewDate: interviewDate || application.interviewDate,
      interviewTime: interviewTime || application.interviewTime,
      interviewMode: interviewMode || application.interviewMode
    }

    mockApplications.set(id, updatedApplication)

    return NextResponse.json({ 
      application: updatedApplication,
      message: 'Application updated successfully' 
    })

  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/applications/[id] - Delete application (only by applicant)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'APPLICANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const application = mockApplications.get(id)
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Only allow applicants to delete their own applications
    if (application.applicantId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Only allow deletion if application is still pending
    if (application.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Cannot delete application that has been processed' 
      }, { status: 400 })
    }

    mockApplications.delete(id)

    // Update job application count
    const job = mockJobs.get(application.jobId)
    if (job) {
      job.applicationsCount = Math.max(0, job.applicationsCount - 1)
      mockJobs.set(application.jobId, job)
    }

    return NextResponse.json({ message: 'Application deleted successfully' })

  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to check application access
async function checkApplicationAccess(user: any, application: any): Promise<boolean> {
  if (user.role === 'ADMIN') {
    return true // Admin has access to all applications
  }
  
  if (user.role === 'HR') {
    // HR can access applications for jobs they created
    const job = mockJobs.get(application.jobId)
    return !!(job && job.createdBy === user.id)
  }
  
  if (user.role === 'APPLICANT') {
    // Applicants can only access their own applications
    return application.applicantId === user.id
  }
  
  return false
}