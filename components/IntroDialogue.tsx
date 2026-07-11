'use client';

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { addLog } from '../utils/gameEvents';

export default function IntroDialogue() {
  const { introStep, setIntroStep, setCurrentScreen } = useGame();

  const handleNext = () => {
    const steps = [
      "Teleported into the burning world.",
      "Met Angel Gabriel. He presented the quest gear.",
      "Inquired about the status of the Silent Valley.",
      "Learned the lore of the Gardener, Songbeasts, and Silencers."
    ];
    addLog(steps[introStep], "angel");
    setIntroStep(introStep + 1);
  };

  return (
    <div className="flex-1 flex flex-col justify-between relative">
      <div className="absolute inset-0 -m-6 bg-gradient-to-b from-red-950 via-slate-950 to-slate-950 opacity-90 -z-10 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] animate-pulse"></div>
      </div>

      <div>
        <div className="flex justify-between items-center border-b-2 border-slate-700 pb-3 mb-4">
          <span className="text-red-400 font-black tracking-widest uppercase text-xs">Phase 1: Intro Dialogue</span>
          <button 
            onClick={() => {
              setCurrentScreen('OVERWORLD');
              addLog("Skipped introduction sequence.", "system");
            }} 
            className="bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 text-xs font-bold rounded border border-black"
          >
            Skip Intro ⏭️
          </button>
        </div>

        <div className="my-4 min-h-[140px] flex items-center justify-center">
          {introStep === 0 && (
            <div className="text-center animate-float">
              <p className="text-2xl font-black text-orange-400 tracking-wider uppercase mb-3">⚡ teleportation vortex ⚡</p>
              <p className="text-lg leading-relaxed text-slate-200">
                Whoosh! You are suddenly ripped from reality and teleported into a burning world. 
                Ash falls from a blood-red sky, and a heavy, artificial silence suffocates the atmosphere.
              </p>
            </div>
          )}
          {introStep === 1 && (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-yellow-400 border-4 border-black flex items-center justify-center text-4xl shadow-[3px_3px_0px_#000] animate-bounce shrink-0">👼</div>
              <div>
                <p className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-1">Angel Gabriel approaches:</p>
                <p className="text-lg italic leading-relaxed text-slate-200">{"\"Thank God you're here! Let me show you your gear.\""}</p>
              </div>
            </div>
          )}
          {introStep === 2 && (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-blue-500 border-4 border-black flex items-center justify-center text-4xl shadow-[3px_3px_0px_#000] shrink-0">👤</div>
              <div>
                <p className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-1">You (The Messenger):</p>
                <p className="text-lg font-semibold leading-relaxed text-slate-200">{"\"What's going on?\""}</p>
              </div>
            </div>
          )}
          {introStep === 3 && (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-yellow-400 border-4 border-black flex items-center justify-center text-4xl shadow-[3px_3px_0px_#000] shrink-0">👼</div>
              <div>
                <p className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-1">Angel Gabriel explains:</p>
                <p className="text-base leading-relaxed text-slate-200">
                  {"The Great Gardener created this valley of beautiful songs, but the Silencers invaded. They force heavy magnetic headphones and screen-lock phones onto the local Songbeasts, trapping them in silent numbness. We must preach the Spirit's verses to unlock their songs!"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t-2 border-slate-700 flex items-center justify-between">
        <span className="text-slate-400 text-xs">Step {introStep + 1} of 4</span>
        {introStep < 3 ? (
          <button onClick={handleNext} className="bg-yellow-400 text-black font-black uppercase text-sm px-6 py-3 rounded-xl neo-btn">
            Next Dialogue ➡️
          </button>
        ) : (
          <button
            onClick={() => {
              addLog("Finished introductory sequence. Opened Overworld Map.", "system");
              setCurrentScreen('OVERWORLD');
            }}
            className="bg-green-500 text-white font-black uppercase text-sm px-6 py-3 rounded-xl neo-btn"
          >
            Go to Overworld Map 🗺️
          </button>
        )}
      </div>
    </div>
  );
}
