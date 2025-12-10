import { NextRequest, NextResponse } from 'next/server';
import { processBridgeRequest } from '@/lib/bridge';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    },
  });
}

export async function GET(req: NextRequest) {
  return handleAdapter(req);
}

export async function POST(req: NextRequest) {
  return handleAdapter(req);
}

async function handleAdapter(req: NextRequest) {
  console.log('[API Adapter] Incoming request:', req.url);

  const url = new URL(req.url);
  const searchParams = url.searchParams;

  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
  };

  // The User sends:
  // GET /api?api=FULL_BRIDGE_URL_WITH_PARAMS&url=LONG_URL

  // 1. Get 'api' param which contains the configured Bridge URL
  const nestedApiUrlString = searchParams.get('api');

  // 2. Get 'url' param which is the destination
  const destinationUrl = searchParams.get('url');

  if (!nestedApiUrlString) {
      return NextResponse.json({ error: 'Missing "api" parameter containing the bridge URL.' }, { status: 400, headers });
  }

  // 3. Parse the nested URL to extract provider and key
  let providerUrl = '';
  let providerKey = '';

  try {
      const nestedUrl = new URL(nestedApiUrlString);
      const nestedParams = nestedUrl.searchParams;

      providerUrl = nestedParams.get('provider') || nestedParams.get('apiUrl') || '';
      providerKey = nestedParams.get('key') || nestedParams.get('apiToken') || '';

  } catch (e) {
      return NextResponse.json({ error: 'Invalid "api" parameter. Must be a valid URL.' }, { status: 400, headers });
  }

  if (!providerUrl || !providerKey) {
      // Try to fallback: maybe the user just sent the bridge URL and the params are on THIS request?
      // Check if this request has provider/key
      const fallbackProvider = searchParams.get('provider') || searchParams.get('apiUrl');
      const fallbackKey = searchParams.get('key') || searchParams.get('apiToken');

      if (fallbackProvider && fallbackKey) {
          providerUrl = fallbackProvider;
          providerKey = fallbackKey;
      } else {
          return NextResponse.json({
              error: 'Could not extract "provider" or "key" from the "api" parameter URL, and they were not provided in the main request.',
              received_api_param: nestedApiUrlString
          }, { status: 400, headers });
      }
  }

  if (!destinationUrl) {
       return NextResponse.json({ error: 'Missing "url" parameter (destination).' }, { status: 400, headers });
  }

  // Ensure destination URL has protocol
  if (!destinationUrl.startsWith('http://') && !destinationUrl.startsWith('https://')) {
      destinationUrl = 'http://' + destinationUrl;
  }

  const host = req.headers.get('host') || 'localhost';
  const protocol = req.headers.get('x-forwarded-proto') || 'http';

  const result = await processBridgeRequest(
      providerUrl,
      providerKey,
      destinationUrl,
      host,
      protocol
  );

  return NextResponse.json(result.data, { status: result.status, headers });
}
