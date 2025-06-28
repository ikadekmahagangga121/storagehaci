import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/neon';
import cloudinary from '@/lib/cloudinary';

export const runtime = 'nodejs'; // Pastikan route ini dijalankan di Node.js runtime

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string || '';
    const user_id = formData.get('user_id') as string || '';

    if (!file) return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });

    // Upload ke Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });
    const url = (uploadResult as any).secure_url;

    // Simpan metadata ke Neon PostgreSQL
    const db = await getDatabase();
    const result = await db.query(
      'INSERT INTO files (title, original_name, size, mime_type, url, provider, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at',
      [title, file.name, file.size, file.type, url, 'cloudinary', user_id]
    );

    const meta = {
      id: result.rows[0].id,
      title,
      url,
      provider: 'cloudinary',
      user_id,
      created_at: result.rows[0].created_at,
    };

    return NextResponse.json({ success: true, url, meta });
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.toString() }, { status: 500 });
  }
} 