import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { username, password } = await req.json();

    // 1. Hardcoded Admin Check (Backdoor for Owner)
    if (username === 'admin' && password === 'admin12345') {
        const token = signToken({
            userId: 'admin-static-id',
            username: 'admin',
            role: 'admin',
        });
        const response = NextResponse.json({ message: 'Owner Login successful', role: 'admin' });
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });
        return response;
    }

    // 2. Regular DB Login
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({ message: 'Login successful', role: user.role });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
