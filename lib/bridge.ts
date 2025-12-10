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
        // Function to perform the fetch
        const performFetch = async (url: string) => {
             const separator = url.includes('?') ? '&' : '?';
             const fetchUrl = `${url}${separator}api=${providerKey}&url=${encodeURIComponent(destinationUrl)}`;
             console.log('Bridge Logic: Fetching external:', fetchUrl);
             const res = await fetch(fetchUrl);
             const text = await res.text();
             return { status: res.status, text };
        };

        // 1. Initial Call
        let response = await performFetch(providerUrl);

        // 2. Auto-Correction Logic: If HTML response, try appending '/api'
        // Only try if the original URL didn't end in 'api' and response looks like HTML (dashboard)
        if (response.text.trim().startsWith('<') && !providerUrl.endsWith('/api') && !providerUrl.endsWith('/api/')) {
            console.log('Bridge Logic: Received HTML. Attempting auto-correction by appending /api');

            // Remove trailing slash if exists
            const baseUrl = providerUrl.replace(/\/$/, '');
            const retryUrl = `${baseUrl}/api`;

            const retryResponse = await performFetch(retryUrl);

            // If retry worked (got JSON or plain text link), use it!
            if (!retryResponse.text.trim().startsWith('<')) {
                console.log('Bridge Logic: Auto-correction successful.');
                response = retryResponse;
            }
        }

        const { status: apiStatus, text: responseText } = response;

        // Check for common error pages (like Vercel Auth)
        if (apiStatus === 401 || responseText.includes('Log in with Vercel')) {
             return {
                status: 502,
                data: {
                    error: 'Bridge URL is unauthorized (401).',
                    details: 'The provider URL seems to be protected (e.g., a Vercel Preview URL). Please check your Bridge URL configuration and ensure it points to a public Production URL.',
                    provider_response: responseText.substring(0, 200)
                }
            };
        }

        // Check if response is still HTML
        if (responseText.trim().startsWith('<')) {
             return {
                status: 502,
                data: {
                    error: 'Provider returned HTML instead of JSON.',
                    details: 'You likely entered the main website URL (e.g., https://site.com) instead of the API endpoint (e.g., https://site.com/api). The system tried to auto-correct but failed. Please update the Provider URL.',
                    provider_response: responseText.substring(0, 500) // Log snippet
                }
            };
        }

        const externalShortUrl = extractUrlFromResponse(responseText);

        // If extraction failed, maybe the provider returned a JSON error?
        if (!externalShortUrl || !externalShortUrl.startsWith('http')) {
            let errorMsg = 'External API returned an invalid response.';
            try {
                const json = JSON.parse(responseText);
                if (json.error) errorMsg = `Provider Error: ${json.error}`;
                if (json.message) errorMsg = `Provider Error: ${json.message}`;
            } catch (e) {
                // Not JSON
            }

            return {
                status: 502,
                data: {
                    error: errorMsg,
                    details: 'Could not extract a valid short URL from the provider response.',
                    raw_response: responseText
                }
            };
        }

        // 3. Generate Vercel Token
        const token = nanoid(8);

        // 4. Save to DB
        await dbConnect();
        const newLink = await Link.create({
            originalUrl: destinationUrl,
            externalShortUrl: externalShortUrl,
            token: token
        });

        // 5. Return the Vercel Link
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
