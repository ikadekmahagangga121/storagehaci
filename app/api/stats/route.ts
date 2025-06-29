export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import getDatabase from '@/lib/neon';

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Get total files count
    const totalFilesResult = await db.query('SELECT COUNT(*) as count FROM files');
    const totalFiles = parseInt(totalFilesResult.rows[0].count);
    
    // Get total size
    const totalSizeResult = await db.query('SELECT COALESCE(SUM(size), 0) as total FROM files');
    const totalSizeBytes = parseInt(totalSizeResult.rows[0].total);
    
    // Get total downloads
    const totalDownloadsResult = await db.query('SELECT COALESCE(SUM(download_count), 0) as total FROM files');
    const totalDownloads = parseInt(totalDownloadsResult.rows[0].total);
    
    // Get recent uploads (last 24 hours)
    const recentUploadsResult = await db.query(
      'SELECT COUNT(*) as count FROM files WHERE created_at >= NOW() - INTERVAL \'24 hours\''
    );
    const recentUploads = parseInt(recentUploadsResult.rows[0].count);
    
    // Format total size
    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    return NextResponse.json({
      success: true,
      stats: {
        totalFiles,
        totalSize: formatBytes(totalSizeBytes),
        totalDownloads,
        recentUploads
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch stats' 
    }, { status: 500 });
  }
} 