export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/neon';

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();
    const result = await db.query(`
      SELECT 
        id,
        title,
        original_name,
        size,
        mime_type,
        url,
        provider,
        user_id,
        download_count,
        created_at
      FROM files 
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json({
      success: true,
      files: result.rows
    });
  } catch (error) {
    console.error('Files fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch files' 
    }, { status: 500 });
  }
} 