import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InviteCode from '@/models/InviteCode';
import { nanoid } from 'nanoid';

// GET: List all codes
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        // In a real app, verify Admin privileges here!
        // We are relying on the client-side "Owner Login" gate + obscurity for this prototype.

        const codes = await InviteCode.find({}).populate('usedBy', 'username').sort({ createdAt: -1 });
        return NextResponse.json({ codes });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Generate a new code
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // Generate a simple 6-char code
        const code = nanoid(6);

        const newCode = await InviteCode.create({
            code
        });

        return NextResponse.json({ code: newCode });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
