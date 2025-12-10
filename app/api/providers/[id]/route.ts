import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Provider from '@/models/Provider';

function isAuthenticated(req: NextRequest) {
    const authCookie = req.cookies.get('admin_session');
    return authCookie?.value === 'true';
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params is a Promise in Next.js 15
) {
  if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await dbConnect();
    const deleted = await Provider.findByIdAndDelete(id);

    if (!deleted) {
        return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 });
  }
}
