import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock database - same as in route.ts
const mockApplications = new Map([
  ['app-1', {
    id: 'app-1',
    applicantId: 'user-1',
    applicantName: 'John Doe',
    applicantEmail: 'john.doe@example.com',
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
      { id: 'resume-1', fileName: 'john-doe-resume.pdf', fileType: 'application/pdf' }
    ],
    notes: 'Strong technical background',
    interviewDate: '2024-01-25',
    interviewTime: '2:00 PM',
    interviewMode: 'Video Call'
  }],
  ['app-2', {
    id: 'app-2',
    applicantId: 'user-2',
    applicantName: 'Jane Smith',
    applicantEmail: 'jane.smith@example.com',
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
      { id: 'resume-2', fileName: 'jane-smith-resume.pdf', fileType: 'application/pdf' },
      { id: 'portfolio-1', fileName: 'jane-smith-portfolio.pdf', fileType: 'application/pdf' }
    ],
    notes: 'Excellent analytical skills',
    interviewDate: '2024-01-20',
    interviewTime: '10:00 AM',
    interviewMode: 'In Person'
  }],
  ['app-3', {
    id: 'app-3',
    applicantId: 'user-3',
    applicantName: 'Mike Johnson',
    applicantEmail: 'mike.johnson@example.com',
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
      { id: 'resume-3', fileName: 'mike-johnson-resume.pdf', fileType: 'application/pdf' }
    ],
    notes: 'Great portfolio, hired',
    interviewDate: '2024-01-12',
    interviewTime: '3:00 PM',
    interviewMode: 'Video Call'
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

// GET /api/applications/[id] - Get specific application
export async function GET(
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

    const application = mockApplications.get(id)
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check access permissions
    const hasAccess = await checkApplicationAccess(session.user, application)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ application })

  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/applications/[id] - Update specific application
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

    const application = mockApplications.get(id)
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check access permissions
    const hasAccess = await checkApplicationAccess(session.user, application)
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

// DELETE /api/applications/[id] - Delete specific application
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