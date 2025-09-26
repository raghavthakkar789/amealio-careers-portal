import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/hr-requests/[id] - Approve or reject HR request
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const session = await getServerSession(authOptions)
    
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

      // Create new HR user
      const newHR = await prisma.user.create({
        data: {
          firstName: hrRequest.firstName,
          lastName: hrRequest.lastName,
          email: hrRequest.email,
          phoneNumber: hrRequest.phoneNumber || '',
          address: '',
          role: 'HR',
          password: password, // In production, this should be hashed
          isActive: true
        }
      })

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    const session = await getServerSession(authOptions)
    
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
