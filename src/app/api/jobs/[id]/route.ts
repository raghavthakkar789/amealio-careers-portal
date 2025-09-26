import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
    const session = await getServerSession(authOptions)
    
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