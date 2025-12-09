'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Zap } from 'lucide-react';

export default function TimerPage({ destination }: { destination: string }) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setRedirecting(true);
      window.location.href = destination;
    }
  }, [timeLeft, destination]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Card (Glassmorphism) */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">

        {/* Status Badge */}
        <div className="mb-8">
           <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             Bot Is Online
           </div>
        </div>

        {/* Icon/Logo Placeholder (Grey Box from Screenshot) */}
        <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl shadow-inner mb-6 flex items-center justify-center">
             {/* Simulating the app icon */}
             <div className="w-full h-full rounded-2xl bg-white/5 border border-white/10" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          SECRECT BOT UPDATES
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-sm mb-10 max-w-xs">
          Premium Telegram Bots for Enhanced Experience
        </p>

        {/* Circular Progress / Timer */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-10">
          {/* Outer Glow */}
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />

          {/* Ring */}
          <div className="w-full h-full rounded-full border-4 border-slate-800 relative flex items-center justify-center bg-slate-900/50">
             {/* Inner Icon */}
             {redirecting ? (
                 <Zap className="w-12 h-12 text-yellow-400 animate-bounce" />
             ) : (
                 <div className="text-4xl font-mono font-bold text-blue-400">
                    {timeLeft}
                 </div>
             )}
          </div>
        </div>

        {/* Feature Icons Row */}
        <div className="flex justify-center gap-8 w-full mb-8 border-t border-white/5 pt-8">
            <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                    <Zap className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Fast</span>
            </div>
             <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Secure</span>
            </div>
             <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Lock className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Easy</span>
            </div>
        </div>

        {/* Error/Status Box (Red box from screenshot, but repurposed for Loading/Redirecting) */}
        <div className={`w-full p-4 rounded-xl mb-4 transition-colors ${redirecting ? 'bg-green-500/20 border border-green-500/30 text-green-200' : 'bg-red-500/10 border border-red-500/20 text-red-200'}`}>
           <span className="text-sm font-medium">
             {redirecting ? 'Redirecting you now...' : 'Please wait while we verify...'}
           </span>
        </div>

        <div className="text-xs text-slate-600 font-medium">
             Error Occurred? Contact Admin.
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center">
         <p className="text-slate-500 text-sm font-medium tracking-wide">
           Created by <span className="text-blue-400">𝚂𝚑𝚛𝚎𝚎 ꪎ 𝙺ʀɪ𝚜ʜɴᴀ ჯ ↝</span>
         </p>
      </div>
    </div>
  );
}
