import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/applications - Get applications based on user role
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user
    let whereClause: any = {}

    // Filter applications based on user role
    if (user.role === 'ADMIN') {
      // Admin can see all applications
      whereClause = {}
    } else if (user.role === 'HR') {
      // HR can see applications for jobs they created
      whereClause = {
        job: {
          createdById: user.id
        }
      }
    } else if (user.role === 'APPLICANT') {
      // Applicants can only see their own applications
      whereClause = {
        applicantId: user.id
      }
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

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
    
    console.log('Session:', session ? { 
      user: { 
        id: session.user?.id, 
        email: session.user?.email, 
        role: session.user?.role 
      } 
    } : 'null')
    
    if (!session || session.user?.role !== 'APPLICANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Handle FormData
    const formData = await request.formData()
    const jobId = formData.get('jobId') as string
    const applicantId = formData.get('applicantId') as string
    const coverLetter = formData.get('coverLetter') as string
    const experience = formData.get('experience') as string
    const education = formData.get('education') as string
    const skills = formData.get('skills') as string
    const availability = formData.get('availability') as string
    const expectedSalary = formData.get('expectedSalary') as string
    const references = formData.get('references') as string
    const resumeFile = formData.get('resume') as File

    console.log('FormData received:', {
      jobId,
      applicantId,
      coverLetter: coverLetter?.substring(0, 50) + '...',
      experience,
      education: education?.substring(0, 50) + '...',
      skills: skills?.substring(0, 50) + '...',
      availability,
      expectedSalary,
      references: references?.substring(0, 50) + '...',
      resumeFile: resumeFile?.name
    })

    // Validate required fields
    if (!jobId || !applicantId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { department: true }
    })
    
    console.log('Job found:', job ? { id: job.id, title: job.title, isActive: job.isActive } : 'null')
    
    if (!job || !job.isActive) {
      return NextResponse.json({ error: 'Job not found or inactive' }, { status: 404 })
    }

    // Handle file upload (for now, just store filename)
    let resumeUrl = 'resume.pdf' // Default
    if (resumeFile && resumeFile.size > 0) {
      resumeUrl = `${applicantId}_${Date.now()}_resume.pdf`
    }

    // Create new application
    console.log('Creating application with data:', {
      jobTitle: job.title,
      employmentType: 'FULL_TIME',
      resumeUrl,
      coverLetter: coverLetter || '',
      expectedSalary: expectedSalary || 'No base',
      experience: experience || '',
      education: education || '',
      skills: skills || '',
      availability: availability || '',
      references: references || '',
      status: 'PENDING',
      applicantId: session.user.id,
      jobId
    })

    const newApplication = await prisma.application.create({
      data: {
        jobTitle: job.title,
        employmentType: 'FULL_TIME', // Default, can be made dynamic
        resumeUrl,
        additionalFiles: [], // TODO: Handle additional files
        coverLetter: coverLetter || '',
        expectedSalary: expectedSalary || 'No base',
        experience: experience || '',
        education: education || '',
        skills: skills || '',
        availability: availability || '',
        references: references || '',
        status: 'PENDING',
        applicantId: session.user.id,
        jobId
      },
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ 
      application: newApplication,
      message: 'Application submitted successfully' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating application:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}