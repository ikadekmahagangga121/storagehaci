import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/neon';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    
    // Get file info first
    const fileResult = await db.query(
      'SELECT * FROM files WHERE id = $1',
      [params.id]
    );
    
    if (fileResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
    
    const file = fileResult.rows[0];
    
    // Delete from database
    await db.query(
      'DELETE FROM files WHERE id = $1',
      [params.id]
    );
    
    // Note: For now, we're only deleting from database
    // In a production app, you might want to also delete from Cloudinary/Imgur
    // This would require additional API calls to those services
    
    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully',
      deletedFile: file
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.toString() },
      { status: 500 }
    );
  }
} 