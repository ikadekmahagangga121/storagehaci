'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import FileUpload from '@/components/FileUpload'
import FileList from '@/components/FileList'
import { HardDrive, Upload, Download, Users, Clock, BarChart3, RefreshCw } from 'lucide-react'

interface Stats {
  totalFiles: number
  totalSize: string
  totalDownloads: number
  recentUploads: number
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalFiles: 0,
    totalSize: '0 B',
    totalDownloads: 0,
    recentUploads: 0
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!authLoading) {
      fetchStats()
      // Update every 10 seconds instead of 5 for better performance
      const interval = setInterval(fetchStats, 10000)
      return () => clearInterval(interval)
    }
  }, [authLoading])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        cache: 'no-store'
      })
      const data = await res.json()
      if (!data.success) {
        router.push('/login')
        return
      }
      setUser(data.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
      return
    }
    setAuthLoading(false)
  }

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const res = await fetch('/api/stats', {
        cache: 'no-store'
      })
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setStatsLoading(false)
      setLoading(false)
    }
  }, [])

  const handleRefresh = () => {
    fetchStats()
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Home Storage Server</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Manage your personal file storage.
          </p>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <HardDrive className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Files</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stats.totalFiles
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Storage Used</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                    ) : (
                      stats.totalSize
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Download className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Downloads</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stats.totalDownloads
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Recent Uploads</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stats.recentUploads
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={statsLoading}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                title="Refresh stats"
              >
                <RefreshCw className={`h-4 w-4 text-gray-500 ${statsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <FileUpload onUploadComplete={fetchStats} userId={user?.id} />
          </div>
          {/* File List Section */}
          <div className="lg:col-span-2">
            <FileList onFileChange={fetchStats} />
          </div>
        </div>
      </main>
    </div>
  )
} 