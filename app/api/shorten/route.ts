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

function isValidUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('[API] Shorten request received');
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const apiKey = searchParams.get('api');
    const targetUrl = searchParams.get('url');

    // 1. Basic Validation
    if (!apiKey || !targetUrl) {
      return NextResponse.json({ status: 'error', message: 'Missing api or url parameter' }, { status: 400 });
    }

    // STRICT URL VALIDATION to prevent upstream errors/timeouts
    if (!isValidUrl(targetUrl)) {
        return NextResponse.json({
            status: 'error',
            message: 'Invalid URL format. URL must start with http:// or https://'
        }, { status: 400 });
    }

    // 2. Authenticate User
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

    // 3. Generate Local Intermediate Link
    let localToken;
    let isUnique = false;
    let retries = 0;

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

    // 4. Call External Provider
    let externalApiEndpoint = user.external_domain.trim();
    externalApiEndpoint = externalApiEndpoint.replace(/^https?:\/\//, '');

    if (!externalApiEndpoint.includes('.')) {
        return NextResponse.json({
            status: 'error',
            message: 'Invalid External Domain in Settings. Please enter a valid domain (e.g., gplinks.com).'
        }, { status: 400 });
    }

    let apiUrl = '';
    if (externalApiEndpoint.endsWith('/api') || externalApiEndpoint.endsWith('/api/')) {
         apiUrl = `https://${externalApiEndpoint.replace(/\/$/, '')}`;
    } else {
         apiUrl = `https://${externalApiEndpoint.replace(/\/$/, '')}/api`;
    }

    const externalCallUrl = `${apiUrl}?api=${user.external_api_token}&url=${encodeURIComponent(targetUrl)}`;
    console.log('[API] Calling External Provider:', externalCallUrl.replace(user.external_api_token, '***'));

    // TIMEOUT HANDLING: Abort fetch if it takes too long (8 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let externalRes;
    try {
        externalRes = await fetch(externalCallUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });
    } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
            return NextResponse.json({
                status: 'error',
                message: 'External Provider Timed Out (8s limit). The provider might be slow or blocking requests.'
            }, { status: 504 });
        }
        throw fetchError;
    } finally {
        clearTimeout(timeoutId);
    }

    const responseText = await externalRes.text();
    console.log('[API] External Response Body:', responseText);

    let externalData;
    try {
        externalData = JSON.parse(responseText);
    } catch (e) {
        console.error('[API] Failed to parse external JSON:', e);
        // If status is 200 but JSON is invalid, it's likely an HTML page (like Cloudflare challenge or 404)
        return NextResponse.json({
            status: 'error',
            message: 'External Provider returned invalid JSON. Check your settings or the provider status.',
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
        const providerMsg = externalData.message || externalData.msg || externalData.error || 'No error message provided';
        return NextResponse.json({
            status: 'error',
            message: `External provider failed: ${providerMsg}`,
            provider_response: externalData
        }, { status: 502 });
    }

    // 5. Save Link
    try {
        const newLink = await Link.create({
          user: user._id,
          originalUrl: targetUrl,
          localToken: localToken,
          token: localToken,
          externalShortUrl: externalShortUrl
        });
        console.log('[API] Link Saved:', newLink._id);
    } catch (dbError: any) {
        console.error('[API] DB Save Error Full:', dbError);

        if (dbError.code === 11000) {
             return NextResponse.json({
                 status: 'error',
                 message: 'Internal Collision. Please try again.',
                 debug: dbError.keyValue
             }, { status: 500 });
        }
        throw dbError;
    }

    // 6. Return Result
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
