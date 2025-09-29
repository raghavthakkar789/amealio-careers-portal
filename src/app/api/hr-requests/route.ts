import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/hr-requests - Get HR requests based on user role
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user

    if (user.role === 'ADMIN') {
      // Admin can see all HR requests
      const requests = await prisma.hRRequest.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      })
      return NextResponse.json({ requests })
    } else if (user.role === 'HR') {
      // HR can see requests they made
      const requests = await prisma.hRRequest.findMany({
        where: {
          requestedBy: user.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return NextResponse.json({ requests })
    }

    return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  } catch (error) {
    console.error('Error fetching HR requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/hr-requests - Create new HR request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'HR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      department, 
      reason 
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email already exists in users or HR requests
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    const existingRequest = await prisma.hRRequest.findUnique({
      where: { email }
    })

    if (existingUser || existingRequest) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Create new HR request
    const newRequest = await prisma.hRRequest.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber: phoneNumber || null,
        department: department || null,
        reason: reason || null,
        requestedBy: session.user.id,
        requestedByName: session.user.name || 'Unknown HR'
      }
    })

    return NextResponse.json({ 
      request: newRequest,
      message: 'HR request submitted successfully' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating HR request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
