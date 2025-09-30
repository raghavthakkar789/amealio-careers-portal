import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/hr-users/[id] - Get specific HR user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    const hrUser = await prisma.user.findUnique({
      where: { 
        id,
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
        createdAt: true
      }
    })

    if (!hrUser) {
      return NextResponse.json({ error: 'HR user not found' }, { status: 404 })
    }

    return NextResponse.json({ hrUser })

  } catch (error) {
    console.error('Error fetching HR user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/hr-users/[id] - Update HR user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    const body = await request.json()
    const { firstName, lastName, email, phoneNumber, address, linkedinProfile } = body

    const updateData: {
      firstName: string
      lastName: string
      email: string
      phoneNumber?: string
      address?: string
      linkedinProfile?: string
    } = {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      linkedinProfile
    }

    const updatedUser = await prisma.user.update({
      where: { 
        id,
        role: 'HR'
      },
      data: updateData,
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
    })

    return NextResponse.json({ 
      hrUser: updatedUser,
      message: 'HR user updated successfully' 
    })

  } catch (error) {
    console.error('Error updating HR user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/hr-users/[id] - Delete HR user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    // Get user details before deletion
    const user = await prisma.user.findUnique({
      where: { 
        id,
        role: 'HR'
      },
      select: {
        id: true,
        email: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'HR user not found' }, { status: 404 })
    }

    // Delete related HRRequest records by email first
    await prisma.hRRequest.deleteMany({
      where: { email: user.email }
    })

    // Delete user (this will cascade delete related records)
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'HR user deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting HR user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
