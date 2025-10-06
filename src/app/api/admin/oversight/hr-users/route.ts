import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/oversight/hr-users - Get all HR users with performance metrics
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hrUsers = await prisma.user.findMany({
      where: {
        role: 'HR'
      },
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
        hrJobs: {
          select: {
            id: true,
            title: true,
            department: {
              select: {
                name: true
              }
            },
            applications: {
              select: {
                id: true,
                status: true,
                submittedAt: true,
                updatedAt: true
              }
            },
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        hrReviews: {
          select: {
            id: true,
            technicalSkills: true,
            communication: true,
            culturalFit: true,
            overallRating: true,
            comments: true,
            createdAt: true,
            interview: {
              select: {
                candidate: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                },
                application: {
                  select: {
                    jobTitle: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate performance metrics for each HR user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hrUsersWithMetrics = hrUsers.map((hr: any) => {
      // Calculate applications reviewed
      const applicationsReviewed = hr.hrJobs?.reduce((total: number, job: { applications: { length: number } }) => {
        return total + job.applications.length
      }, 0) || 0

      // Calculate average review time
      let totalReviewTime = 0
      let reviewCount = 0
      
      hr.hrJobs?.forEach((job: { applications: { status: string; updatedAt: Date | string; submittedAt: Date | string }[] }) => {
        job.applications.forEach((app: { status: string; updatedAt: Date | string; submittedAt: Date | string }) => {
          if (app.status === 'REJECTED' || app.status === 'HIRED' || app.status === 'ACCEPTED') {
            const reviewTime = Math.floor(
              (new Date(app.updatedAt).getTime() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
            )
            totalReviewTime += reviewTime
            reviewCount++
          }
        })
      })

      const averageReviewTime = reviewCount > 0 ? Math.round(totalReviewTime / reviewCount) : 0

      return {
        ...hr,
        applicationsReviewed,
        averageReviewTime
      }
    })

    return NextResponse.json({ hrUsers: hrUsersWithMetrics })

  } catch (error) {
    console.error('Error fetching HR users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
