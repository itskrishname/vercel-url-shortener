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

// Relaxed normalization: Prepend https:// if missing
function normalizeUrl(string: string) {
  let urlStr = string.trim();
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = 'https://' + urlStr;
  }
  try {
    const url = new URL(urlStr);
    return url.toString(); // Returns fully qualified URL
  } catch (_) {
    return null; // Invalid URL even after prepending
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('[API] Shorten request received');
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const apiKey = searchParams.get('api');
    let targetUrl = searchParams.get('url');

    // 1. Basic Validation
    if (!apiKey || !targetUrl) {
      return NextResponse.json({ status: 'error', message: 'Missing api or url parameter' }, { status: 400 });
    }

    // NORMALIZE URL (Fixing the 400 error for 'google.com' or 'testing')
    const normalizedUrl = normalizeUrl(targetUrl);
    if (!normalizedUrl) {
        return NextResponse.json({
            status: 'error',
            message: 'Invalid URL format. Please provide a valid domain (e.g., google.com)'
        }, { status: 400 });
    }
    targetUrl = normalizedUrl;

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

    // 3. Generate Local Intermediate Link (Vercel Link) FIRST
    // We do this first because the user wants the Vercel link to be the one that is shortened by the external provider.
    // Wait, the requirement is: "vercel ka link banaega jo ke the wheeling pay redirect correct I mean Jo API Diya hoga API se jo link banaa hoga use per redirect Karega"
    // Translation: "Make a Vercel link that redirects to the link created by the API"
    // Flow:
    // 1. Generate Local Token (Vercel Link).
    // 2. Call External API to shorten the ORIGINAL URL. (Wait, let me re-read carefully).

    /*
       "lekin yah ek redirection page jo ki Mere diye hue shortness ke ling Jo generate karta hai usse pahle apna ek khud ka ek vercel ka link banaega jo ke the wheeling pay redirect correct I mean Jo API Diya hoga API se jo link banaa hoga use per redirect Karega"

       Interpretation:
       User visits Vercel Link -> Redirect Page -> External Short Link -> Original URL.

       Current Code Flow:
       1. Generate Local Token (Vercel Link).
       2. Call External API with ORIGINAL URL.
       3. Save (Original URL, Local Token, External Short Link).
       4. Return Vercel Link.

       Redirect Flow:
       User -> Vercel Link (/start/token) -> Page -> Redirects to External Short Link -> Redirects to Original URL.

       This matches the requirement.

       Issue: "External provider failed: URL is invalid."
       This means `targetUrl` sent to the external provider is rejected.
       We are sending `normalizedUrl` which is `https://google.com`.
       Some providers might require `http://` or might be picky about encoding.
       We are using `encodeURIComponent(targetUrl)`. This is correct.

       Maybe the user is using a provider that requires the URL to be passed differently?
       Most standard copy-paste scripts use `url={url}`.

       Let's ensure we are stripping trailing slashes from the API endpoint correctly.
    */

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
    // Intelligent handling of API endpoint construction
    if (externalApiEndpoint.endsWith('/api') || externalApiEndpoint.endsWith('/api/')) {
         apiUrl = `https://${externalApiEndpoint.replace(/\/$/, '')}`;
    } else {
         // Default convention: domain.com -> domain.com/api
         apiUrl = `https://${externalApiEndpoint.replace(/\/$/, '')}/api`;
    }

    // Note: We use the NORMALIZED targetUrl here.
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
        return NextResponse.json({
            status: 'error',
            message: 'External Provider returned invalid JSON. Check your settings or the provider status.',
            raw_response: responseText.substring(0, 200)
        }, { status: 502 });
    }

    let externalShortUrl = '';

    // Handle various response formats
    if (externalData && externalData.shortenedUrl) {
      externalShortUrl = externalData.shortenedUrl;
    } else if (externalData && externalData.short) {
       externalShortUrl = externalData.short;
    } else if (externalData && externalData.url) {
       externalShortUrl = externalData.url; // Some use 'url'
    } else if (externalData && externalData.link) {
       externalShortUrl = externalData.link; // Some use 'link'
    } else {
        console.error('External API Response invalid format:', externalData);
        const providerMsg = externalData.message || externalData.msg || externalData.error || 'No error message provided';
        return NextResponse.json({
            status: 'error',
            message: `External provider failed: ${providerMsg}`,
            provider_response: externalData
        }, { status: 502 });
    }

    // 5. Save Link (Saving the NORMALIZED url)
    try {
        const newLink = await Link.create({
          user: user._id,
          originalUrl: targetUrl, // Saved normalized URL
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
