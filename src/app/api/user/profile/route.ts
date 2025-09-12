import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { linkedinProfile } = body

    // Validate LinkedIn URL format (optional validation)
    if (linkedinProfile && !linkedinProfile.includes('linkedin.com')) {
      return NextResponse.json(
        { message: 'Please provide a valid LinkedIn profile URL' },
        { status: 400 }
      )
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        linkedinProfile: linkedinProfile || null,
      } as any,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        linkedinProfile: true,
        phoneNumber: true,
        profileImage: true,
      } as any
    })

    return NextResponse.json(
      { 
        message: 'Profile updated successfully',
        user: updatedUser
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        linkedinProfile: true,
        phoneNumber: true,
        profileImage: true,
        createdAt: true,
      } as any
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { user },
      { status: 200 }
    )

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
