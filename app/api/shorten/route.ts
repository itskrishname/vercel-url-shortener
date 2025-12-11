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

    if (!user.external_api_token || !user.external_domain) {
      return NextResponse.json({ status: 'error', message: 'User external provider not configured' }, { status: 400 });
    }

    // 2. Generate Local Intermediate Link
    const localToken = nanoid(8); // Short token for our /go/ route
    const baseUrl = getHostUrl(req);
    const intermediateUrl = `${baseUrl}/go/${localToken}`;

    // 3. Call External Provider to shorten the INTERMEDIATE URL
    // Assumption: Standard API format: https://domain.com/api?api=TOKEN&url=URL
    // We try to make it robust.

    // Construct External API URL
    // Some users might input 'gplinks.com', others 'https://gplinks.com/api'
    // We'll try to normalize or just use what they gave if it looks full.
    // Given the screenshot said "Shortener Domain", it's likely just "gplinks.com".

    let externalApiEndpoint = user.external_domain;
    if (!externalApiEndpoint.startsWith('http')) {
      externalApiEndpoint = `https://${externalApiEndpoint}/api`;
    }
    // If it doesn't end in /api (and isn't a full custom url), append it?
    // Usually standard is /api. Let's assume standard for now.

    const externalCallUrl = new URL(externalApiEndpoint);
    externalCallUrl.searchParams.set('api', user.external_api_token);
    externalCallUrl.searchParams.set('url', intermediateUrl); // We shorten OUR url

    const externalRes = await fetch(externalCallUrl.toString());
    const externalData = await externalRes.json().catch(() => null);

    let externalShortUrl = '';

    if (externalData && externalData.shortenedUrl) {
      externalShortUrl = externalData.shortenedUrl;
    } else if (externalData && externalData.short) {
       // Some apis return { short: '...' }
       externalShortUrl = externalData.short;
    } else {
        // Fallback: Check if response text is a URL
        // Or return error
        // For now, let's log and fail if structured data is missing,
        // or return the raw text if it looks like a url.
        console.error('External API Response invalid:', externalData);
        return NextResponse.json({ status: 'error', message: 'External provider failed to return a short URL', debug: externalData }, { status: 502 });
    }

    // 4. Save Link
    const newLink = await Link.create({
      user: user._id,
      originalUrl: targetUrl,
      localToken: localToken,
      externalShortUrl: externalShortUrl
    });

    // 5. Return Result
    return NextResponse.json({
      status: 'success',
      shortenedUrl: externalShortUrl,
      original_url: targetUrl // Matches standard format often used
    });

  } catch (error: any) {
    console.error('Shorten API Error:', error);
    return NextResponse.json({ status: 'error', message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
