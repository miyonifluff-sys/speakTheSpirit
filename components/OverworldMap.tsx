'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import { addLog } from '../utils/gameEvents';

export default function OverworldMap() {
  const { setCurrentScreen, setFeedback, feedback, triggerShake, hasHolyWater, clearedIslands } = useGame();

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center border-b-2 border-slate-700 pb-3 mb-4">
          <span className="text-green-400 font-black tracking-widest uppercase text-xs">Phase 2: Overworld Map</span>
          <span className="bg-emerald-950 text-emerald-400 px-2.5 py-1 text-xs font-bold rounded-lg border border-emerald-800">
            Select a Location
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <button
            onClick={() => {
              addLog("Traveling to Faith Island...", "system");
              setCurrentScreen('QUEST');
            }}
            className="bg-cyan-500 hover:bg-cyan-400 text-black p-4 rounded-xl neo-card flex flex-col justify-between text-left h-36 relative overflow-hidden"
          >
            <div className="absolute right-2 bottom-2 text-7xl opacity-20">🌟</div>
            <div className="flex items-center justify-between">
              <span className="bg-black text-white text-xs font-black px-2 py-0.5 rounded-full">ACTIVE</span>
              <span className="text-xl">🌟</span>
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight">Faith Island</h3>
              <p className="text-xs font-medium mt-1 text-black/80">Location of the first riddle and captive Songbeast.</p>
            </div>
          </button>

          <button
            onClick={() => {
              addLog("Entering Basecamp Castle & Merchant Shop.", "shop");
              setCurrentScreen('SHOP');
            }}
            className="bg-pink-400 hover:bg-pink-300 text-black p-4 rounded-xl neo-card flex flex-col justify-between text-left h-36 relative overflow-hidden"
          >
            <div className="absolute right-2 bottom-2 text-7xl opacity-20">🏰</div>
            <div className="flex items-center justify-between">
              <span className="bg-black text-white text-xs font-black px-2 py-0.5 rounded-full">VISITABLE</span>
              <span className="text-xl">🏰</span>
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight">Basecamp Castle</h3>
              <p className="text-xs font-medium mt-1 text-black/80">Buy gear like Tickets, Sword of Truth, or Holy Water.</p>
            </div>
          </button>

          <button
            onClick={() => {
              if (clearedIslands.includes('Faith Island')) {
                addLog("Traveling to Hope Island...", "system");
                setCurrentScreen('QUEST'); // In a real app, this would be a different screen/quest
              } else {
                triggerShake();
                addLog("Tried to enter Hope Island, but it is locked in static mist.", "system");
                setFeedback("Hope Island is shrouded in toxic mist! Complete Faith Island first to unlock it.");
              }
            }}
            className={`${
              clearedIslands.includes('Faith Island') 
                ? 'bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer' 
                : 'bg-slate-700 hover:bg-slate-650 text-slate-400 cursor-not-allowed border-dashed'
            } p-4 rounded-xl neo-card flex flex-col justify-between text-left h-36 relative overflow-hidden transition-colors`}
          >
            <div className={`absolute right-2 bottom-2 text-7xl opacity-20 ${!clearedIslands.includes('Faith Island') && 'grayscale'}`}>
              {clearedIslands.includes('Faith Island') ? '🌟' : '🔒'}
            </div>
            <div className="flex items-center justify-between">
              <span className={`${clearedIslands.includes('Faith Island') ? 'bg-black text-white' : 'bg-slate-900 text-slate-500'} text-xs font-black px-2 py-0.5 rounded-full`}>
                {clearedIslands.includes('Faith Island') ? 'ACTIVE' : 'LOCKED'}
              </span>
              <span className="text-xl">🌫️</span>
            </div>
            <div>
              <h3 className={`font-black text-lg leading-tight ${clearedIslands.includes('Faith Island') ? 'text-black' : 'text-slate-300'}`}>Hope Island</h3>
              <p className={`text-xs font-medium mt-1 ${clearedIslands.includes('Faith Island') ? 'text-black/80' : 'text-slate-400'}`}>
                {clearedIslands.includes('Faith Island') ? 'The mist has cleared! Time to find the next Songbeast.' : 'Requires Faith Island clearance.'}
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              if (hasHolyWater) {
                addLog("Holy Water Spray breaks the protective Static on Love Island!", "system");
                setFeedback("You spray Holy Water! The barrier dissolved. (Love Island is unlocked, but wait! Let's clear Faith Island first in this demo!)");
              } else {
                triggerShake();
                addLog("Tried to enter Love Island. Blocked by a Static shield.", "system");
                setFeedback("Love Island is guarded by a Static shield! Buy Holy Water Spray 🧪 from the Castle Shop to bypass it.");
              }
            }}
            className="bg-slate-700 hover:bg-slate-650 text-slate-400 p-4 rounded-xl neo-card flex flex-col justify-between text-left h-36 relative border-dashed"
          >
            <div className="absolute right-2 bottom-2 text-7xl opacity-10">🛡️</div>
            <div className="flex items-center justify-between">
              <span className="bg-slate-900 text-slate-500 text-xs font-black px-2 py-0.5 rounded-full">
                {hasHolyWater ? "UNLOCKED" : "SHIELDED"}
              </span>
              <span className="text-xl">❤️</span>
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight text-slate-300">Love Island</h3>
              <p className="text-xs font-medium mt-1">Requires Holy Water Spray to breach static barriers.</p>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 p-3 border-2 border-slate-700 rounded-lg text-xs flex justify-between items-center mt-4">
        <p className="text-yellow-400 font-bold">
          💡 Hint: Go to Faith Island to start the quest, or visit Basecamp Castle to purchase gear!
        </p>
        {feedback && (
          <span className="text-pink-400 font-bold text-right ml-2 animate-pulse">{feedback}</span>
        )}
      </div>
    </div>
  );
}
