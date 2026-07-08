'use client';

import React from 'react';
import { useGame } from '../context/GameContext';

export default function GameHeader() {
  const { 
    cupcakes, 
    cucumbers, 
    tickets, 
    hasSwordOfTruth, 
    hasHolyWater, 
    handleResetGame, 
    handleLogout,
    userWallet,
    loginMethod
  } = useGame();

  return (
    <header className="w-full max-w-4xl bg-yellow-400 text-black neo-card p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl z-10">
      <div className="flex items-center gap-3">
        <span className="text-3xl animate-bounce">🛡️</span>
        <div>
          <h1 className="text-xl font-black tracking-wider uppercase">Speak The Spirit</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 text-[10px] font-bold text-black/75 uppercase">
            <span>Hackathon Prototype v1.0</span>
            {userWallet && (
              <span className="bg-black/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                🦊 {userWallet}
              </span>
            )}
            {!userWallet && loginMethod && (
              <span className="bg-black/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                ✉️ Social Logged In
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Currency & Gear Inventory Panel */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-bold">
        <div className="bg-white px-3 py-1.5 border-2 border-black rounded-lg flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
          <span>🧁 Cupcakes:</span>
          <span className="text-pink-600 text-base">{cupcakes}</span>
        </div>
        <div className="bg-white px-3 py-1.5 border-2 border-black rounded-lg flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
          <span>🥒 Cucumbers:</span>
          <span className="text-green-600 text-base">{cucumbers}</span>
        </div>
        <div className="bg-white px-3 py-1.5 border-2 border-black rounded-lg flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
          <span>🎟️ Tickets:</span>
          <span className="text-indigo-600 text-base">{tickets}</span>
        </div>
        <div className="flex items-center gap-1 bg-amber-200 text-amber-950 px-2.5 py-1.5 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000]">
          <span>🎒 Gear:</span>
          <span title="Sword of Truth">{hasSwordOfTruth ? '⚔️' : '❌'}</span>
          <span title="Holy Water Spray">{hasHolyWater ? '🧪' : '❌'}</span>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleResetGame}
            className="bg-orange-500 text-white hover:bg-orange-600 border-2 border-black px-2.5 py-1.5 rounded-lg font-black text-xs uppercase neo-btn"
          >
            Reset
          </button>
          <button 
            onClick={handleLogout}
            className="bg-red-600 text-white hover:bg-red-700 border-2 border-black px-2.5 py-1.5 rounded-lg font-black text-xs uppercase neo-btn"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
