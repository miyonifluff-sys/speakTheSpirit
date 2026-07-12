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
    userId,
    loginMethod
  } = useGame();

  return (
    <header className="w-full bg-yellow-400 text-black neo-card py-1.5 px-4 flex flex-row items-center justify-between gap-4 rounded-none z-10">
      <div className="flex items-center gap-3">
        <span className="text-xl">🛡️</span>
        <div>
          <h1 className="text-sm font-black tracking-wider uppercase">Speak The Spirit</h1>
          <div className="flex items-center gap-2 text-[9px] font-bold text-black/75 uppercase">
            <span>Hackathon Prototype v1.0</span>
            {userId && (
              <span className="bg-black/10 px-1 py-0.5 rounded flex items-center gap-1">
                👤 {userId.substring(0, 8)}...
              </span>
            )}
            {!userId && loginMethod && (
              <span className="bg-black/10 px-1 py-0.5 rounded flex items-center gap-1">
                ✉️ Social Logged In
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Currency & Gear Inventory Panel */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
        <div className="bg-white py-0.5 px-2 border-2 border-black rounded-lg flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
          <span>🧁 Cupcakes:</span>
          <span className="text-pink-600 text-xs">{cupcakes}</span>
        </div>
        <div className="bg-white py-0.5 px-2 border-2 border-black rounded-lg flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
          <span>🥒 Cucumbers:</span>
          <span className="text-green-600 text-xs">{cucumbers}</span>
        </div>
        <div className="bg-white py-0.5 px-2 border-2 border-black rounded-lg flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
          <span>🎟️ Tickets:</span>
          <span className="text-indigo-600 text-xs">{tickets}</span>
        </div>
        <div className="flex items-center gap-1 bg-amber-200 text-amber-950 py-0.5 px-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000]">
          <span>🎒 Gear:</span>
          <span title="Sword of Truth">{hasSwordOfTruth ? '⚔️' : '❌'}</span>
          <span title="Holy Water Spray">{hasHolyWater ? '🧪' : '❌'}</span>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleResetGame}
            className="bg-orange-500 text-white hover:bg-orange-600 border-2 border-black px-2 py-0.5 rounded-lg font-black text-[10px] uppercase neo-btn"
          >
            Reset
          </button>
          <button 
            onClick={handleLogout}
            className="bg-red-600 text-white hover:bg-red-700 border-2 border-black px-2 py-0.5 rounded-lg font-black text-[10px] uppercase neo-btn"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
