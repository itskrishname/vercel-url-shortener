import { NextRequest, NextResponse } from 'next/server';
import { processBridgeRequest } from '@/lib/bridge';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleAdapter(req);
}

export async function POST(req: NextRequest) {
  return handleAdapter(req);
}

async function handleAdapter(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  // The User sends:
  // GET /api?api=FULL_BRIDGE_URL_WITH_PARAMS&url=LONG_URL

  // 1. Get 'api' param which contains the configured Bridge URL
  const nestedApiUrlString = searchParams.get('api');

  // 2. Get 'url' param which is the destination
  const destinationUrl = searchParams.get('url');

  if (!nestedApiUrlString) {
      return NextResponse.json({ error: 'Missing "api" parameter containing the bridge URL.' }, { status: 400 });
  }

  // 3. Parse the nested URL to extract provider and key
  let providerUrl = '';
  let providerKey = '';

  try {
      const nestedUrl = new URL(nestedApiUrlString);
      const nestedParams = nestedUrl.searchParams;

      providerUrl = nestedParams.get('provider') || nestedParams.get('apiUrl') || '';
      providerKey = nestedParams.get('key') || nestedParams.get('apiToken') || '';

      // Fallback: If the user didn't put params in the URL but maybe expected us to just work?
      // But based on the error log, the params ARE in the URL:
      // api=.../api/bridge?provider=...&key=...

  } catch (e) {
      return NextResponse.json({ error: 'Invalid "api" parameter. Must be a valid URL.' }, { status: 400 });
  }

  if (!providerUrl || !providerKey) {
      return NextResponse.json({
          error: 'Could not extract "provider" or "key" from the "api" parameter URL.',
          received_api_param: nestedApiUrlString
      }, { status: 400 });
  }

  if (!destinationUrl) {
       return NextResponse.json({ error: 'Missing "url" parameter (destination).' }, { status: 400 });
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

  return NextResponse.json(result.data, { status: result.status });
}
