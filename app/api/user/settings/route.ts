import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    // Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) {
        return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
    }

    const body = await req.json();
    const { external_api_token, external_domain } = body;

    if (!external_api_token || !external_domain) {
        return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    await User.findByIdAndUpdate(decoded.userId, {
        external_api_token,
        external_domain
    });

    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
