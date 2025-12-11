import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Link from '@/models/Link';

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    await dbConnect();
    const token = (await params).token; // Await params in Next.js 15

    const link = await Link.findOne({ localToken: token });

    if (!link) {
        return new NextResponse('Link not found', { status: 404 });
    }

    // Increment visits (async, don't wait)
    Link.updateOne({ _id: link._id }, { $inc: { visits: 1 } }).exec();

    // Redirect to ORIGINAL URL
    return NextResponse.redirect(link.originalUrl);

  } catch (error) {
    console.error('Redirect Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
