'use client'

import { useState, useEffect } from 'react'
import { File, Download, Trash2, Eye, AlertCircle, Music, Video, Phone, Image, FileText, Filter, Grid, List } from 'lucide-react'

interface FileItem {
  id: string
  title?: string
  name?: string
  original_name?: string
  size?: number
  mime_type?: string
  created_at?: string
  download_count?: number
  is_public?: boolean
  category?: string
  url?: string
  provider?: string
}

const CATEGORY_ICONS = {
  music: Music,
  video: Video,
  image: Image,
  document: FileText,
  phone: Phone,
  other: File
}

const CATEGORY_COLORS = {
  music: 'text-purple-600 bg-purple-100',
  video: 'text-red-600 bg-red-100',
  image: 'text-green-600 bg-green-100',
  document: 'text-blue-600 bg-blue-100',
  phone: 'text-orange-600 bg-orange-100',
  other: 'text-gray-600 bg-gray-100'
}

const ITEMS_PER_PAGE = 20

export default function FileList() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchFiles()
    // eslint-disable-next-line
  }, [page])

  const fetchFiles = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/files')
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Gagal mengambil data file')
        setFiles([])
        setHasMore(false)
      } else {
        setFiles(data.files)
        setHasMore(data.files.length === ITEMS_PER_PAGE)
      }
    } catch (error) {
      setError('Fetch error: ' + error)
    }
    setLoading(false)
  }

  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      setError('')
      // Trigger download through our API
      const response = await fetch(`/api/download/${fileId}`)
      
      if (response.ok) {
        // Get the file blob
        const blob = await response.blob()
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        // Clean up
        window.URL.revokeObjectURL(url)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Gagal download file')
      }
    } catch (error) {
      setError('Download error: ' + error)
    }
  }

  const deleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Yakin ingin menghapus file "${fileName}"?`)) return
    
    try {
      setError('')
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Refresh file list
        fetchFiles()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Gagal hapus file')
      }
    } catch (error) {
      setError('Delete error: ' + error)
    }
  }

  const getFileCategory = (fileName: string, mimeType: string): string => {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
    
    if (['.mp3', '.wav', '.flac', '.aac'].includes(extension)) return 'music'
    if (['.mp4', '.avi', '.mov', '.mkv'].includes(extension)) return 'video'
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) return 'image'
    if (['.pdf', '.doc', '.docx', '.txt'].includes(extension)) return 'document'
    if (['.apk', '.ipa'].includes(extension)) return 'phone'
    
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
    const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || File
    return <IconComponent className="h-4 w-4" />
  }

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'text-gray-600 bg-gray-100'
  }

  const filteredFiles = files.filter(file => {
    const category = getFileCategory(file.original_name || '', file.mime_type || '')
    const matchesCategory = selectedCategory === 'all' || category === selectedCategory
    const matchesSearch = file.original_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.title?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading files...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            <option value="music">Music</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
            <option value="document">Document</option>
            <option value="phone">Phone</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {viewMode === 'list' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* File List */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No files found
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
          {filteredFiles.map((file) => {
            const category = getFileCategory(file.original_name || '', file.mime_type || '')
            return (
              <div
                key={file.id}
                className={`p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow ${
                  viewMode === 'grid' ? '' : 'flex items-center justify-between'
                }`}
              >
                <div className={`${viewMode === 'grid' ? 'space-y-2' : 'flex items-center space-x-3'}`}>
                  <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                    {getCategoryIcon(category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {file.title || file.original_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size || 0)} • {file.provider}
                    </p>
                    {file.download_count !== undefined && (
                      <p className="text-xs text-gray-400">
                        Downloaded {file.download_count} times
                      </p>
                    )}
                  </div>
                </div>

                <div className={`flex items-center gap-2 ${viewMode === 'grid' ? 'mt-3' : ''}`}>
                  <button
                    onClick={() => downloadFile(file.id, file.original_name || 'file')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  
                  {file.url && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  )}
                  
                  <button
                    onClick={() => deleteFile(file.id, file.original_name || 'file')}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
} 