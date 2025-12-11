'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Shield, Zap, CheckCircle2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TimerPage({
  destination
}: {
  destination: string;
}) {
  const [timeLeft, setTimeLeft] = useState(10); // Standard 10s timer
  const [status, setStatus] = useState('initializing'); // initializing, counting, ready, redirecting
  const router = useRouter();

  useEffect(() => {
    // Start countdown immediately
    setStatus('counting');
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('ready');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Auto redirect when ready (simulating the "Wait" then "Go" flow)
    if (status === 'ready') {
      setTimeout(() => {
        setStatus('redirecting');
        // Small delay for the "Success" animation before actual navigation
        setTimeout(() => {
          window.location.href = destination;
        }, 1500);
      }, 1000);
    }
  }, [status, destination]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0f0518] font-mono text-white selection:bg-cyan-500/30">

      {/*
        USER: REPLACE THIS BACKGROUND IMAGE
        Find a "Cyberpunk Anime Boy" or similar image and replace the URL below.
      */}
      <div
        className="absolute inset-0 z-0 opacity-60 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1577009668386-857c0e86b026?q=80&w=2070&auto=format&fit=crop")',
          filter: 'blur(2px) contrast(1.1) brightness(0.7)'
        }}
      />

      {/* Overlay Gradient for readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1a0b2e]/80 via-transparent to-[#1a0b2e]/90" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6">

        {/* --- HEADER --- */}
        <header className="w-full max-w-md flex items-center justify-between mb-12 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping absolute inset-0" />
              <div className="w-2 h-2 bg-cyan-400 rounded-full relative z-10" />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
              BOT IS ONLINE
            </span>
          </div>

          <div className="p-2 bg-white/5 rounded-full border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            <Bot className="w-5 h-5 text-white" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]">
              SECRET BOT UPDATES
            </span>
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping absolute inset-0" />
              <div className="w-2 h-2 bg-emerald-400 rounded-full relative z-10" />
            </div>
          </div>
        </header>

        {/* --- CENTER TIMER --- */}
        <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md">

          <AnimatePresence mode="wait">
            {status !== 'redirecting' ? (
              <motion.div
                key="timer"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative flex items-center justify-center mb-12"
              >
                {/* Rotating Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute w-64 h-64 border-[3px] border-cyan-500/30 rounded-full border-t-cyan-400 border-r-transparent shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute w-52 h-52 border-[2px] border-purple-500/30 rounded-full border-b-purple-400 border-l-transparent"
                />

                {/* Center Number */}
                <div className="relative w-40 h-40 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                  <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
                    {timeLeft}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="redirect"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center mb-12"
              >
                <div className="w-40 h-40 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.4)]">
                  <CheckCircle2 className="w-20 h-20 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-white tracking-widest uppercase">Success</h2>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Bar */}
          <div className="w-full bg-black/40 backdrop-blur rounded-lg border border-white/5 p-4 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-cyan-300 uppercase tracking-wider font-bold">
                {status === 'redirecting' ? 'Redirecting...' : 'System Verification'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {status === 'redirecting' ? '100%' : `${Math.round(((10 - timeLeft) / 10) * 100)}%`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 box-shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: status === 'redirecting' ? "100%" : `${((10 - timeLeft) / 10) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 w-full justify-center">
             <div className="flex-1 bg-black/40 border border-cyan-500/30 rounded-xl p-3 flex flex-col items-center gap-2 backdrop-blur-sm group hover:bg-cyan-900/20 transition-colors">
                <Zap className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-white">FAST</span>
             </div>
             <div className="flex-1 bg-black/40 border border-purple-500/30 rounded-xl p-3 flex flex-col items-center gap-2 backdrop-blur-sm group hover:bg-purple-900/20 transition-colors">
                <Shield className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-white">SECURE</span>
             </div>
             <div className="flex-1 bg-black/40 border border-emerald-500/30 rounded-xl p-3 flex flex-col items-center gap-2 backdrop-blur-sm group hover:bg-emerald-900/20 transition-colors">
                <Lock className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-white">EASY</span>
             </div>
          </div>

        </main>

        {/* --- FOOTER --- */}
        <footer className="mt-8 text-center">
            <p className="text-[10px] text-slate-500 font-medium tracking-[0.3em] uppercase opacity-70">
                Created by <span className="text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]">𝚂𝚑𝚛𝚎𝚎 ꪎ 𝙺ʀɪ𝚜ʜɴᴀ</span>
            </p>
        </footer>

      </div>
    </div>
  );
}
