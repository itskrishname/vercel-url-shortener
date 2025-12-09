import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Link from '@/models/Link';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    // Sort by newest first
    const links = await Link.find({}).sort({ createdAt: -1 }).limit(50);

    return NextResponse.json({ links });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching links' }, { status: 500 });
  }
}
