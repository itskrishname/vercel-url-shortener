import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import InviteCode from '@/models/InviteCode';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { username, password, admin_invite_code, external_api_token, external_domain } = body;

    // 1. Validate Invite Code (Database Check)
    // We check if it matches the hardcoded fallback OR a valid unused database code
    const VALID_HARDCODED_CODE = process.env.ADMIN_INVITE_CODE || '12345';
    let usedInviteCodeDoc = null;

    if (admin_invite_code !== VALID_HARDCODED_CODE) {
        // Check DB
        const inviteCode = await InviteCode.findOne({ code: admin_invite_code, isUsed: false });
        if (!inviteCode) {
            return NextResponse.json({ error: 'Invalid or Used Invite Code' }, { status: 403 });
        }
        usedInviteCodeDoc = inviteCode;
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Generate App API Key
    const app_api_key = nanoid(32);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      app_api_key,
      external_api_token,
      external_domain,
      role: 'user',
    });

    // 5. Mark invite code as used if applicable
    if (usedInviteCodeDoc) {
        usedInviteCodeDoc.isUsed = true;
        usedInviteCodeDoc.usedBy = newUser._id;
        await usedInviteCodeDoc.save();
    }

    return NextResponse.json({ message: 'User registered successfully', apiKey: app_api_key }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
