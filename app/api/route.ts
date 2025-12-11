import { NextRequest, NextResponse } from 'next/server';
import { processBridgeRequest } from '@/lib/bridge';
import dbConnect from '@/lib/db';
import Provider from '@/models/Provider';

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

  // 1. Get 'api' param (case-insensitive)
  const apiParam = searchParams.get('api') || searchParams.get('Api');

  // 2. Get 'url' param which is the destination
  const destinationUrl = searchParams.get('url');

  if (!apiParam && !searchParams.get('key')) {
      return NextResponse.json({ status: 'error', message: 'Missing "api" or "key" parameter.' }, { status: 400, headers });
  }

  if (!destinationUrl) {
       return NextResponse.json({ status: 'error', message: 'Missing "url" parameter (destination).' }, { status: 400, headers });
  }

  // 3. Determine Provider Info
  let providerUrl = '';
  let providerKey = '';

  // STRATEGY A: Check if 'api' param is a Database ID (Virtual Key)
  if (apiParam && !apiParam.includes('://')) {
      const explicitProvider = searchParams.get('provider') || searchParams.get('apiUrl');

      if (!explicitProvider) {
          try {
              await dbConnect();
              // Assuming 24-char hex string is a mongo id
              if (apiParam.match(/^[0-9a-fA-F]{24}$/)) {
                  const provider = await Provider.findById(apiParam);
                  if (provider) {
                      console.log(`[API Adapter] Found Saved Provider: ${provider.name}`);
                      providerUrl = provider.apiUrl;
                      providerKey = provider.apiToken;
                  }
              }
          } catch (e) {
              console.error('[API Adapter] DB Lookup Error:', e);
          }
      }
  }

  // STRATEGY B: Fallback to Legacy Nested URL Parsing
  if (!providerUrl || !providerKey) {
      if (apiParam && apiParam.includes('://')) {
          try {
            const nestedUrl = new URL(apiParam);
            const nestedParams = nestedUrl.searchParams;

            providerUrl = nestedParams.get('provider') || nestedParams.get('apiUrl') || '';
            providerKey = nestedParams.get('key') || nestedParams.get('apiToken') || '';
            console.log('[API Adapter] Parsed nested URL strategy');
          } catch (e) {
            // Ignore
          }
      }
  }

  // STRATEGY C: Explicit Parameters in current request
  if (!providerUrl || !providerKey) {
      providerUrl = searchParams.get('provider') || searchParams.get('apiUrl') || '';
      providerKey = searchParams.get('key') || searchParams.get('apiToken') || apiParam || '';
  }

  // Final Validation
  if (!providerUrl || !providerKey) {
       return NextResponse.json({
          status: 'error',
          message: 'Invalid Configuration. Could not resolve a Provider.',
      }, { status: 400, headers });
  }

  // Ensure destination URL has protocol
  let finalDestination = destinationUrl;
  if (!finalDestination.startsWith('http://') && !finalDestination.startsWith('https://')) {
      finalDestination = 'http://' + finalDestination;
  }

  const host = req.headers.get('host') || 'localhost';
  const protocol = req.headers.get('x-forwarded-proto') || 'http';

  const result = await processBridgeRequest(
      providerUrl,
      providerKey,
      finalDestination,
      host,
      protocol
  );

  // Transform result to match requested format:
  if (result.status >= 200 && result.status < 300) {
      return NextResponse.json({
          status: 'success',
          shortenedUrl: result.data.vercel_link,
          original_url: finalDestination, // Added field
      }, { status: 200, headers });
  } else {
      const errorMessage = result.data.error || 'An unknown error occurred.';
      return NextResponse.json({
          status: 'error',
          message: errorMessage
      }, { status: result.status, headers });
  }
}
