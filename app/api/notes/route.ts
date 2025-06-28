import { NextRequest, NextResponse } from 'next/server'
import getDatabase from '@/lib/neon'

// POST: Tambah catatan baru
export async function POST(req: NextRequest) {
  try {
    const { title, content, user_id } = await req.json()
    const db = await getDatabase()
    
    const result = await db.query(
      'INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING id',
      [title, content, user_id]
    )
    
    return NextResponse.json({ success: true, insertedId: result.rows[0].id })
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.toString() }, { status: 500 })
  }
}

// GET: Ambil semua catatan
export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase()
    const result = await db.query('SELECT * FROM notes ORDER BY created_at DESC')
    
    return NextResponse.json({ success: true, notes: result.rows })
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.toString() }, { status: 500 })
  }
} 