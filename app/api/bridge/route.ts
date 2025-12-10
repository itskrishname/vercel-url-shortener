import { NextRequest, NextResponse } from 'next/server';
import { processBridgeRequest } from '@/lib/bridge';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}

async function handleRequest(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  // Get params from Query String (priority) or JSON body (if POST)
  let providerUrl = searchParams.get('provider') || searchParams.get('apiUrl');
  let providerKey = searchParams.get('key') || searchParams.get('apiToken');
  let destinationUrl = searchParams.get('url') || searchParams.get('destination');

  // If POST, try to read body for missing params
  if (req.method === 'POST' && (!providerUrl || !providerKey || !destinationUrl)) {
    try {
      const body = await req.json();
      if (!providerUrl) providerUrl = body.provider || body.apiUrl;
      if (!providerKey) providerKey = body.key || body.apiToken;
      if (!destinationUrl) destinationUrl = body.url || body.destination;
    } catch (e) {
      // Ignore json parse error
    }
  }

  const host = req.headers.get('host') || 'localhost';
  const protocol = req.headers.get('x-forwarded-proto') || 'http';

  // Cast to string to ensure type safety (though logic handles checks)
  const result = await processBridgeRequest(
      providerUrl as string,
      providerKey as string,
      destinationUrl as string,
      host,
      protocol
  );

  return NextResponse.json(result.data, { status: result.status });
}
