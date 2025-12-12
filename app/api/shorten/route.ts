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
    console.log('[API] Shorten request received');
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
      console.error('[API] Invalid API Key:', apiKey);
      return NextResponse.json({ status: 'error', message: 'Invalid API Key' }, { status: 401 });
    }

    if (user.isSuspended) {
      return NextResponse.json({ status: 'error', message: 'Account Suspended' }, { status: 403 });
    }

    if (!user.external_api_token || !user.external_domain) {
      return NextResponse.json({ status: 'error', message: 'External provider not configured. Please go to Settings.' }, { status: 400 });
    }

    console.log('[API] User authenticated:', user.username);

    // 2. Generate Local Intermediate Link
    let localToken;
    let isUnique = false;
    let retries = 0;

    // Retry logic to ensure uniqueness and non-null token
    while (!isUnique && retries < 3) {
        localToken = nanoid(10);
        const existing = await Link.findOne({ localToken });
        if (!existing) {
            isUnique = true;
        } else {
            retries++;
        }
    }

    if (!localToken || !isUnique) {
        throw new Error('Failed to generate unique token after retries');
    }

    const baseUrl = getHostUrl(req);
    const vercelShortLink = `${baseUrl}/start/${localToken}`;
    console.log('[API] Generated Local Token:', localToken);

    // 3. Call External Provider
    let externalApiEndpoint = user.external_domain;
    // Basic sanitization
    externalApiEndpoint = externalApiEndpoint.replace(/^https?:\/\//, '').replace(/\/$/, '');

    // Construct external API URL (assuming standard format like gplinks/droplink)
    // Most support: https://domain.com/api?api=KEY&url=URL
    const externalCallUrl = `https://${externalApiEndpoint}/api?api=${user.external_api_token}&url=${encodeURIComponent(targetUrl)}`;

    console.log('[API] Calling External Provider:', externalCallUrl.replace(user.external_api_token, '***'));

    const externalRes = await fetch(externalCallUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    const responseText = await externalRes.text();
    console.log('[API] External Response Body:', responseText);

    let externalData;
    try {
        externalData = JSON.parse(responseText);
    } catch (e) {
        console.error('[API] Failed to parse external JSON:', e);
        return NextResponse.json({
            status: 'error',
            message: 'External Provider returned invalid JSON',
            raw_response: responseText.substring(0, 200)
        }, { status: 502 });
    }

    let externalShortUrl = '';

    if (externalData && externalData.shortenedUrl) {
      externalShortUrl = externalData.shortenedUrl;
    } else if (externalData && externalData.short) {
       externalShortUrl = externalData.short;
    } else {
        console.error('External API Response invalid format:', externalData);
        return NextResponse.json({
            status: 'error',
            message: 'External provider failed to return a short URL. Check your API Token and Domain in Settings.',
            provider_response: externalData
        }, { status: 502 });
    }

    // 4. Save Link
    // KEY FIX: We save 'localToken' AND 'token' with the same value.
    // This satisfies the new 'localToken' index AND the old 'token' index (preventing null collision).
    console.log('[API] Saving Link to DB...');
    try {
        const newLink = await Link.create({
          user: user._id,
          originalUrl: targetUrl,
          localToken: localToken,
          token: localToken, // <--- Saving to 'token' as well to satisfy old index
          externalShortUrl: externalShortUrl
        });
        console.log('[API] Link Saved:', newLink._id);
    } catch (dbError: any) {
        console.error('[API] DB Save Error Full:', dbError);

        if (dbError.code === 11000) {
             return NextResponse.json({
                 status: 'error',
                 message: 'Internal Collision (Duplicate Token). Please try again.',
                 debug: dbError.keyValue
             }, { status: 500 });
        }
        throw dbError;
    }

    // 5. Return Result
    // The user requested a specific JSON format response.
    return NextResponse.json({
      status: 'success',
      shortenedUrl: vercelShortLink,
      original_url: targetUrl
    });

  } catch (error: any) {
    console.error('[API] Critical Shorten API Error:', error);
    return NextResponse.json({
        status: 'error',
        message: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
