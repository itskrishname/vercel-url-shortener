import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Link from '@/models/Link';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.isSuspended) {
         return NextResponse.json({ message: 'Account Suspended', suspended: true }, { status: 403 });
    }

    const links = await Link.find({ user: user._id }).sort({ createdAt: -1 });

    return NextResponse.json({
        user,
        links
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
