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

  // High-End Cyberpunk/Anime Redirect UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black font-sans relative overflow-hidden">
      {/* Background Cyberpunk Elements */}
      <div className="absolute inset-0 bg-[url('/background.jpg')] bg-cover bg-center opacity-20 filter blur-sm"></div>

      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-pulse animation-delay-2000"></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

      {/* Main Glass Card */}
      <div className="relative z-10 glass-card p-10 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.3)] max-w-md w-full mx-4 border border-white/10 backdrop-blur-2xl">
        {/* Animated Corner Borders */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500 rounded-br-lg"></div>

        <div className="flex flex-col items-center text-center">
            {/* Logo/Icon */}
            <div className="w-20 h-20 mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-full animate-spin-slow blur-md opacity-75"></div>
                <div className="absolute inset-1 bg-black rounded-full flex items-center justify-center border border-white/20 z-10">
                    <svg className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                REDIRECTING
            </h1>
            <p className="text-gray-400 mb-8 text-sm uppercase tracking-widest font-semibold">
                Securing Connection
            </p>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-8 relative">
                <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer z-20"></div>
                <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 animate-[progress_2s_ease-in-out_forwards] shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 uppercase tracking-wider">
                <span className="animate-pulse">Loading destination</span>
                <span className="flex space-x-1">
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce animation-delay-200"></span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce animation-delay-400"></span>
                </span>
            </div>
        </div>
      </div>

      <div className="absolute bottom-8 text-gray-600 text-xs tracking-widest uppercase">
        Powered by NexusLink Engine
      </div>

      <style>{`
        @keyframes progress {
           0% { width: 0%; }
           100% { width: 100%; }
        }
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .animate-shimmer {
            animation: shimmer 1.5s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-200 {
            animation-delay: 0.2s;
        }
        .animation-delay-400 {
            animation-delay: 0.4s;
        }
        .animate-spin-slow {
            animation: spin 3s linear infinite;
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
