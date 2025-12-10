import { nanoid } from 'nanoid';
import dbConnect from '@/lib/db';
import Link from '@/models/Link';

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

export interface BridgeResult {
    status: number;
    data: any;
}

export async function processBridgeRequest(providerUrl: string, providerKey: string, destinationUrl: string, host: string, protocol: string): Promise<BridgeResult> {
    if (!providerUrl || !providerKey || !destinationUrl) {
        return {
            status: 400,
            data: { error: 'Missing parameters: provider, key, or url' }
        };
    }

    try {
        // 1. Call External Provider
        const separator = providerUrl.includes('?') ? '&' : '?';
        const fetchUrl = `${providerUrl}${separator}api=${providerKey}&url=${encodeURIComponent(destinationUrl)}`;

        console.log('Bridge Logic: Fetching external:', fetchUrl);

        const apiRes = await fetch(fetchUrl);
        const responseText = await apiRes.text();

        // Check for common error pages (like Vercel Auth)
        if (apiRes.status === 401 || responseText.includes('Log in with Vercel')) {
             return {
                status: 502,
                data: {
                    error: 'Bridge URL is unauthorized (401).',
                    details: 'The provider URL seems to be protected (e.g., a Vercel Preview URL). Please check your Bridge URL configuration and ensure it points to a public Production URL.',
                    provider_response: responseText.substring(0, 200) // Log first 200 chars
                }
            };
        }

        const externalShortUrl = extractUrlFromResponse(responseText);

        if (!externalShortUrl || !externalShortUrl.startsWith('http')) {
            return {
                status: 502,
                data: { error: 'External API Failed', details: responseText }
            };
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
        const vercelLink = `${protocol}://${host}/start/${token}`;

        return {
            status: 200,
            data: {
                status: 'success',
                original: destinationUrl,
                external: externalShortUrl,
                vercel_link: vercelLink
            }
        };

    } catch (error: any) {
        console.error('Bridge Logic Error:', error);
        return {
            status: 500,
            data: { error: error.message }
        };
    }
}
