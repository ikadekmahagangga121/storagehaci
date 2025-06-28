import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true })
    response.cookies.delete('session')
    return response
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 })
  }
} 