import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const application = await prisma.application.findUnique({
      where: { id },
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
            },
            createdById: true
          }
        }
      }
    })
    
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

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            createdById: true
          }
        }
      }
    })
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check access permissions
    const hasAccess = await checkApplicationAccess(session.user, application)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Handle FormData for application updates
    const formData = await request.formData()
    const coverLetter = formData.get('coverLetter') as string
    const experience = formData.get('experience') as string
    const education = formData.get('education') as string
    const skills = formData.get('skills') as string
    const availability = formData.get('availability') as string
    const expectedSalary = formData.get('expectedSalary') as string
    const references = formData.get('references') as string
    const resumeFile = formData.get('resume') as File

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        coverLetter: coverLetter || application.coverLetter,
        expectedSalary: expectedSalary || application.expectedSalary,
        experience: experience || application.experience,
        education: education || application.education,
        skills: skills || application.skills,
        availability: availability || application.availability,
        references: references || application.references,
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

    const application = await prisma.application.findUnique({
      where: { id }
    })
    
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

    await prisma.application.delete({
      where: { id }
    })

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
    return application.job.createdById === user.id
  }
  
  if (user.role === 'APPLICANT') {
    // Applicants can only access their own applications
    return application.applicantId === user.id
  }
  
  return false
}