import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { linkedinProfile, linkedinUrl, portfolioUrl, firstName, lastName, phoneNumber, countryCode, address } = body

    // Use linkedinProfile, linkedinUrl, or portfolioUrl (whichever is provided)
    const finalLinkedinProfile = linkedinProfile || linkedinUrl || portfolioUrl

    // Validate LinkedIn URL format (optional validation)
    if (finalLinkedinProfile && !finalLinkedinProfile.includes('linkedin.com')) {
      return NextResponse.json(
        { message: 'Please provide a valid LinkedIn profile URL' },
        { status: 400 }
      )
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        linkedinProfile: finalLinkedinProfile || null,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phoneNumber: phoneNumber || undefined,
        countryCode: countryCode || undefined,
        address: address || undefined,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        linkedinProfile: true,
        phoneNumber: true,
        countryCode: true,
        address: true,
        profileImage: true,
      }
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

export async function GET() {
  try {
    const session = await auth()
    
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
        countryCode: true,
        address: true,
        profileImage: true,
        createdAt: true,
      }
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
