import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/neon';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }
    const db = await getDatabase();
    const userResult = await db.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }
    const user = userResult.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }
    // Set session cookie (simple, not JWT for now)
    const cookie = serialize('session', JSON.stringify({ userId: user.id }), {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.toString() }, { status: 500 });
  }
} 