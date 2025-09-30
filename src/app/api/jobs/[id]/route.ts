import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const jobId = resolvedParams.id

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        department: true,
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        jobDescription: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    })

    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if user can view this job
    const session = await auth()
    
    if (session) {
      const user = session.user

      // Applicants can only see active, non-draft jobs
      if (user.role === 'APPLICANT' && (!job.isActive || job.isDraft)) {
        return NextResponse.json(
          { message: 'Job not found' },
          { status: 404 }
        )
      }

      // HR can only see jobs they created (unless admin)
      if (user.role === 'HR' && user.id !== job.createdById) {
        return NextResponse.json(
          { message: 'Job not found' },
          { status: 404 }
        )
      }
    } else {
      // Public access - only show active, non-draft jobs
      if (!job.isActive || job.isDraft) {
        return NextResponse.json(
          { message: 'Job not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(job, { status: 200 })

  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/jobs/[id] - Update job status (activate/deactivate)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const jobId = resolvedParams.id
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isActive } = body

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId }
    })

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check permissions
    const user = session.user
    if (user.role === 'HR' && user.id !== existingJob.createdById) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (user.role === 'APPLICANT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update job status
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { isActive },
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
      }
    })

    return NextResponse.json({ 
      job: updatedJob,
      message: `Job ${isActive ? 'activated' : 'deactivated'} successfully` 
    })

  } catch (error) {
    console.error('Error updating job status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/jobs/[id] - Update job details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const jobId = resolvedParams.id
    const session = await auth()
    
    if (!session) {
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
      isActive,
      isDraft,
      description,
      responsibilities,
      requirements,
      benefits,
      location,
      remoteWork
    } = body

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId }
    })

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check permissions
    const user = session.user
    if (user.role === 'HR' && user.id !== existingJob.createdById) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (user.role === 'APPLICANT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update job and description in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the job
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: {
          title,
          departmentId,
          summary,
          employmentTypes: employmentTypes || [],
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
          requiredSkills: requiredSkills || [],
          isActive: isActive !== undefined ? isActive : true,
          isDraft: isDraft !== undefined ? isDraft : false
        },
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
        }
      })

      // Update or create job description
      if (description) {
        await tx.jobDescription.upsert({
          where: { jobId: jobId },
          update: {
            description,
            responsibilities: responsibilities || [],
            requirements: requirements || [],
            benefits: benefits || [],
            location,
            remoteWork: remoteWork || false
          },
          create: {
            jobId: jobId,
            description,
            responsibilities: responsibilities || [],
            requirements: requirements || [],
            benefits: benefits || [],
            location,
            remoteWork: remoteWork || false
          }
        })
      }

      return updatedJob
    })

    return NextResponse.json({ 
      job: result,
      message: 'Job updated successfully' 
    })

  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}