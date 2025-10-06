import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/applications/[id]/applicant - Get complete applicant details for an application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id: applicationId } = resolvedParams
    const session = await auth()
    
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
            countryCode: true,
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
        },
        interviews: {
          include: {
            reviews: {
              include: {
                hrReviewer: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                },
                adminReviewer: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
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
        countryCode: application.applicant.countryCode,
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
      },

      // HR Recommendations (from interview reviews)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hrRecommendations: application.interviews.flatMap((interview: any) => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        interview.reviews.map((review: any) => ({
          id: review.id,
          hrName: `${review.hrReviewer.firstName} ${review.hrReviewer.lastName}`,
          hrEmail: review.hrReviewer.email,
          recommendation: review.recommendation as 'HIRE' | 'REJECT' | 'PENDING',
          notes: review.comments || '',
          rating: review.overallRating || 0,
          strengths: [], // These would need to be added to the schema
          concerns: [], // These would need to be added to the schema
          createdAt: review.createdAt
        }))
      ),

      // Interview Reviews
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      interviewReviews: application.interviews.map((interview: any) => ({
        id: interview.id,
        interviewerName: interview.reviews.length > 0 ? 
          `${interview.reviews[0].hrReviewer.firstName} ${interview.reviews[0].hrReviewer.lastName}` : 
          'Unknown',
        interviewerRole: 'HR', // Default role
        interviewType: interview.interviewType,
        overallRating: interview.reviews.length > 0 ? interview.reviews[0].overallRating : 0,
        technicalRating: interview.reviews.length > 0 ? interview.reviews[0].technicalSkills : 0,
        communicationRating: interview.reviews.length > 0 ? interview.reviews[0].communication : 0,
        culturalFitRating: interview.reviews.length > 0 ? interview.reviews[0].culturalFit : 0,
        notes: interview.notes || '',
        strengths: [], // These would need to be added to the schema
        areasForImprovement: [], // These would need to be added to the schema
        recommendation: interview.reviews.length > 0 ? 
          (interview.reviews[0].recommendation as 'HIRE' | 'REJECT' | 'MAYBE' | 'PENDING') : 
          'PENDING',
        interviewDate: interview.scheduledAt,
        duration: 60 // Default duration
      }))
    }

    return NextResponse.json({ applicantDetails })

  } catch (error) {
    console.error('Error fetching applicant details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
