import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, ADMIN_CREDENTIALS } from '@/lib/auth';
import { processBridgeRequest } from '@/lib/bridge';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Allow authentication via API Key (for external programmatic use) or Session Cookie (for Admin Dashboard)
  const apiKey = req.headers.get('x-api-key');
  const isApiAuthorized = apiKey === ADMIN_CREDENTIALS.password;

  if (!isApiAuthorized && !isAuthenticated(req)) {
    return NextResponse.json({ message: 'Unauthorized. Provide valid x-api-key header or login.' }, { status: 401 });
  }

  try {
    const { longUrl, apiUrl, apiToken } = await req.json();

    if (!longUrl || !apiUrl || !apiToken) {
      return NextResponse.json({ message: 'Missing fields: longUrl, apiUrl, apiToken' }, { status: 400 });
    }

    // Use the shared bridge logic to ensure consistent error handling
    const host = req.headers.get('host') || 'localhost';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';

    // Ensure destination URL has protocol (handled in bridge too, but good to be safe)
    let destinationUrl = longUrl;
    if (!destinationUrl.startsWith('http://') && !destinationUrl.startsWith('https://')) {
        destinationUrl = 'http://' + destinationUrl;
    }

    const result = await processBridgeRequest(
        apiUrl,
        apiToken,
        destinationUrl,
        host,
        protocol
    );

    if (result.status !== 200) {
        // Return the error from the bridge
        return NextResponse.json(result.data, { status: result.status });
    }

    // Success response format for the dashboard
    return NextResponse.json({
        success: true,
        token: result.data.vercel_link.split('/').pop(), // Extract token from link
        externalShortUrl: result.data.external,
        vercelLink: result.data.vercel_link
    });

  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json({ message: error.message || 'Internal Error' }, { status: 500 });
  }
}
