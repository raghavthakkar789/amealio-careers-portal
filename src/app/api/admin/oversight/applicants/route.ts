import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/oversight/applicants - Get all applicants with their applications
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const applicants = await prisma.user.findMany({
      where: {
        role: 'APPLICANT'
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
        applications: {
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
            }
          },
          orderBy: {
            submittedAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ applicants })

  } catch (error) {
    console.error('Error fetching applicants:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
