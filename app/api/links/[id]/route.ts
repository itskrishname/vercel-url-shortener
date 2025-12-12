import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Link from '@/models/Link';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Auth Check
    const token = req.cookies.get('token')?.value;
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // 2. Find and Verify Ownership
    const link = await Link.findById(id);

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Allow Admin to delete ANY link, or User to delete THEIR own link
    if (payload.role !== 'admin' && link.user.toString() !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Delete
    await Link.findByIdAndDelete(id);

    return NextResponse.json({ status: 'success', message: 'Link deleted successfully' });

  } catch (error) {
    console.error('Delete Link Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
