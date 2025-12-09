import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Link from '@/models/Link';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { originalUrl, externalShortUrl } = body;

    await dbConnect();

    // The 'id' in the route is actually the token in our list logic,
    // but Mongoose might need the _id.
    // However, the dashboard logic is likely passing the token or _id.
    // Let's assume we want to update by Token since that's the unique public ID,
    // or by _id.

    // Check if the input looks like an ObjectID or Token.
    // Safer to find by token if the ID param is short, or by _id if long.
    // But let's check both or update query.

    let updatedLink;
    if (id.length === 24) {
         updatedLink = await Link.findByIdAndUpdate(id, { originalUrl, externalShortUrl }, { new: true });
    } else {
         updatedLink = await Link.findOneAndUpdate({ token: id }, { originalUrl, externalShortUrl }, { new: true });
    }

    if (!updatedLink) {
      return NextResponse.json({ message: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, link: updatedLink });

  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
