import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/neon';

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();
    const result = await db.query('SELECT * FROM files ORDER BY created_at DESC');
    
    return NextResponse.json({ success: true, files: result.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.toString() }, { status: 500 });
  }
} 