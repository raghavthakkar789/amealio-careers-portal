import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// PUT /api/hr-requests/[id] - Approve or reject HR request
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, password, rejectionReason } = body

    const hrRequest = await prisma.hRRequest.findUnique({
      where: { id }
    })
    
    if (!hrRequest) {
      return NextResponse.json({ error: 'HR request not found' }, { status: 404 })
    }

    if (hrRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }

    if (action === 'APPROVE') {
      if (!password) {
        return NextResponse.json({ error: 'Password required for approval' }, { status: 400 })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: hrRequest.email }
      })

      if (existingUser) {
        return NextResponse.json({ 
          error: 'User with this email already exists' 
        }, { status: 400 })
      }

      // Create new HR user
      const newHR = await prisma.user.create({
        data: {
          firstName: hrRequest.firstName,
          lastName: hrRequest.lastName,
          email: hrRequest.email,
          phoneNumber: hrRequest.phoneNumber || '',
          address: '',
          role: 'HR',
          password: hashedPassword,
          // isActive: true // Commented out account verification requirement
        }
      })

      // Create a job in the specified department to establish HR-department relationship
      if (hrRequest.department) {
        // Find the department by name to get its ID
        const department = await prisma.department.findFirst({
          where: { name: hrRequest.department }
        })
        
        if (department) {
          await prisma.job.create({
            data: {
              title: `HR Management - ${hrRequest.department}`,
              summary: `HR management role for ${hrRequest.department} department`,
              departmentId: department.id,
              createdById: newHR.id,
              employmentTypes: ['FULL_TIME'],
              requiredSkills: ['HR Management', 'Recruitment'],
              applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              isActive: false // This is just for establishing the relationship, not an active job posting
            }
          })
        }
      }

      // Update HR request status
      const updatedRequest = await prisma.hRRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy: session.user.id,
          approvedByName: session.user.name || 'Unknown Admin',
          approvedAt: new Date()
        }
      })

      return NextResponse.json({ 
        request: updatedRequest,
        user: newHR,
        message: 'HR request approved and user created successfully' 
      })

    } else if (action === 'REJECT') {
      const updatedRequest = await prisma.hRRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          approvedBy: session.user.id,
          approvedByName: session.user.name || 'Unknown Admin',
          rejectionReason: rejectionReason || 'No reason provided'
        }
      })

      return NextResponse.json({ 
        request: updatedRequest,
        message: 'HR request rejected successfully' 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error updating HR request:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/hr-requests/[id] - Delete HR request (only by requester or admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hrRequest = await prisma.hRRequest.findUnique({
      where: { id }
    })
    
    if (!hrRequest) {
      return NextResponse.json({ error: 'HR request not found' }, { status: 404 })
    }

    // Check permissions
    if (session.user.role !== 'ADMIN' && hrRequest.requestedBy !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Only allow deletion of pending requests
    if (hrRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Cannot delete processed request' }, { status: 400 })
    }

    await prisma.hRRequest.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'HR request deleted successfully' })

  } catch (error) {
    console.error('Error deleting HR request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
