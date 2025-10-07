import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applicationStatusService } from '@/lib/application-status-service'

// POST /api/interviews/[id]/evaluation - Submit interview evaluation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id: interviewId } = resolvedParams
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only HR and ADMIN can submit evaluations
    if (session.user?.role !== 'HR' && session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      overallRating,
      technicalSkills,
      communication,
      culturalFit,
      strengths,
      areasForImprovement,
      comments,
      recommendation,
      additionalNotes,
      hrReviewerId
    } = body

    // Validate required fields
    if (!overallRating || !technicalSkills || !communication || !culturalFit || !comments || !recommendation) {
      return NextResponse.json({ 
        error: 'Missing required fields: overallRating, technicalSkills, communication, culturalFit, comments, and recommendation are required' 
      }, { status: 400 })
    }

    // Validate ratings are between 1-5
    const ratings = [overallRating, technicalSkills, communication, culturalFit]
    if (ratings.some(rating => rating < 1 || rating > 5)) {
      return NextResponse.json({ 
        error: 'All ratings must be between 1 and 5' 
      }, { status: 400 })
    }

    // Get the interview with application details
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          select: {
            id: true,
            status: true,
            applicantId: true
          }
        }
      }
    })

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    // Check if interview is completed
    if (interview.status !== 'COMPLETED') {
      return NextResponse.json({ 
        error: 'Interview must be completed before submitting evaluation' 
      }, { status: 400 })
    }

    // Check if evaluation already exists
    const existingReview = await prisma.interviewReview.findFirst({
      where: {
        interviewId: interviewId,
        hrReviewerId: hrReviewerId
      }
    })

    if (existingReview) {
      return NextResponse.json({ 
        error: 'Evaluation already submitted for this interview' 
      }, { status: 400 })
    }

    // Create interview review and update application status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the interview review
      const review = await tx.interviewReview.create({
        data: {
          interviewId: interviewId,
          hrReviewerId: hrReviewerId,
          technicalSkills: parseInt(technicalSkills),
          communication: parseInt(communication),
          culturalFit: parseInt(culturalFit),
          overallRating: parseInt(overallRating),
          comments: comments,
          recommendation: recommendation
        }
      })

      // Update interview status to completed (if not already)
      await tx.interview.update({
        where: { id: interviewId },
        data: { 
          status: 'COMPLETED',
          notes: `${interview.notes || ''}\n\nEvaluation Notes:\nStrengths: ${strengths}\nAreas for Improvement: ${areasForImprovement}\nAdditional Notes: ${additionalNotes}`.trim()
        }
      })

      // Update application status to ACCEPTED if recommendation is positive
      if (recommendation === 'STRONGLY_RECOMMEND' || recommendation === 'RECOMMEND') {
        await applicationStatusService.updateApplicationStatus({
          applicationId: interview.application.id,
          newStatus: 'ACCEPTED',
          action: 'ACCEPT',
          performedBy: hrReviewerId,
          performedByName: session.user.name || 'Unknown User',
          performedByRole: session.user.role as 'HR' | 'ADMIN',
          notes: `Interview evaluation completed with recommendation: ${recommendation}`
        })
      }

      return review
    })

    // Create notification for the applicant
    await prisma.notification.create({
      data: {
        title: 'Interview Evaluation Completed',
        message: `Your interview evaluation has been completed. ${recommendation === 'STRONGLY_RECOMMEND' || recommendation === 'RECOMMEND' ? 'You have been accepted for the next stage.' : 'Thank you for your time.'}`,
        type: 'in-app',
        userId: interview.application.applicantId,
        applicationId: interview.application.id,
        interviewId: interviewId
      }
    })

    return NextResponse.json({ 
      message: 'Interview evaluation submitted successfully',
      review: result
    })

  } catch (error) {
    console.error('Error submitting interview evaluation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
