import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Link from '@/models/Link';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(userPayload.userId).select('-password');
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const links = await Link.find({ user: user._id }).sort({ createdAt: -1 }).limit(50);

    return NextResponse.json({ user, links });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
