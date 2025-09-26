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
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { department: true }
    })
    
    if (!job || !job.isActive) {
      return NextResponse.json({ error: 'Job not found or inactive' }, { status: 404 })
    }

    // Create new application
    const newApplication = await prisma.application.create({
      data: {
        jobTitle,
        employmentType: 'FULL_TIME', // Default, can be made dynamic
        resumeUrl,
        additionalFiles: additionalFiles || [],
        coverLetter: coverLetter || '',
        expectedSalary: expectedSalary || 'No base',
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}