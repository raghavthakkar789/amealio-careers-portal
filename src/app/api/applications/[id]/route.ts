import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applicationStatusService } from '@/lib/application-status-service'
import { promises as fs } from 'fs'
import path from 'path'

// GET /api/applications/[id] - Get specific application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const session = await auth()
    
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
    const session = await auth()
    
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

    const contentType = request.headers.get('content-type')
    
    // Handle status updates (JSON)
    if (contentType?.includes('application/json')) {
      const body = await request.json()
      const { status, action, notes } = body

      console.log('Status update request:', {
        applicationId: id,
        status,
        action,
        notes,
        performedBy: session.user.id,
        performedByName: session.user.name,
        performedByRole: session.user.role
      })

      if (status && action) {
        try {
          // Update application status using the new service
          const updatedApplication = await applicationStatusService.updateApplicationStatus({
            applicationId: id,
            newStatus: status,
            action,
            performedBy: session.user.id,
            performedByName: session.user.name || 'Unknown User',
            performedByRole: session.user.role as 'APPLICANT' | 'HR' | 'ADMIN',
            notes
          })

          console.log('Status update successful:', {
            applicationId: id,
            newStatus: status,
            action
          })

          return NextResponse.json({ 
            application: updatedApplication,
            message: 'Application status updated successfully' 
          })
        } catch (statusUpdateError) {
          console.error('Status update failed:', {
            applicationId: id,
            status,
            action,
            error: statusUpdateError instanceof Error ? statusUpdateError.message : statusUpdateError,
            stack: statusUpdateError instanceof Error ? statusUpdateError.stack : undefined
          })
          
          return NextResponse.json({ 
            error: statusUpdateError instanceof Error ? statusUpdateError.message : 'Failed to update application status'
          }, { status: 400 })
        }
      } else {
        console.error('Missing required fields for status update:', {
          applicationId: id,
          status,
          action,
          hasStatus: !!status,
          hasAction: !!action
        })
        
        return NextResponse.json({ 
          error: 'Missing required fields: status and action are required' 
        }, { status: 400 })
      }
    }

    // Handle FormData for application content updates
    const formData = await request.formData()
    const coverLetter = formData.get('coverLetter') as string
    const experience = formData.get('experience') as string
    const education = formData.get('education') as string
    const skills = formData.get('skills') as string
    const availability = formData.get('availability') as string
    const expectedSalary = formData.get('expectedSalary') as string
    const references = formData.get('references') as string
    const resumeFile = formData.get('resume') as File

    // Handle file uploads
    const uploadsDir = path.join(process.cwd(), 'uploads')
    
    // Ensure uploads directory exists
    try {
      await fs.access(uploadsDir)
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true })
    }

    let resumeUrl = application.resumeUrl
    let additionalFiles = application.additionalFiles
    
    // Handle resume file update
    if (resumeFile && resumeFile.size > 0) {
      const resumeFileName = `${application.applicantId}_${Date.now()}_resume.${resumeFile.name.split('.').pop()}`
      const resumePath = path.join(uploadsDir, resumeFileName)
      
      const resumeBuffer = await resumeFile.arrayBuffer()
      await fs.writeFile(resumePath, Buffer.from(resumeBuffer))
      resumeUrl = resumeFileName
    }

    // Handle additional files update
    const newAdditionalFiles: string[] = []
    for (let i = 0; i < 10; i++) { // Support up to 10 additional files
      const additionalFile = formData.get(`additionalFile_${i}`) as File
      if (additionalFile && additionalFile.size > 0) {
        const additionalFileName = `${application.applicantId}_${Date.now()}_additional_${i}.${additionalFile.name.split('.').pop()}`
        const additionalPath = path.join(uploadsDir, additionalFileName)
        
        const additionalBuffer = await additionalFile.arrayBuffer()
        await fs.writeFile(additionalPath, Buffer.from(additionalBuffer))
        newAdditionalFiles.push(additionalFileName)
      }
    }
    
    // If new additional files were uploaded, replace the existing ones
    if (newAdditionalFiles.length > 0) {
      additionalFiles = newAdditionalFiles
    }

    // Update application content
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
        resumeUrl,
        additionalFiles,
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
    const session = await auth()
    
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
async function checkApplicationAccess(user: {
  id: string
  role: string
}, application: {
  applicantId: string
  job: {
    createdById: string
  }
}): Promise<boolean> {
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