import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/oversight/applications - Get all applications with complete details
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const applications = await prisma.application.findMany({
      select: {
        id: true,
        jobTitle: true,
        employmentType: true,
        status: true,
        submittedAt: true,
        updatedAt: true,
        expectedSalary: true,
        experience: true,
        education: true,
        skills: true,
        coverLetter: true,
        resumeUrl: true,
        additionalFiles: true,
        availability: true,
        references: true,
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
            createdAt: true
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
        history: {
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            action: true,
            performedByName: true,
            performedByRole: true,
            notes: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        interviews: {
          select: {
            id: true,
            scheduledAt: true,
            interviewType: true,
            status: true,
            notes: true,
            reviews: {
              select: {
                id: true,
                technicalSkills: true,
                communication: true,
                culturalFit: true,
                overallRating: true,
                comments: true,
                createdAt: true,
                hrReviewer: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: {
            scheduledAt: 'desc'
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return NextResponse.json({ applications })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
