import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/oversight/jobs - Get all jobs with complete details
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        summary: true,
        employmentTypes: true,
        applicationDeadline: true,
        requiredSkills: true,
        isActive: true,
        isDraft: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: {
            name: true
          }
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        applications: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
            applicant: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            submittedAt: 'desc'
          }
        },
        jobDescription: {
          select: {
            description: true,
            responsibilities: true,
            requirements: true,
            benefits: true,
            location: true,
            remoteWork: true
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

// POST /api/admin/oversight/jobs - Create new job
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      departmentId,
      summary,
      employmentTypes,
      applicationDeadline,
      requiredSkills,
      description,
      responsibilities,
      requirements,
      benefits,
      location,
      remoteWork
    } = body

    // Validate required fields
    if (!title || !departmentId) {
      return NextResponse.json({ error: 'Title and department are required' }, { status: 400 })
    }

    // Create job with description in a transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the job
      const job = await tx.job.create({
        data: {
          title,
          departmentId,
          summary,
          employmentTypes: employmentTypes || [],
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
          requiredSkills: requiredSkills || [],
          isActive: true,
          isDraft: false,
          createdById: session.user.id
        }
      })

      // Create job description if provided
      if (description) {
        await tx.jobDescription.create({
          data: {
            jobId: job.id,
            description,
            responsibilities: responsibilities || [],
            requirements: requirements || [],
            benefits: benefits || [],
            location,
            remoteWork: remoteWork || false
          }
        })
      }

      return job
    })

    return NextResponse.json({ 
      job: result,
      message: 'Job created successfully' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
