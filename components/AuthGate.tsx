'use client';

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function AuthGate() {
  const { handleLogin, triggerShake, shakeTrigger } = useGame();
  const [email, setEmail] = useState('');
  const [customWallet, setCustomWallet] = useState('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      triggerShake();
      return;
    }
    handleLogin('SOCIAL', email);
  };

  const simulateWalletConnect = () => {
    setIsConnectingWallet(true);
    setTimeout(() => {
      setIsConnectingWallet(false);
      const randomWallet = customWallet.trim() || `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const formattedWallet = randomWallet.slice(0, 6) + '...' + randomWallet.slice(-4);
      handleLogin('WALLET', formattedWallet);
    }, 1200);
  };

  return (
    <div className={`w-full max-w-md mx-auto my-12 p-6 bg-slate-800 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${shakeTrigger ? 'animate-shake-box' : ''}`}>
      <div className="text-center mb-8">
        <span className="text-5xl animate-bounce inline-block mb-3">🛡️</span>
        <h2 className="text-2xl font-black text-yellow-400 tracking-wider uppercase">Speak The Spirit</h2>
        <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Valley Gate Authorization</p>
      </div>

      {/* Tabs / Login methods */}
      <div className="space-y-6">
        
        {/* Wallet connection block */}
        <div className="bg-slate-900/80 p-4 border-3 border-black rounded-xl shadow-[3px_3px_0px_#000]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🦊</span>
            <h3 className="font-extrabold text-sm text-indigo-400 uppercase tracking-wide">Web3 Wallet Sign-In</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Connect your cryptocurrency wallet to load your on-chain inventory items, cupcakes, and rescued Songbeasts.
          </p>
          
          <div className="mb-4">
            <input 
              type="text" 
              placeholder="Paste Mock Wallet Address (Optional)" 
              value={customWallet}
              onChange={(e) => setCustomWallet(e.target.value)}
              className="w-full bg-slate-950 text-white font-mono text-xs p-2.5 rounded-lg border-2 border-black focus:outline-none focus:border-yellow-400"
            />
          </div>

          <button
            onClick={simulateWalletConnect}
            disabled={isConnectingWallet}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase py-3 rounded-lg border-2 border-black neo-btn"
          >
            {isConnectingWallet ? 'Connecting Wallet Securing...' : '🔌 Connect Web3 Wallet'}
          </button>
        </div>

        {/* Divider line */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t-2 border-dashed border-slate-700"></div>
          <span className="flex-shrink mx-4 text-slate-500 font-black text-xs uppercase">OR</span>
          <div className="flex-grow border-t-2 border-dashed border-slate-700"></div>
        </div>

        {/* Social / Email credentials block */}
        <div className="bg-slate-900/80 p-4 border-3 border-black rounded-xl shadow-[3px_3px_0px_#000]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">✉️</span>
            <h3 className="font-extrabold text-sm text-pink-400 uppercase tracking-wide">Web2 Social Credentials</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            No wallet? No problem! Sign in with your social account or email. We will generate a secure embedded web-wallet behind the scenes.
          </p>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="enter email: player@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 text-white font-mono text-xs p-2.5 rounded-lg border-2 border-black focus:outline-none focus:border-yellow-400"
              required
            />
            <button
              type="submit"
              className="w-full bg-pink-500 hover:bg-pink-400 text-white font-black text-xs uppercase py-3 rounded-lg border-2 border-black neo-btn"
            >
              🚀 Enter with Email Account
            </button>
          </form>
        </div>

      </div>

      <div className="mt-6 text-[10px] text-center text-slate-500 font-bold leading-normal">
        🔐 All connections are simulated in this prototype. Smart contract connections can be mapped to local state securely.
      </div>
    </div>
  );
}
