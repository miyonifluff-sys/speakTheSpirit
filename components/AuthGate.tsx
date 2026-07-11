'use client';

import React from 'react';
import { useGame } from '../context/GameContext';

export default function AuthGate() {
  const { handleLogin, shakeTrigger } = useGame();

  return (
    <div className={`w-full max-w-md mx-auto my-12 p-8 bg-slate-800 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${shakeTrigger ? 'animate-shake-box' : ''}`}>
      <div className="text-center mb-8">
        <span className="text-6xl animate-bounce inline-block mb-3">🛡️</span>
        <h2 className="text-3xl font-black text-yellow-400 tracking-wider uppercase">Speak The Spirit</h2>
        <p className="text-xs text-slate-400 font-semibold uppercase mt-2">Valley Gate Authorization</p>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900/80 p-6 border-3 border-black rounded-xl shadow-[3px_3px_0px_#000] text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">✨</span>
            <h3 className="font-extrabold text-sm text-cyan-400 uppercase tracking-wide">Unified Authentication</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            Sign in to bridge your rewards and items.
          </p>

          <button
            onClick={() => handleLogin("0xMOCK_USER")}
            className="w-full bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-500 hover:brightness-110 text-white font-black text-sm uppercase py-4 rounded-lg border-2 border-black neo-btn transition-all"
          >
            🚀 Sign in and enter Valley
          </button>
        </div>
      </div>

      <div className="mt-8 text-[10px] text-center text-slate-500 font-bold leading-normal">
        🔐 Unified Auth enabled. Rewards are persisted via Supabase.
      </div>
    </div>
  );
}
