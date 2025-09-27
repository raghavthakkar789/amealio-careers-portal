import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/applications/[id]/applicant - Get complete applicant details for an application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id: applicationId } = resolvedParams
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only HR and ADMIN can view applicant details
    if (session.user?.role !== 'HR' && session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            address: true,
            dateOfBirth: true,
            linkedinProfile: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true
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

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Format the response with all applicant and application details
    const applicantDetails = {
      // Personal Information
      personalInfo: {
        id: application.applicant.id,
        firstName: application.applicant.firstName,
        lastName: application.applicant.lastName,
        fullName: `${application.applicant.firstName} ${application.applicant.lastName}`,
        email: application.applicant.email,
        phoneNumber: application.applicant.phoneNumber,
        address: application.applicant.address,
        dateOfBirth: application.applicant.dateOfBirth,
        linkedinProfile: application.applicant.linkedinProfile,
        profileImage: application.applicant.profileImage,
        accountCreated: application.applicant.createdAt,
        lastUpdated: application.applicant.updatedAt
      },
      
      // Application Information
      applicationInfo: {
        id: application.id,
        jobTitle: application.jobTitle,
        employmentType: application.employmentType,
        resumeUrl: application.resumeUrl,
        additionalFiles: application.additionalFiles,
        coverLetter: application.coverLetter,
        expectedSalary: application.expectedSalary,
        experience: application.experience,
        education: application.education,
        skills: application.skills,
        availability: application.availability,
        references: application.references,
        status: application.status,
        submittedAt: application.submittedAt,
        updatedAt: application.updatedAt
      },
      
      // Job Information
      jobInfo: {
        id: application.job.id,
        title: application.job.title,
        department: application.job.department.name
      }
    }

    return NextResponse.json({ applicantDetails })

  } catch (error) {
    console.error('Error fetching applicant details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
