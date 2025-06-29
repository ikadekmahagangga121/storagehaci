export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/neon';
import cloudinary from '@/lib/cloudinary';

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  format: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const userId = formData.get('user_id') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise<CloudinaryResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'storage-app',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryResult);
        }
      ).end(buffer);
    });

    if (!uploadResult) {
      throw new Error('Upload failed');
    }

    // Save to database
    const db = await getDatabase();
    const result = await db.query(
      `INSERT INTO files (title, original_name, size, mime_type, url, provider, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id`,
      [
        title || file.name,
        file.name,
        file.size,
        file.type,
        uploadResult.secure_url,
        'cloudinary',
        userId || null
      ]
    );

    return NextResponse.json({
      success: true,
      file: {
        id: result.rows[0].id,
        title: title || file.name,
        original_name: file.name,
        size: file.size,
        mime_type: file.type,
        url: uploadResult.secure_url,
        provider: 'cloudinary'
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Upload failed: ' + (error as Error).message 
    }, { status: 500 });
  }
} 