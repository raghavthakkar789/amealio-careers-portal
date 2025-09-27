import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/oversight/jobs/[id] - Get specific job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const job = await prisma.job.findUnique({
      where: { id },
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
            id: true,
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
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ job })

  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/oversight/jobs/[id] - Update job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const session = await getServerSession(authOptions)
    
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
      where: { id }
    })

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Update job and description in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the job
      const updatedJob = await tx.job.update({
        where: { id },
        data: {
          title,
          departmentId,
          summary,
          employmentTypes: employmentTypes || [],
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
          requiredSkills: requiredSkills || [],
          isActive: isActive !== undefined ? isActive : true,
          isDraft: isDraft !== undefined ? isDraft : false
        }
      })

      // Update or create job description
      if (description) {
        await tx.jobDescription.upsert({
          where: { jobId: id },
          update: {
            description,
            responsibilities: responsibilities || [],
            requirements: requirements || [],
            benefits: benefits || [],
            location,
            remoteWork: remoteWork || false
          },
          create: {
            jobId: id,
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

// DELETE /api/admin/oversight/jobs/[id] - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id }
    })

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Delete job (cascade will handle related records)
    await prisma.job.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Job deleted successfully' })

  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
