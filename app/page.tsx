import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black selection:bg-cyan-500 selection:text-black">
       {/* God Mode Background */}
       <div className="absolute inset-0 god-grid-bg opacity-30 animate-pulse"></div>
       <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>

       {/* Ambient Blobs */}
       <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-blob"></div>
       <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-blob animation-delay-2000"></div>

      <div className="glass-card p-12 rounded-3xl shadow-2xl max-w-4xl w-full text-center relative z-10 border border-white/10 backdrop-blur-3xl god-glow-box">
        {/* Holographic Border Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>

        <div className="relative">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-purple-200 mb-6 god-glow-text tracking-tighter">
            NEXUS<span className="text-cyan-400">LINK</span>
            </h1>
            <p className="text-xl md:text-2xl text-cyan-100/80 mb-12 leading-relaxed font-light tracking-wide max-w-2xl mx-auto">
            The <span className="text-purple-400 font-bold">God-Tier</span> bridge for your links. Bypass restrictions, monetize traffic, and dominate with style.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-8">
            <Link
                href="/owner/login"
                className="group relative px-10 py-5 bg-black text-white font-bold rounded-2xl overflow-hidden shadow-2xl transition-all hover:scale-105 border border-white/10"
            >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-cyan-600 opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                    ENTER SYSTEM
                </span>
            </Link>

            <a
                href="#"
                className="group relative px-10 py-5 bg-white/5 text-white font-bold rounded-2xl overflow-hidden shadow-xl transition-all hover:scale-105 border border-white/10 hover:border-cyan-500/50"
            >
                <span className="relative z-10 flex items-center justify-center text-gray-300 group-hover:text-white transition-colors">
                    DOCUMENTATION
                </span>
            </a>
            </div>
        </div>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-pulse"></div>
          <p className="text-[10px] text-cyan-500/50 uppercase tracking-[0.5em] mt-4 font-bold">System Online</p>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
