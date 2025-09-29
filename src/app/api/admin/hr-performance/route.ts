import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/hr-performance - Get HR performance metrics
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all HR users with their performance metrics
    const hrUsers = await prisma.user.findMany({
      where: {
        role: 'HR'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        isActive: true,
        hrJobs: {
          select: {
            id: true,
            applications: {
              select: {
                id: true,
                submittedAt: true,
                updatedAt: true,
                status: true
              }
            }
          }
        },
        hrReviews: {
          select: {
            id: true,
            overallRating: true,
            createdAt: true
          }
        },
        interviews: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    // Calculate performance metrics for each HR user
    const hrPerformance = hrUsers.map(hr => {
      // Count jobs posted
      const jobsPosted = hr.hrJobs.length

      // Count applicants reviewed (applications that have been updated by this HR)
      const applicantsReviewed = hr.hrJobs.reduce((total, job) => {
        return total + job.applications.filter(app => 
          app.status !== 'PENDING' && app.updatedAt > app.submittedAt
        ).length
      }, 0)

      // Calculate average review time
      const reviewTimes = hr.hrJobs.flatMap(job => 
        job.applications
          .filter(app => app.status !== 'PENDING' && app.updatedAt > app.submittedAt)
          .map(app => {
            const submitted = new Date(app.submittedAt)
            const reviewed = new Date(app.updatedAt)
            return Math.ceil((reviewed.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24))
          })
      )
      
      const averageReviewTime = reviewTimes.length > 0 
        ? Math.round(reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length)
        : 0

      // Count total interviews
      const totalInterviews = hr.interviews.length

      // Calculate average rating from reviews
      const ratings = hr.hrReviews.map(review => review.overallRating)
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0

      return {
        id: hr.id,
        firstName: hr.firstName,
        lastName: hr.lastName,
        email: hr.email,
        createdAt: hr.createdAt,
        isActive: hr.isActive,
        jobsPosted,
        applicantsReviewed,
        averageReviewTime,
        totalInterviews,
        averageRating
      }
    })

    return NextResponse.json({ hrUsers: hrPerformance })

  } catch (error) {
    console.error('Error fetching HR performance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
