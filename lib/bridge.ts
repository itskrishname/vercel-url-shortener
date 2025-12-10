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
    // Standard keys
    if (data.shortenedUrl) return data.shortenedUrl;
    if (data.short_url) return data.short_url;
    if (data.url) return data.url;
    if (data.link) return data.link;
    if (data.short) return data.short;
    if (data.shortLink) return data.shortLink; // Added common key

    // Nested keys (e.g. data.url or data.shortenedUrl)
    if (data.data) {
        if (typeof data.data === 'string') return extractUrlFromResponse(data.data);
        if (typeof data.data === 'object') {
            if (data.data.url) return data.data.url;
            if (data.data.shortenedUrl) return data.data.shortenedUrl;
            if (data.data.link) return data.data.link;
            if (data.data.short_url) return data.data.short_url;
        }
    }

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
        // Ensure providerUrl has protocol
        let cleanProviderUrl = providerUrl.trim();
        if (!cleanProviderUrl.startsWith('http://') && !cleanProviderUrl.startsWith('https://')) {
            cleanProviderUrl = 'https://' + cleanProviderUrl;
        }

        // Function to perform the fetch with timeout
        const performFetch = async (url: string) => {
             const separator = url.includes('?') ? '&' : '?';
             const fetchUrl = `${url}${separator}api=${providerKey}&url=${encodeURIComponent(destinationUrl)}`;
             console.log('Bridge Logic: Fetching external:', fetchUrl);

             const controller = new AbortController();
             const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

             try {
                const res = await fetch(fetchUrl, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });
                clearTimeout(timeoutId);
                const text = await res.text();
                return { status: res.status, text };
             } catch (error: any) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    return { status: 504, text: JSON.stringify({ error: 'External API timed out (8s limit).' }) };
                }
                throw error;
             }
        };

        // 1. Initial Call
        let response = await performFetch(cleanProviderUrl);

        // 2. Auto-Correction Logic: If HTML response, try sophisticated fallbacks
        if (response.text.trim().startsWith('<')) {
             console.log('Bridge Logic: Received HTML. Attempting auto-correction strategies.');
             let strategySuccess = false;

             // Strategy A: Append '/api' (if not already there)
             if (!cleanProviderUrl.endsWith('/api') && !cleanProviderUrl.endsWith('/api/')) {
                const baseUrl = cleanProviderUrl.replace(/\/$/, '');
                const retryUrl = `${baseUrl}/api`;
                console.log('Bridge Logic: Strategy A - Trying', retryUrl);

                const retryResponse = await performFetch(retryUrl);
                if (!retryResponse.text.trim().startsWith('<')) {
                    console.log('Bridge Logic: Strategy A successful.');
                    response = retryResponse;
                    strategySuccess = true;
                }
             }

             // Strategy B: Root Domain + '/api' (if Strategy A failed or wasn't applicable)
             // This handles cases like: https://site.com/member/tools/api -> https://site.com/api
             if (!strategySuccess) {
                 try {
                     const parsedUrl = new URL(cleanProviderUrl);
                     const rootApiUrl = `${parsedUrl.origin}/api`;

                     // Only try if this is different from original and Strategy A
                     if (rootApiUrl !== cleanProviderUrl && rootApiUrl !== (cleanProviderUrl.replace(/\/$/, '') + '/api')) {
                         console.log('Bridge Logic: Strategy B - Trying Root Fallback', rootApiUrl);
                         const rootResponse = await performFetch(rootApiUrl);

                         if (!rootResponse.text.trim().startsWith('<')) {
                             console.log('Bridge Logic: Strategy B successful.');
                             response = rootResponse;
                             strategySuccess = true;
                         }
                     }
                 } catch (e) {
                     console.log('Bridge Logic: Failed to parse URL for Strategy B');
                 }
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
