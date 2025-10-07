import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applicationStatusService } from '@/lib/application-status-service'
import { emailService } from '@/lib/email-service'

// GET /api/interviews - Get interviews based on user role
export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user
    let whereClause: {
      application?: {
        job: {
          createdById: string
        }
      }
      applicantId?: string
      candidateId?: string
      reviews?: {
        some: {
          hrReviewerId: string
        }
      }
    } = {}

    if (user.role === 'ADMIN') {
      // Admin can see all interviews
      whereClause = {}
    } else if (user.role === 'HR') {
      // HR can see interviews they scheduled (through reviews)
      whereClause.reviews = {
        some: {
          hrReviewerId: user.id
        }
      }
    } else if (user.role === 'APPLICANT') {
      // Applicants can see their own interviews
      whereClause.candidateId = user.id
    }

    const interviews = await prisma.interview.findMany({
      where: whereClause,
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        application: {
          select: {
            id: true,
            jobTitle: true,
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
            }
          }
        }
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    })

    return NextResponse.json({ interviews })

  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/interviews - Create new interview
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user?.role !== 'HR' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      applicantName,
      applicantEmail,
      jobTitle,
      department,
      interviewDate,
      interviewTime,
      duration,
      type,
      location,
      meetingLink,
      interviewer,
      interviewerId,
      interviewerName,
      notes
    } = body

    // Validate required fields
    if (!applicantName || !applicantEmail || !jobTitle || !interviewDate || !interviewTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find candidate by email
    const candidate = await prisma.user.findUnique({
      where: { email: applicantEmail }
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // Find application by candidate and job title
    const application = await prisma.application.findFirst({
      where: {
        applicantId: candidate.id,
        jobTitle: jobTitle
      },
      include: {
        job: true
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Create scheduled date
    const scheduledAt = new Date(`${interviewDate}T${interviewTime}`)

    // Prepare interviewer information
    let interviewerInfo = interviewer || interviewerName
    if (interviewerId && session.user?.role === 'ADMIN') {
      // If admin selected an HR user, get their details
      const selectedHr = await prisma.user.findUnique({
        where: { id: interviewerId },
        select: { firstName: true, lastName: true, email: true }
      })
      if (selectedHr) {
        interviewerInfo = `${selectedHr.firstName} ${selectedHr.lastName} (${selectedHr.email})`
      }
    }

    // Combine notes with interviewer information
    const combinedNotes = [
      notes,
      `Interviewer: ${interviewerInfo}`
    ].filter(Boolean).join('\n\n')

    // Create new interview and update application status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create new interview
      const newInterview = await tx.interview.create({
        data: {
          applicationId: application.id,
          candidateId: candidate.id,
          scheduledAt,
          interviewType: type || 'VIDEO',
          location: location || null,
          meetingLink: meetingLink || null,
          notes: combinedNotes,
          status: 'SCHEDULED'
        },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          application: {
            select: {
              id: true,
              jobTitle: true,
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
              }
            }
          }
        }
      })

      // Update application status to INTERVIEW_SCHEDULED
      await applicationStatusService.updateApplicationStatus({
        applicationId: application.id,
        newStatus: 'INTERVIEW_SCHEDULED',
        action: 'SCHEDULE_INTERVIEW',
        performedBy: session.user.id,
        performedByName: session.user.name || 'Unknown User',
        performedByRole: session.user.role as 'HR' | 'ADMIN',
        notes: `Interview scheduled for ${interviewDate} at ${interviewTime}`
      })

      return newInterview
    })

    // Send interview scheduled email notification
    try {
      await emailService.sendInterviewScheduledEmail(application.id, result.id)
      console.log('Interview scheduled email sent successfully')
    } catch (emailError) {
      console.error('Failed to send interview scheduled email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      interview: result,
      message: 'Interview scheduled successfully' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating interview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
