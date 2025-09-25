'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { 
  DocumentTextIcon, 
  EyeIcon, 
  ArrowDownTrayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface FileAccessProps {
  fileId: string
  fileName: string
  fileType?: string
  uploadedAt?: string
  uploadedBy?: string
  className?: string
  showDownload?: boolean
  showPreview?: boolean
}

export function FileAccess({
  fileId,
  fileName,
  fileType = 'application/pdf',
  uploadedAt,
  uploadedBy,
  className = '',
  showDownload = true,
  showPreview = true
}: FileAccessProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleView = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Open file in new tab
      const fileUrl = `/api/files/${fileId}`
      window.open(fileUrl, '_blank')
    } catch (err) {
      setError('Failed to open file')
      console.error('Error opening file:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/files/${fileId}`)
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied')
        } else if (response.status === 404) {
          throw new Error('File not found')
        } else {
          throw new Error('Failed to download file')
        }
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file')
      console.error('Error downloading file:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getFileIcon = () => {
    if (fileType.includes('pdf')) {
      return <DocumentTextIcon className="w-5 h-5 text-red-500" />
    }
    return <DocumentTextIcon className="w-5 h-5 text-blue-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-bg-800 to-bg-850 rounded-lg border border-border p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {getFileIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-high truncate">
              {fileName}
            </p>
            <div className="flex items-center gap-2 text-xs text-text-mid">
              {fileType && (
                <span className="px-2 py-1 bg-primary-800 text-primary-200 rounded">
                  {fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                </span>
              )}
              {uploadedAt && (
                <span>
                  {new Date(uploadedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showPreview && (
            <Button
              onClick={handleView}
              disabled={isLoading}
              variant="secondary"
              className="btn-secondary text-xs px-3 py-1"
            >
              <EyeIcon className="w-4 h-4 mr-1" />
              View
            </Button>
          )}
          
          {showDownload && (
            <Button
              onClick={handleDownload}
              disabled={isLoading}
              variant="secondary"
              className="btn-secondary text-xs px-3 py-1"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              Download
            </Button>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-200 text-xs flex items-center gap-2"
        >
          <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-text-mid flex items-center gap-2"
        >
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </motion.div>
      )}
    </motion.div>
  )
}

// Component for displaying multiple files
interface FileListProps {
  files: Array<{
    id: string
    fileName: string
    fileType?: string
    uploadedAt?: string
    uploadedBy?: string
  }>
  className?: string
  showDownload?: boolean
  showPreview?: boolean
}

export function FileList({ 
  files, 
  className = '', 
  showDownload = true, 
  showPreview = true 
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className={`text-center py-8 text-text-mid ${className}`}>
        <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No files uploaded</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {files.map((file, index) => (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <FileAccess
            fileId={file.id}
            fileName={file.fileName}
            fileType={file.fileType}
            uploadedAt={file.uploadedAt}
            uploadedBy={file.uploadedBy}
            showDownload={showDownload}
            showPreview={showPreview}
          />
        </motion.div>
      ))}
    </div>
  )
}
