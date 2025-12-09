import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Link from '@/models/Link';
import { nanoid } from 'nanoid';

// Simple function to extract URL from text/json response
// Many shorteners return just text, or JSON.
function extractUrlFromResponse(data: any): string {
  if (typeof data === 'string') {
    // Check if it's a valid URL string
    try {
        new URL(data);
        return data;
    } catch (e) {
        // Attempt to parse JSON if string
        try {
            const parsed = JSON.parse(data);
            return extractUrlFromResponse(parsed);
        } catch (jsonErr) {
            // If it contains http, return the substring?
            // For safety, let's assume if it's not JSON, and contains http, return the first http match
            const match = data.match(/https?:\/\/[^\s"]+/);
            if (match) return match[0];
            return data; // Fallback
        }
    }
  }

  if (typeof data === 'object' && data !== null) {
    // Common keys for shorteners: short_url, url, short, link
    if (data.shortenedUrl) return data.shortenedUrl;
    if (data.short_url) return data.short_url;
    if (data.url) return data.url;
    if (data.link) return data.link;
    if (data.short) return data.short;

    // Deep search if needed, but let's stick to top level for now
    return JSON.stringify(data);
  }

  return '';
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { longUrl, apiUrl, apiToken } = await req.json();

    if (!longUrl || !apiUrl || !apiToken) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // 1. Call External API
    // Construct URL: API_URL + ?api=TOKEN&url=LONG_URL
    // Note: Parameter names vary by service (api/key/token, url/link).
    // The prompt implied "api" and "url" are the params or we just use the user input.
    // I will assume standard format: ?api={apiToken}&url={longUrl}
    // If the user provided apiUrl has query params already, we append with &

    const separator = apiUrl.includes('?') ? '&' : '?';
    const fetchUrl = `${apiUrl}${separator}api=${apiToken}&url=${encodeURIComponent(longUrl)}`;

    console.log('Fetching external shortener:', fetchUrl);

    const apiRes = await fetch(fetchUrl);
    const responseText = await apiRes.text();

    console.log('External API Response:', responseText);

    const externalShortUrl = extractUrlFromResponse(responseText);

    if (!externalShortUrl || !externalShortUrl.startsWith('http')) {
        return NextResponse.json({ message: 'Failed to get valid short URL from external API', details: responseText }, { status: 502 });
    }

    // 2. Generate Vercel Token
    const token = nanoid(8); // 8 char unique ID

    // 3. Save to DB
    await dbConnect();

    const newLink = await Link.create({
        originalUrl: longUrl,
        externalShortUrl: externalShortUrl,
        token: token
    });

    return NextResponse.json({
        success: true,
        token: newLink.token,
        externalShortUrl: newLink.externalShortUrl
    });

  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json({ message: error.message || 'Internal Error' }, { status: 500 });
  }
}
