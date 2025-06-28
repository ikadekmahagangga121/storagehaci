import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/neon';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }
    const db = await getDatabase();
    // Check if email already exists
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
    }
    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    // Insert user
    await db.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [email, hashed]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.toString() }, { status: 500 });
  }
} 