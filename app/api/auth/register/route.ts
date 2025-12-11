import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { username, password, admin_invite_code, external_api_token, external_domain } = body;

    // Validate Admin Invite Code (Hardcoded for now as per plan)
    const VALID_INVITE_CODE = process.env.ADMIN_INVITE_CODE || '12345';

    if (admin_invite_code !== VALID_INVITE_CODE) {
      return NextResponse.json({ error: 'Invalid Admin Password (Invite Code)' }, { status: 403 });
    }

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate App API Key
    const app_api_key = nanoid(32);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      app_api_key,
      external_api_token,
      external_domain,
      role: 'user', // Default role
    });

    return NextResponse.json({ message: 'User registered successfully', apiKey: app_api_key }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
