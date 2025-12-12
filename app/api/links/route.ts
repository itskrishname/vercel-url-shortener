import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LinkModel from '@/models/Link';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // 1. Authenticate
    const payload = await verifyToken(req);
    if (!payload) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Links for User
    const links = await LinkModel.find({ user: payload.userId }).sort({ createdAt: -1 });

    return NextResponse.json({
      status: 'success',
      links: links
    });

  } catch (error: any) {
    console.error('Fetch Links Error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}
