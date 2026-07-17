'use client';

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import CrossroadsScene from './quests/Crossroads/CrossroadsScene';
// We will import the other scenes later as we build them!
import HungerTrialScene from './quests/HungerTrial/HungerTrialScene';
// import RushingWatersScene from './quests/RushingWaters/RushingWatersScene';

export default function QuestRiddle() {
  const { setCurrentScreen, setFeedback } = useGame();

  // Track which physical 'room' or 'scene' the player is currently in
  const [currentScene, setCurrentScene] = useState<'CROSSROADS' | 'HUNGER' | 'RIVER' | 'BATTLE_READY'>('CROSSROADS');

  return (
    <div className="flex-1 flex flex-col w-full h-full">
      {/* Top Navigation Bar - Keeps the player oriented */}
      <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-4 shrink-0 bg-slate-900 p-4 rounded-xl shadow-[4px_4px_0px_#000]">
        <span className="text-cyan-400 font-black tracking-widest uppercase text-sm">
          📍 Quest: The Gardener's Trail
        </span>
        <button 
          onClick={() => {
            setCurrentScreen('OVERWORLD');
            setFeedback('');
          }} 
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 text-xs font-black uppercase tracking-wider rounded border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-1"
        >
          🗺️ Return to Map
        </button>
      </div>

      {/* The Dynamic Stage Area - Renders the current scene */}
      <div className="flex-1 w-full h-full relative">
        
        {currentScene === 'CROSSROADS' && (
          <div className="w-full h-full relative flex flex-col">
          {/* DEV CHEAT BUTTON */}
          <button 
            onClick={() => setCurrentScene('HUNGER')}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-red-500 border-2 border-black px-4 py-1 font-black text-white text-xs shadow-[2px_2px_0px_#000]"
          >
            🛠️ DEV CHEAT: Skip to Hunger
          </button>
    
          <CrossroadsScene onComplete={() => setCurrentScene('HUNGER')} />
         </div>
        )}

        {currentScene === 'HUNGER' && (
          <HungerTrialScene onComplete={() => setCurrentScene('RIVER')} />
        )}

        {currentScene === 'RIVER' && (
          <div className="w-full h-full bg-slate-800 border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl font-black mb-4">The Rushing Waters</h1>
            <p className="text-xl">Component coming soon! (Wireframe in progress)</p>
            <button 
              onClick={() => setCurrentScene('BATTLE_READY')}
              className="mt-8 bg-green-500 border-2 border-black p-4 font-black text-black shadow-[4px_4px_0px_#000]"
            >
              Skip to Battle (Dev Cheat)
            </button>
          </div>
        )}

        {currentScene === 'BATTLE_READY' && (
           <div className="w-full h-full bg-amber-100 border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] flex flex-col items-center justify-center text-black">
              <h1 className="text-5xl font-black mb-4">⚔️ WEAPON FORGED ⚔️</h1>
              <p className="text-2xl font-bold italic mb-8">"Now faith is the assurance of things hoped for, the conviction of things not seen."</p>
              <button 
                onClick={() => setCurrentScreen('BATTLE')}
                className="bg-red-500 hover:bg-red-400 text-white border-4 border-black p-6 rounded-xl font-black text-2xl shadow-[8px_8px_0px_#000] animate-pulse"
              >
                BATTLE THE SILENCER!
              </button>
           </div>
        )}
      </div>
    </div>
  );
}