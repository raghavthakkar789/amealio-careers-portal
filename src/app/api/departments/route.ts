import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/departments - Get all departments
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== 'HR' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            jobs: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ departments })

  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/departments - Create new department
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== 'HR' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 })
    }

    // Check if department already exists
    const existingDepartment = await prisma.department.findUnique({
      where: { name: name.trim() }
    })

    if (existingDepartment) {
      return NextResponse.json({ error: 'Department with this name already exists' }, { status: 409 })
    }

    // Create new department
    const newDepartment = await prisma.department.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isActive: true
      }
    })

    return NextResponse.json({ 
      department: newDepartment,
      message: 'Department created successfully' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
