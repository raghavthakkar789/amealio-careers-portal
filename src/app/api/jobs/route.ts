import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/jobs - Get jobs based on user role
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    let whereClause: {
      createdById?: string
      isActive?: boolean
      isDraft?: boolean
    } = {}

    if (session) {
      const user = session.user
      if (user.role === 'ADMIN') {
        // Admin can see all jobs
        whereClause = {}
      } else if (user.role === 'HR') {
        // HR can see jobs they created
        whereClause.createdById = user.id
      } else if (user.role === 'APPLICANT') {
        // Applicants can only see active, non-draft jobs
        whereClause.isActive = true
        whereClause.isDraft = false
      }
    } else {
      // Public access - only show active, non-draft jobs
      whereClause.isActive = true
      whereClause.isDraft = false
    }

    // Always exclude draft jobs for public and applicant access
    if (!session || session.user?.role === 'APPLICANT') {
      whereClause.isDraft = false
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        department: true,
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

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
      departmentId, 
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
    if (!title || !departmentId || !summary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    })

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    // Create new job
    const newJob = await prisma.job.create({
      data: {
        title,
        departmentId,
        summary,
        employmentTypes: employmentTypes || [],
        requiredSkills: requiredSkills || [],
        applicationDeadline: hasDeadline ? new Date(applicationDeadline) : null,
        isActive: isActive !== false,
        isDraft: isDraft || false,
        createdById: session.user.id,
      },
      include: {
        department: true,
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Create job description if provided
    if (description) {
      await prisma.jobDescription.create({
        data: {
          jobId: newJob.id,
          description: description.description || '',
          responsibilities: description.responsibilities || [],
          requirements: description.requirements || [],
          benefits: description.benefits || [],
          location: description.location || null,
          remoteWork: description.remoteWork || false
        }
      })
    }

    return NextResponse.json({ 
      job: newJob,
      message: 'Job created successfully' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



// Helper function to check job access
async function checkJobAccess(user: {
  id: string
  role: string
}, job: {
  createdById: string
}): Promise<boolean> {
  if (user.role === 'ADMIN') {
    return true // Admin has access to all jobs
  }
  
  if (user.role === 'HR') {
    // HR can access jobs they created
    return job.createdById === user.id
  }
  
  return false // Applicants cannot modify jobs
}