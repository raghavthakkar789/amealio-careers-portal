import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/departments/[id] - Update department
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== 'HR' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, isActive } = body

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 })
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id }
    })

    if (!existingDepartment) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    // Check if another department with the same name exists
    const duplicateDepartment = await prisma.department.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    })

    if (duplicateDepartment) {
      return NextResponse.json({ error: 'Department with this name already exists' }, { status: 409 })
    }

    // Update department
    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isActive: isActive !== undefined ? isActive : existingDepartment.isActive
      }
    })

    return NextResponse.json({ 
      department: updatedDepartment,
      message: 'Department updated successfully' 
    })

  } catch (error) {
    console.error('Error updating department:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/departments/[id] - Delete department
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== 'HR' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id },
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

    if (!existingDepartment) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    // Check if department has active jobs
    if (existingDepartment._count.jobs > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete department with active job postings. Please close or reassign all jobs in this department first.',
        activeJobsCount: existingDepartment._count.jobs
      }, { status: 409 })
    }

    // Delete department
    await prisma.department.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Department deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
