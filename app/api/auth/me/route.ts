export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import getDatabase from '@/lib/neon'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
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