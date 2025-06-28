export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import getDatabase from '@/lib/neon'

export async function GET(request: NextRequest) {
  try {
    // Ambil cookie dari request (bukan next/headers)
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie)
    const userId = session.userId

    const db = await getDatabase()
    const result = await db.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const user = result.rows[0]
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 })
  }
} 