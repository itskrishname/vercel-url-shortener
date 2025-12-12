import { NextRequest, NextResponse } from 'next/server';
import { GET as ShortenGET } from './shorten/route';

// Explicitly wrap the handler to ensure proper context passing
export async function GET(req: NextRequest) {
  return ShortenGET(req);
}
