import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { validateEmail } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password,
      department,
    } = body

    // Validation
    if (!firstName || !lastName || !email || !password || !department) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create HR user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'HR',
        // Additional HR-specific fields can be added here
      }
    })

    // Create a job in the specified department to establish HR-department relationship
    if (department) {
      // Find the department by name to get its ID
      const departmentRecord = await prisma.department.findFirst({
        where: { name: department }
      })
      
      if (departmentRecord) {
        await prisma.job.create({
          data: {
            title: `HR Management - ${department}`,
            summary: `HR management role for ${department} department`,
            departmentId: departmentRecord.id,
            createdById: user.id,
            employmentTypes: ['FULL_TIME'],
            requiredSkills: ['HR Management', 'Recruitment'],
            applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            isActive: false // This is just for establishing the relationship, not an active job posting
          }
        })
      }
    }

    // Remove password from response
    const { password: _password, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'HR user created successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('HR user creation error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        message: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
