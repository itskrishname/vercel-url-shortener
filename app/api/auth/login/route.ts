import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

// Hardcoded credentials for the "Owner"
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin12345';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { username, password } = body;

    console.log(`[Login] Attempt for user: ${username}`);

    let user;

    // 1. Check if it's the Hardcoded Admin
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        console.log('[Login] Admin credentials matched. Ensuring DB record exists...');

        // Find existing admin or create a new one to ensure we have a real _id
        user = await User.findOne({ username: ADMIN_USER });

        if (!user) {
            console.log('[Login] Creating new Admin User document...');
            const hashedPassword = await bcrypt.hash(ADMIN_PASS, 10);
            user = await User.create({
                username: ADMIN_USER,
                password: hashedPassword,
                role: 'admin',
                app_api_key: nanoid(32),
                external_api_token: '',
                external_domain: ''
            });
        }
    } else {
        // 2. Regular User Login
        user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
    }

    if (user.isSuspended) {
        return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }

    // 3. Generate Token with REAL MongoDB _id
    // This fixes the issue where Admin couldn't own links because they had a fake ID.
    const tokenPayload = {
        userId: user._id.toString(),
        role: user.role || 'user',
        username: user.username
    };

    console.log('[Login] Signing token with payload:', tokenPayload);
    const token = await signToken(tokenPayload);

    const response = NextResponse.json({
        status: 'success',
        role: user.role || 'user',
        username: user.username
    });

    response.cookies.set('token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('[Login] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
