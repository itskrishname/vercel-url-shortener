import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
      status: 'ok',
      message: 'API is reachable',
      timestamp: new Date().toISOString()
  }, {
      headers: {
          'Access-Control-Allow-Origin': '*'
      }
  });
}
