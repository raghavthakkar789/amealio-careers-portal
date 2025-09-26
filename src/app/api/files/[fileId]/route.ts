import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock file storage - in production, this would connect to S3 or similar
const mockFiles = new Map([
  ['resume-1', {
    id: 'resume-1',
    fileName: 'arjun-sharma-resume.pdf',
    fileType: 'application/pdf',
    content: 'Mock PDF content for Arjun Sharma resume',
    uploadedBy: 'user-1',
    uploadedAt: new Date('2024-01-15'),
    applicationId: 'app-1'
  }],
  ['resume-2', {
    id: 'resume-2',
    fileName: 'priya-patel-resume.pdf',
    fileType: 'application/pdf',
    content: 'Mock PDF content for Priya Patel resume',
    uploadedBy: 'user-2',
    uploadedAt: new Date('2024-01-16'),
    applicationId: 'app-2'
  }],
  ['portfolio-1', {
    id: 'portfolio-1',
    fileName: 'priya-patel-portfolio.pdf',
    fileType: 'application/pdf',
    content: 'Mock PDF content for Priya Patel portfolio',
    uploadedBy: 'user-2',
    uploadedAt: new Date('2024-01-16'),
    applicationId: 'app-2'
  }]
])

// Mock applications data to check access permissions
const mockApplications = new Map([
  ['app-1', {
    id: 'app-1',
    applicantId: 'user-1',
    jobTitle: 'Senior Software Engineer',
    status: 'UNDER_REVIEW'
  }],
  ['app-2', {
    id: 'app-2',
    applicantId: 'user-2',
    jobTitle: 'UX Designer',
    status: 'INTERVIEW_SCHEDULED'
  }]
])

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const resolvedParams = await params
    const { fileId } = resolvedParams
    
    // Get session
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get file from mock storage
    const file = mockFiles.get(fileId)
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check access permissions based on user role
    const hasAccess = await checkFileAccess(session.user, file)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Return file content
    return new NextResponse(file.content, {
      headers: {
        'Content-Type': file.fileType,
        'Content-Disposition': `inline; filename="${file.fileName}"`,
        'Cache-Control': 'private, max-age=3600'
      }
    })

  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function checkFileAccess(user: any, file: any): Promise<boolean> {
  // Admin and HR can access all files
  if (user.role === 'ADMIN' || user.role === 'HR') {
    return true
  }

  // Applicants can only access their own files
  if (user.role === 'APPLICANT') {
    // Check if the file belongs to the current user
    if (file.uploadedBy === user.id) {
      return true
    }

    // Check if the file is associated with an application by the current user
    const application = mockApplications.get(file.applicationId)
    if (application && application.applicantId === user.id) {
      return true
    }
  }

  return false
}

// Get file metadata without downloading
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const resolvedParams = await params
    const { fileId } = resolvedParams
    
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse(null, { status: 401 })
    }

    const file = mockFiles.get(fileId)
    if (!file) {
      return new NextResponse(null, { status: 404 })
    }

    const hasAccess = await checkFileAccess(session.user, file)
    
    if (!hasAccess) {
      return new NextResponse(null, { status: 403 })
    }

    return new NextResponse(null, {
      headers: {
        'Content-Type': file.fileType,
        'Content-Length': file.content.length.toString(),
        'Last-Modified': file.uploadedAt.toUTCString(),
        'Cache-Control': 'private, max-age=3600'
      }
    })

  } catch (error) {
    console.error('Error getting file metadata:', error)
    return new NextResponse(null, { status: 500 })
  }
}
