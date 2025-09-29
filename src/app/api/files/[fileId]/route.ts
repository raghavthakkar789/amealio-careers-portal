import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const resolvedParams = await params
    const { fileId } = resolvedParams
    
    // Get session
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Allow access to all authenticated users (APPLICANT, HR, ADMIN)
    // All users can view application documents

    // For now, we'll serve files from a local uploads directory
    // In production, this would connect to S3, Google Cloud Storage, or similar
    const uploadsDir = path.join(process.cwd(), 'uploads')
    
    try {
      // Check if uploads directory exists, create if not
      await fs.access(uploadsDir)
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true })
    }

    const filePath = path.join(uploadsDir, fileId)
    
    try {
      // Check if file exists
      await fs.access(filePath)
      
      // Read file
      const fileBuffer = await fs.readFile(filePath)
      
      // Determine content type based on file extension
      const ext = path.extname(fileId).toLowerCase()
      let contentType = 'application/octet-stream'
      
      switch (ext) {
        case '.pdf':
          contentType = 'application/pdf'
          break
        case '.doc':
          contentType = 'application/msword'
          break
        case '.docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          break
        case '.txt':
          contentType = 'text/plain'
          break
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg'
          break
        case '.png':
          contentType = 'image/png'
          break
        case '.gif':
          contentType = 'image/gif'
          break
      }
      
      // Return file with appropriate headers
      return new NextResponse(fileBuffer as BodyInit, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${fileId}"`,
          'Cache-Control': 'public, max-age=3600'
        }
      })
      
    } catch (fileError) {
      console.error('File not found:', filePath)
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get file metadata without downloading
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const resolvedParams = await params
    const { fileId } = resolvedParams
    
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse(null, { status: 401 })
    }

    // Allow access to all authenticated users (APPLICANT, HR, ADMIN)
    // All users can view application documents

    const uploadsDir = path.join(process.cwd(), 'uploads')
    const filePath = path.join(uploadsDir, fileId)
    
    try {
      // Check if file exists
      const stats = await fs.stat(filePath)
      
      // Determine content type based on file extension
      const ext = path.extname(fileId).toLowerCase()
      let contentType = 'application/octet-stream'
      
      switch (ext) {
        case '.pdf':
          contentType = 'application/pdf'
          break
        case '.doc':
          contentType = 'application/msword'
          break
        case '.docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          break
        case '.txt':
          contentType = 'text/plain'
          break
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg'
          break
        case '.png':
          contentType = 'image/png'
          break
        case '.gif':
          contentType = 'image/gif'
          break
      }
      
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': stats.size.toString(),
          'Last-Modified': stats.mtime.toUTCString(),
          'Cache-Control': 'public, max-age=3600'
        }
      })
      
    } catch (fileError) {
      console.error('File not found (HEAD):', filePath)
      return new NextResponse(null, { status: 404 })
    }

  } catch (error) {
    console.error('Error getting file metadata:', error)
    return new NextResponse(null, { status: 500 })
  }
}