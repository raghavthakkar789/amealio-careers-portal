import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// PUT /api/admin/hr-users/[id]/password - Change HR user password
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
    const { password } = body

    if (!password || password.trim().length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if user exists and is HR
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'HR') {
      return NextResponse.json({ error: 'User is not an HR member' }, { status: 400 })
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password.trim(), 12)
    
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword
      }
    })

    return NextResponse.json({ 
      message: 'Password updated successfully',
      user: {
        id: user.id,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
