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
        const userPayload = await verifyToken(req);
        if (!userPayload) {
            return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Ensure the link belongs to the user
        const link = await LinkModel.findOne({ _id: id, user: userPayload.userId });

        if (!link) {
            return NextResponse.json({ status: 'error', message: 'Link not found or not owned by user' }, { status: 404 });
        }

        await LinkModel.deleteOne({ _id: id });

        return NextResponse.json({ status: 'success', message: 'Link deleted' });
    } catch (error) {
        console.error('Delete Link Error:', error);
        return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
    }
}
