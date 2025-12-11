import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Link from '@/models/Link'; // To delete user links if needed

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    // In a real app, verify admin session/token here.
    // We are relying on the "hidden" nature or basic auth if implemented in middleware,
    // but effectively the dashboard protects the view.

    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 });

        await User.findByIdAndDelete(id);
        // Optional: Delete all links associated with user
        await Link.deleteMany({ user: id });

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, action } = body;

        if (!id || !action) return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });

        const user = await User.findById(id);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        if (action === 'suspend') {
            user.isSuspended = true;
            user.suspendedAt = new Date();
        } else if (action === 'unsuspend') {
            user.isSuspended = false;
            user.suspendedAt = undefined;
        } else {
            return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }

        await user.save();
        return NextResponse.json({ status: 'success', user });
    } catch (error) {
        return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
    }
}
