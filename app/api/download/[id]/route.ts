import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/neon';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    
    // Get file info from database
    const result = await db.query(
      'SELECT * FROM files WHERE id = $1',
      [params.id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
    
    const file = result.rows[0];
    
    // Update download count
    await db.query(
      'UPDATE files SET download_count = COALESCE(download_count, 0) + 1 WHERE id = $1',
      [params.id]
    );
    
    // Redirect to the actual file URL (Cloudinary/Imgur)
    return NextResponse.redirect(file.url);
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.toString() },
      { status: 500 }
    );
  }
} 