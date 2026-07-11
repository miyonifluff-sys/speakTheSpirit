'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import { addLog } from '../utils/gameEvents';

export default function QuestRiddle() {
  const { 
    questObjectClicked, 
    setQuestObjectClicked, 
    setCurrentScreen, 
    setFeedback, 
    setBattleShieldHp, 
    setBattleStep 
  } = useGame();

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center border-b-2 border-slate-700 pb-3 mb-4">
          <span className="text-cyan-400 font-black tracking-widest uppercase text-xs">Phase 3: Quest / Riddle</span>
          <button 
            onClick={() => {
              setCurrentScreen('OVERWORLD');
              setFeedback('');
            }} 
            className="bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 text-xs font-bold rounded border border-black neo-btn"
          >
            🗺️ Return to Map
          </button>
        </div>

        <div className="flex items-start gap-4 bg-slate-900 p-4 border-4 border-black rounded-xl mb-6 shadow-[3px_3px_0px_#000]">
          <div className="w-12 h-12 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center text-2xl shrink-0">👼</div>
          <div>
            <p className="text-yellow-400 font-bold text-xs uppercase">Riddle Prompt from Angel Gabriel</p>
            <p className="text-sm italic text-slate-200 mt-1">
              {"\"Find a message from the maker at the crumbling wall.\""}
            </p>
          </div>
        </div>

        <div className="bg-amber-100 border-4 border-black p-6 rounded-2xl flex flex-col items-center justify-center text-black shadow-[4px_4px_0px_#000] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
          <h4 className="font-black text-sm uppercase tracking-wider text-amber-900 mb-2">🧱 The Crumbling Wall 🧱</h4>
          
          <div className="w-full max-w-sm flex flex-col gap-1 border-2 border-black bg-stone-300 p-2 rounded-lg mb-4 shadow-inner">
            <div className="flex gap-1">
              <div className="flex-1 bg-stone-400 h-6 border border-stone-500 rounded"></div>
              <div className="flex-1 bg-stone-500 h-6 border border-stone-600 rounded"></div>
              <div className="flex-1 bg-stone-400 h-6 border border-stone-500 rounded"></div>
            </div>
            <div className="flex gap-1 pl-4">
              <div className="flex-1 bg-stone-500 h-6 border border-stone-600 rounded"></div>
              <div className="flex-1 bg-stone-400 h-6 border border-stone-500 rounded"></div>
            </div>
            <div className="flex gap-1">
              <div className="flex-1 bg-stone-400 h-6 border border-stone-500 rounded"></div>
              <div className="flex-1 bg-stone-500 h-6 border border-stone-600 rounded font-black text-center text-xs flex items-center justify-center text-amber-900">
                WALL CRACK
              </div>
              <div className="flex-1 bg-stone-400 h-6 border border-stone-500 rounded"></div>
            </div>
          </div>

          {!questObjectClicked ? (
            <button
              onClick={() => {
                setQuestObjectClicked(true);
                addLog("You touched the shining fruit labeled 'John 3:16'!", "system");
                addLog("Verse Revealed: 'For God so loved the world, that he gave his only Son...'", "angel");
              }}
              className="bg-red-500 hover:bg-red-400 border-3 border-black p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 neo-btn animate-float text-white"
            >
              <span className="text-4xl">🍓</span>
              <span className="bg-black text-yellow-400 text-xs px-2 py-0.5 rounded font-mono font-black">{"John 3:16"}</span>
              <span className="text-[10px] uppercase tracking-wider text-black font-extrabold bg-white/90 px-1 rounded">👆 Click Fruit to Examine</span>
            </button>
          ) : (
            <div className="bg-yellow-100 border-4 border-yellow-500 p-4 rounded-xl w-full max-w-lg animate-float">
              <div className="flex justify-between items-start">
                <span className="font-black text-amber-800 text-xs">{"📖 UNLOCKED GARDENER'S DECREE:"}</span>
                <span className="text-xl">✨🍓✨</span>
              </div>
              <p className="text-sm font-bold italic text-slate-800 mt-2 leading-relaxed bg-white p-3 border-2 border-black rounded-lg">
                {"\"For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.\""}
              </p>
              <p className="text-xs font-black text-green-700 uppercase tracking-wider mt-3 text-center">
                🔑 Truth vibration loaded! The Silencer can now be combated!
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-slate-700 flex justify-between items-center">
        <span className="text-slate-400 text-xs">
          {questObjectClicked ? "🔓 Quest Objective Met!" : "🔒 Objective: Find the John 3:16 clue"}
        </span>
        {questObjectClicked ? (
          <button
            onClick={() => {
              addLog("Initiating encounter with Faith Island Silencer!", "system");
              setBattleShieldHp(100);
              setBattleStep(0);
              setFeedback('');
              setCurrentScreen('BATTLE');
            }}
            className="bg-red-500 text-white font-black uppercase text-sm px-6 py-3 rounded-xl neo-btn animate-pulse flex items-center gap-2"
          >
            {"⚔️ Battle Silencer! ⚔️"}
          </button>
        ) : (
          <button disabled className="bg-slate-700 text-slate-500 font-bold uppercase text-sm px-6 py-3 rounded-xl border-3 border-slate-900 cursor-not-allowed opacity-50">
            Battle Locked
          </button>
        )}
      </div>
    </div>
  );
}
