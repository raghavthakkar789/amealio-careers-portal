import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/jobs - Get jobs based on user role
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user
    let whereClause: any = {}

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

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        department: true,
        createdBy: true
      }
    })
    
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

    // Verify department exists if changing
    if (departmentId && departmentId !== job.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      })

      if (!department) {
        return NextResponse.json({ error: 'Department not found' }, { status: 404 })
      }
    }

    // Update job
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title: title || job.title,
        departmentId: departmentId || job.departmentId,
        summary: summary || job.summary,
        employmentTypes: employmentTypes || job.employmentTypes,
        requiredSkills: requiredSkills || job.requiredSkills,
        applicationDeadline: hasDeadline ? new Date(applicationDeadline) : null,
        isActive: isActive !== undefined ? isActive : job.isActive,
        isDraft: isDraft !== undefined ? isDraft : job.isDraft,
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

    // Update job description if provided
    if (description) {
      await prisma.jobDescription.upsert({
        where: { jobId: id },
        update: {
          description: description.description || '',
          responsibilities: description.responsibilities || [],
          requirements: description.requirements || [],
          benefits: description.benefits || [],
          location: description.location || null,
          remoteWork: description.remoteWork || false
        },
        create: {
          jobId: id,
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

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        department: true,
        createdBy: true,
        applications: {
          where: {
            status: {
              notIn: ['HIRED', 'REJECTED']
            }
          }
        }
      }
    })
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check access permissions
    const hasAccess = await checkJobAccess(session.user, job)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if job has pending applications
    if (job.applications.length > 0) {
      return NextResponse.json({ 
        error: `Cannot delete job. There are ${job.applications.length} pending applications that must be processed first.`,
        pendingApplications: job.applications.length,
        applications: job.applications.map(app => ({
          id: app.id,
          status: app.status
        }))
      }, { status: 400 })
    }

    // Safe to delete job (cascade will handle related records)
    await prisma.job.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Job deleted successfully'
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
    return job.createdById === user.id
  }
  
  return false // Applicants cannot modify jobs
}