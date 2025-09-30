import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/admin/admins/[id] - Get specific admin
export async function GET(
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

    const admin = await prisma.user.findFirst({
      where: {
        id,
        role: 'ADMIN'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    return NextResponse.json({ admin })

  } catch (error) {
    console.error('Error fetching admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/admins/[id] - Update admin
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
    const { firstName, lastName, email, password } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        id,
        role: 'ADMIN'
      }
    })

    if (!existingAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Check if email is being changed and if it's already taken
    if (email !== existingAdmin.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: {
      firstName: string
      lastName: string
      email: string
      password?: string
    } = {
      firstName,
      lastName,
      email
    }

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Update admin
    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json({ 
      admin: updatedAdmin,
      message: 'Admin updated successfully' 
    })

  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/admins/[id] - Delete admin
export async function DELETE(
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

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Check if admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        id,
        role: 'ADMIN'
      }
    })

    if (!existingAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Delete admin
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Admin deleted successfully' })

  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
