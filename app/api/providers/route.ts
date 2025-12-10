import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Provider from '@/models/Provider';
import { ADMIN_CREDENTIALS } from '@/lib/auth';

// Helper to check auth
function isAuthenticated(req: NextRequest) {
    const authCookie = req.cookies.get('admin_session');
    return authCookie?.value === 'true';
}

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const providers = await Provider.find({}).sort({ createdAt: -1 });
    return NextResponse.json(providers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    await dbConnect();

    // Check if name exists
    const existing = await Provider.findOne({ name: body.name });
    if (existing) {
        return NextResponse.json({ error: 'A provider with this name already exists' }, { status: 400 });
    }

    const provider = await Provider.create(body);
    return NextResponse.json(provider, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create provider' }, { status: 400 });
  }
}
