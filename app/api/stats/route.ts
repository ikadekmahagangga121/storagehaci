import { NextResponse } from 'next/server';
import getDatabase from '@/lib/neon';

export async function GET() {
  const db = await getDatabase();
  // Query all stats and log raw results for debugging
  const totalFilesResult = await db.query('SELECT COUNT(*) as count FROM files');
  const totalSizeResult = await db.query('SELECT SUM(size) as total FROM files');
  const totalDownloadsResult = await db.query('SELECT SUM(download_count) as total FROM files');
  const recentUploadsResult = await db.query(`SELECT COUNT(*) as count FROM files WHERE created_at > NOW() - INTERVAL '1 day'`);

  // Debug log
  console.log('totalFilesResult:', totalFilesResult.rows);
  console.log('totalSizeResult:', totalSizeResult.rows);
  console.log('totalDownloadsResult:', totalDownloadsResult.rows);
  console.log('recentUploadsResult:', recentUploadsResult.rows);

  const totalFiles = Number(totalFilesResult.rows[0]?.count || 0);
  const totalSize = Number(totalSizeResult.rows[0]?.total || 0);
  const totalDownloads = Number(totalDownloadsResult.rows[0]?.total || 0);
  const recentUploads = Number(recentUploadsResult.rows[0]?.count || 0);

  return NextResponse.json({
    totalFiles, totalSize, totalDownloads, recentUploads,
    debug: {
      totalFilesResult: totalFilesResult.rows,
      totalSizeResult: totalSizeResult.rows,
      totalDownloadsResult: totalDownloadsResult.rows,
      recentUploadsResult: recentUploadsResult.rows
    }
  });
} 