import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { providerUrl, apiKey, testUrl } = await req.json();

    if (!providerUrl || !apiKey || !testUrl) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const separator = providerUrl.includes('?') ? '&' : '?';
    // Clean up dest URL just in case
    let finalDestUrl = testUrl;
    if (!finalDestUrl.startsWith('http')) finalDestUrl = 'http://' + finalDestUrl;

    const fetchUrl = `${providerUrl}${separator}api=${apiKey}&url=${encodeURIComponent(finalDestUrl)}`;

    console.log('[Debug Tool] Fetching:', fetchUrl);

    try {
        const response = await fetch(fetchUrl);
        const text = await response.text();
        const isHtml = text.trim().startsWith('<');

        let preview = text;
        if (text.length > 500) {
            preview = text.substring(0, 500) + '... (truncated)';
        }

        // Try to parse JSON to see if it's valid
        let jsonValid = false;
        try {
            JSON.parse(text);
            jsonValid = true;
        } catch(e) {}

        const success = response.status >= 200 && response.status < 300 && !isHtml && jsonValid;

        return NextResponse.json({
            success,
            statusCode: response.status,
            requestUrl: fetchUrl,
            preview,
            isHtml,
            headers: Object.fromEntries(response.headers.entries())
        });

    } catch (networkError: any) {
        return NextResponse.json({
            success: false,
            statusCode: 0,
            requestUrl: fetchUrl,
            preview: `Network Error: ${networkError.message}`,
            isHtml: false
        });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
