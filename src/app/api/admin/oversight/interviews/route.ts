import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/oversight/interviews - Get all interviews for admin oversight
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all interviews with detailed information
    const interviews = await prisma.interview.findMany({
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        },
        application: {
          select: {
            id: true,
            jobTitle: true,
            status: true,
            submittedAt: true,
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
        },
        reviews: {
          include: {
            hrReviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            adminReviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    })

    // Transform the data to include HR interviewer information from notes
    const transformedInterviews = interviews.map(interview => {
      // Extract HR interviewer from notes (format: "Interviewer: John Doe (john@email.com)")
      let hrInterviewer = null
      if (interview.notes) {
        const interviewerMatch = interview.notes.match(/Interviewer:\s*(.+?)(?:\n|$)/)
        if (interviewerMatch) {
          const interviewerInfo = interviewerMatch[1]
          const emailMatch = interviewerInfo.match(/\(([^)]+)\)/)
          const nameMatch = interviewerInfo.match(/^([^(]+)/)
          
          hrInterviewer = {
            name: nameMatch ? nameMatch[1].trim() : interviewerInfo.trim(),
            email: emailMatch ? emailMatch[1] : null
          }
        }
      }

      return {
        id: interview.id,
        candidate: {
          id: interview.candidate.id,
          name: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
          email: interview.candidate.email,
          phone: interview.candidate.phoneNumber
        },
        application: {
          id: interview.application.id,
          jobTitle: interview.application.jobTitle,
          status: interview.application.status,
          submittedAt: interview.application.submittedAt,
          department: interview.application.job?.department?.name || 'Unknown'
        },
        interviewDetails: {
          scheduledAt: interview.scheduledAt,
          interviewType: interview.interviewType,
          location: interview.location,
          meetingLink: interview.meetingLink,
          status: interview.status,
          notes: interview.notes
        },
        hrInterviewer,
        reviews: interview.reviews.map(review => ({
          id: review.id,
          hrReviewer: review.hrReviewer,
          adminReviewer: review.adminReviewer,
          technicalSkills: review.technicalSkills,
          communication: review.communication,
          culturalFit: review.culturalFit,
          overallRating: review.overallRating,
          comments: review.comments,
          recommendation: review.recommendation,
          createdAt: review.createdAt
        })),
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt
      }
    })

    return NextResponse.json({ interviews: transformedInterviews })

  } catch (error) {
    console.error('Error fetching interviews for admin oversight:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
