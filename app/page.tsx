import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
       {/* Ambient Blobs */}
       <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
       <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
       <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>

      <div className="glass-card p-12 rounded-3xl shadow-2xl max-w-3xl w-full text-center relative z-10 border border-white/10">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 mb-6 drop-shadow-lg">
          Universal Link Bridge
        </h1>
        <p className="text-xl text-gray-300 mb-10 leading-relaxed font-light">
          The ultimate layer for your monetized links. Securely wrap external providers, bypass restrictions, and manage your traffic with a modern, glass-styled interface.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link
            href="/login"
            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-1"
          >
            Login Now
          </Link>
          <Link
            href="/register"
            className="px-10 py-4 bg-white/5 backdrop-blur border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all transform hover:-translate-y-1"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
           <Link href="/owner/login" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
             Owner Portal
           </Link>
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
      `}</style>
    </div>
  );
}
