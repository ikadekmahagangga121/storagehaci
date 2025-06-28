'use client'

import { useState, useCallback } from 'react'
import { Upload, X, File, CheckCircle, AlertCircle, Music, Video, Phone, Image, FileText } from 'lucide-react'

interface FileUploadProps {
  onUploadComplete?: () => void
  userId?: string | number
}

// File type categories
const FILE_CATEGORIES = {
  music: {
    extensions: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma'],
    icon: Music,
    label: 'Music',
    color: 'text-purple-600'
  },
  video: {
    extensions: ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v'],
    icon: Video,
    label: 'Video',
    color: 'text-red-600'
  },
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg'],
    icon: Image,
    label: 'Image',
    color: 'text-green-600'
  },
  document: {
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.pages'],
    icon: FileText,
    label: 'Document',
    color: 'text-blue-600'
  },
  phone: {
    extensions: ['.3gp', '.amr', '.m4a', '.aac', '.mp4', '.mov', '.jpg', '.jpeg', '.png', '.heic'],
    icon: Phone,
    label: 'Phone',
    color: 'text-orange-600'
  }
}

export default function FileUpload({ onUploadComplete, userId }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, category: string, size: string}>>([])
  const [error, setError] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('auto')

  const getFileCategory = (fileName: string, mimeType: string): string => {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
    for (const [category, config] of Object.entries(FILE_CATEGORIES)) {
      if (config.extensions.includes(extension)) {
        return category
      }
    }
    // Fallback based on MIME type
    if (mimeType.startsWith('audio/')) return 'music'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document'
    return 'other'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCategoryIcon = (category: string) => {
    const IconComponent = FILE_CATEGORIES[category as keyof typeof FILE_CATEGORIES]?.icon || File
    return <IconComponent className="h-4 w-4" />
  }

  const getCategoryColor = (category: string) => {
    return FILE_CATEGORIES[category as keyof typeof FILE_CATEGORIES]?.color || 'text-gray-600'
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    await uploadFiles(files)
  }, [selectedCategory])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    await uploadFiles(files)
  }

  const uploadFiles = async (files: File[]) => {
    setUploading(true)
    setError('')
    const uploaded: Array<{name: string, category: string, size: string}> = []
    try {
      for (const file of files) {
        const category = selectedCategory === 'auto' ? getFileCategory(file.name, file.type) : selectedCategory
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', file.name)
        formData.append('user_id', userId ? String(userId) : '')
        // Step 1: Upload to storage
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        const data = await res.json()
        if (!data.success) {
          setError(data.error || 'Upload failed')
          continue
        }
        uploaded.push({
          name: file.name,
          category: category,
          size: formatFileSize(file.size)
        })
      }
      setUploadedFiles(prev => [...prev, ...uploaded])
      onUploadComplete?.()
    } catch (error) {
      setError(`Upload failed: ${error}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="card">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Upload Files</h3>
        <p className="mt-1 text-sm text-gray-500">
          Drag and drop files here, or click to select files
        </p>
      </div>
      {/* Category Selection */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          File Category
        </label>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="auto">Auto Detect</option>
          <option value="music">Music</option>
          <option value="video">Video</option>
          <option value="image">Image</option>
          <option value="document">Document</option>
          <option value="phone">Phone</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div
        className={`mt-6 border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <input
            type="file"
            multiple
            className="hidden"
            id="file-upload"
            onChange={handleFileSelect}
            disabled={uploading}
            accept="audio/*,video/*,image/*,.pdf,.doc,.docx,.txt,.rtf,.odt,.pages,.3gp,.amr,.heic"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {uploading ? 'Uploading...' : 'Select Files'}
          </label>
        </div>
      </div>
    </div>
  )
} 