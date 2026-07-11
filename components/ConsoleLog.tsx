'use client';

import React, { useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function ConsoleLog() {
  const { gameLogs, setGameLogs } = useGame();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [gameLogs]);

  return (
    <footer className="w-full max-w-4xl bg-slate-950 text-slate-400 p-4 mt-6 rounded-xl border-4 border-black neo-card h-48 flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 shrink-0">
        <span className="text-xs font-black uppercase text-yellow-400 tracking-widest flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping"></span>
          Valley Status Core Console Logs
        </span>
        <button 
          onClick={() => setGameLogs([])}
          className="text-[10px] uppercase text-slate-600 hover:text-slate-300 hover:underline"
        >
          Clear Log
        </button>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {gameLogs.length === 0 ? (
          <p className="text-slate-700 italic text-center pt-8">Console empty. Actions will be logged here in real-time.</p>
        ) : (
          gameLogs.map((log, index) => {
            let tagColor = 'text-blue-400';
            if (log.type === 'system') tagColor = 'text-cyan-400';
            if (log.type === 'angel') tagColor = 'text-yellow-400';
            if (log.type === 'battle') tagColor = 'text-red-400';
            if (log.type === 'shop') tagColor = 'text-pink-400';
            if (log.type === 'songbeast') tagColor = 'text-emerald-400';

            return (
              <div key={index} className="flex gap-2 items-start hover:bg-slate-900 p-0.5 rounded transition-colors">
                <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                <span className={`${tagColor} font-black shrink-0 uppercase text-[10px] bg-slate-900 border border-slate-800 px-1 py-0.2 rounded`}>
                  {log.type}
                </span>
                <span className="text-slate-300 leading-tight">{log.text}</span>
              </div>
            );
          })
        )}
      </div>
    </footer>
  );
}
