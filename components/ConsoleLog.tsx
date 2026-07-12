'use client';

import React from 'react';
import { useGame } from '../context/GameContext';

export default function ConsoleLog() {
  const { gameLogs } = useGame();

  // Only show the most recent 4 logs to keep the UI clean
  const recentLogs = gameLogs.slice(-4);

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {recentLogs.map((log, index) => {
        let textColor = 'text-blue-400';
        if (log.type === 'system') textColor = 'text-cyan-400';
        if (log.type === 'angel') textColor = 'text-yellow-400';
        if (log.type === 'battle') textColor = 'text-red-400';
        if (log.type === 'shop') textColor = 'text-pink-400';
        if (log.type === 'songbeast') textColor = 'text-emerald-400';

        return (
          <div 
            key={`${log.timestamp}-${index}`} 
            className="pointer-events-auto animate-slide-in-up bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl flex flex-col gap-1"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`${textColor} font-black uppercase text-[10px] tracking-tighter`}>
                {log.type}
              </span>
              <span className="text-slate-500 text-[10px] font-mono">
                {log.timestamp}
              </span>
            </div>
            <div className="text-slate-200 text-xs font-medium leading-relaxed">
              {log.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
