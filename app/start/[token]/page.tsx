import dbConnect from '@/lib/db';
import LinkModel from '@/models/Link';
import { notFound } from 'next/navigation';

async function getLink(token: string) {
  await dbConnect();
  // Updated to find by localToken instead of token
  const link = await LinkModel.findOne({ localToken: token });
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

  // Use glassmorphism styling
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 font-sans relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-pink-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center text-white">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300 mb-4">Redirecting...</h1>
        <p className="text-gray-200 mb-8 font-light tracking-wide">
          Please wait while we secure your connection to the destination.
        </p>

        <div className="w-full bg-gray-700/50 rounded-full h-2.5 mb-8 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full w-full animate-[progress_2s_ease-in-out_infinite]"></div>
        </div>

        <div className="flex justify-center space-x-2 text-xs text-gray-400">
           <span>Powered by</span>
           <span className="font-semibold text-white">Vercel Links</span>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes progress {
           0% { width: 0%; margin-left: 0; }
           50% { width: 100%; margin-left: 0; }
           100% { width: 0%; margin-left: 100%; }
        }
      `}</style>

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
