import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LinkModel from '@/models/Link';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // 1. Authenticate user from cookie/header
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. Find the link
    const link = await LinkModel.findById(id);
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // 3. Verify ownership
    if (link.user.toString() !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Delete the link
    await LinkModel.deleteOne({ _id: id });

    return NextResponse.json({ message: 'Link deleted successfully' });
  } catch (error: any) {
    console.error('Delete Link Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
