import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Link from '@/models/Link';
import { nanoid } from 'nanoid';

// Helper to determine the host URL
function getHostUrl(req: NextRequest) {
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}`;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const apiKey = searchParams.get('api');
    const targetUrl = searchParams.get('url');

    if (!apiKey || !targetUrl) {
      return NextResponse.json({ status: 'error', message: 'Missing api or url parameter' }, { status: 400 });
    }

    // 1. Authenticate User
    const user = await User.findOne({ app_api_key: apiKey });
    if (!user) {
      return NextResponse.json({ status: 'error', message: 'Invalid API Key' }, { status: 401 });
    }

    if (user.isSuspended) {
      return NextResponse.json({ status: 'error', message: 'Account Suspended' }, { status: 403 });
    }

    if (!user.external_api_token || !user.external_domain) {
      return NextResponse.json({ status: 'error', message: 'User external provider not configured' }, { status: 400 });
    }

    // 2. Generate Local Intermediate Link
    const localToken = nanoid(8); // Short token for our /start/ route
    const baseUrl = getHostUrl(req);
    // Vercel link that the user will share
    const vercelShortLink = `${baseUrl}/start/${localToken}`;

    // 3. Call External Provider to shorten the ORIGINAL URL (Destination)
    // The flow is: User -> Vercel Link (/start/token) -> External Short Link -> Original Destination
    let externalApiEndpoint = user.external_domain;
    if (!externalApiEndpoint.startsWith('http')) {
      externalApiEndpoint = `https://${externalApiEndpoint}/api`;
    }

    const externalCallUrl = new URL(externalApiEndpoint);
    externalCallUrl.searchParams.set('api', user.external_api_token);
    externalCallUrl.searchParams.set('url', targetUrl); // Shorten the destination, not the Vercel link

    const externalRes = await fetch(externalCallUrl.toString());
    const externalData = await externalRes.json().catch(() => null);

    let externalShortUrl = '';

    if (externalData && externalData.shortenedUrl) {
      externalShortUrl = externalData.shortenedUrl;
    } else if (externalData && externalData.short) {
       externalShortUrl = externalData.short;
    } else {
        console.error('External API Response invalid:', externalData);
        return NextResponse.json({ status: 'error', message: 'External provider failed to return a short URL', debug: externalData }, { status: 502 });
    }

    // 4. Save Link
    // Saving localToken matching the schema change
    await Link.create({
      user: user._id,
      originalUrl: targetUrl,
      localToken: localToken,
      externalShortUrl: externalShortUrl
    });

    // 5. Return Result
    // Return the Vercel link so the user shares *that*
    return NextResponse.json({
      status: 'success',
      shortenedUrl: vercelShortLink,
      original_url: targetUrl
    });

  } catch (error: any) {
    console.error('Shorten API Error:', error);
    return NextResponse.json({ status: 'error', message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
