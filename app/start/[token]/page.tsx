import dbConnect from '@/lib/db';
import LinkModel from '@/models/Link';
import { notFound } from 'next/navigation';

async function getLink(token: string) {
  await dbConnect();
  // Support both new (localToken) and legacy (token) links
  const link = await LinkModel.findOne({
    $or: [
      { localToken: token },
      { token: token }
    ]
  });

  if (!link) return null;

  // Async update visit count
  LinkModel.updateOne({ _id: link._id }, { $inc: { visits: 1 } }).exec();

  // Return the externalShortUrl for redirection
  return { externalShortUrl: link.externalShortUrl };
}

export default async function StartPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = await getLink(token);

  if (!link) {
    notFound();
  }

  // "Protected" Page Logic (Restored White Box UI)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-purple-600 mb-4">Redirecting...</h1>
        <p className="text-gray-600 mb-6">
          Please wait while we securely redirect you to your destination.
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div className="bg-purple-600 h-2.5 rounded-full w-full animate-pulse"></div>
        </div>

        <p className="text-xs text-gray-400">
          Protected by Vercel URL Shortener
        </p>
      </div>

      <RedirectLogic url={link.externalShortUrl} />
    </div>
  );
}

// Client Component for the actual redirect effect
function RedirectLogic({ url }: { url: string }) {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `
                    setTimeout(function() {
                        window.location.replace("${url}");
                    }, 2000);
                `
            }}
        />
    )
}
