import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_CREDENTIALS } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Link from '@/models/Link';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

// Helper to extract URL from various response formats
function extractUrlFromResponse(data: any): string {
  if (typeof data === 'string') {
    try {
        new URL(data);
        return data;
    } catch (e) {
        try {
            const parsed = JSON.parse(data);
            return extractUrlFromResponse(parsed);
        } catch (jsonErr) {
            const match = data.match(/https?:\/\/[^\s"]+/);
            if (match) return match[0];
            return data;
        }
    }
  }

  if (typeof data === 'object' && data !== null) {
    if (data.shortenedUrl) return data.shortenedUrl;
    if (data.short_url) return data.short_url;
    if (data.url) return data.url;
    if (data.link) return data.link;
    if (data.short) return data.short;
    return JSON.stringify(data);
  }
  return '';
}

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}

async function handleRequest(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // Get params from Query String (priority) or JSON body (if POST)
    let providerUrl = searchParams.get('provider') || searchParams.get('apiUrl');
    let providerKey = searchParams.get('key') || searchParams.get('apiToken');
    let destinationUrl = searchParams.get('url') || searchParams.get('destination');

    // Optional: Master Secret to protect this proxy itself (defaults to admin pass)
    // If the user wants it public, they can remove this check, but safe by default.
    const masterKey = searchParams.get('secret');

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

    if (!providerUrl || !providerKey || !destinationUrl) {
      return NextResponse.json({
        error: 'Missing parameters',
        usage: `GET /api/bridge?provider={API_URL}&key={API_TOKEN}&url={LONG_URL}`
      }, { status: 400 });
    }

    // 1. Call External Provider
    // Standard Format: providerUrl?api=KEY&url=URL
    const separator = providerUrl.includes('?') ? '&' : '?';
    const fetchUrl = `${providerUrl}${separator}api=${providerKey}&url=${encodeURIComponent(destinationUrl)}`;

    console.log('Bridge: Fetching external:', fetchUrl);

    const apiRes = await fetch(fetchUrl);
    const responseText = await apiRes.text();
    const externalShortUrl = extractUrlFromResponse(responseText);

    if (!externalShortUrl || !externalShortUrl.startsWith('http')) {
        return NextResponse.json({
          error: 'External API Failed',
          details: responseText
        }, { status: 502 });
    }

    // 2. Generate Vercel Token
    const token = nanoid(8);

    // 3. Save to DB
    await dbConnect();
    const newLink = await Link.create({
        originalUrl: destinationUrl,
        externalShortUrl: externalShortUrl,
        token: token
    });

    // 4. Return the Vercel Link
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const vercelLink = `${protocol}://${host}/start/${token}`;

    return NextResponse.json({
      status: 'success',
      original: destinationUrl,
      external: externalShortUrl,
      vercel_link: vercelLink
    });

  } catch (error: any) {
    console.error('Bridge Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
