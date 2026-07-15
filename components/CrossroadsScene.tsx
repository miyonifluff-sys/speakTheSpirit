'use client';

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { addLog } from '../utils/gameEvents';

export default function CrossroadsScene({ onComplete }: { onComplete?: () => void }) {
  const { setCurrentScreen, setQuestObjectClicked } = useGame();

  // 'fork' | 'ghosts' | 'x-marks' | 'chest' | 'modal' | 'solved'
  const [stageState, setStageState] = useState('fork');
  
  // Right Console States
  const [angelChat, setAngelChat] = useState("Traveler, choose your path using the D-Pad. The paved road looks easy, but what does the riddle say?");
  const [askInput, setAskInput] = useState("");
  const [glooResponses, setGlooResponses] = useState<string[]>([]);

  // Modal Specific State
  const [modalFeedback, setModalFeedback] = useState("");

  const handleMove = (direction: string) => {
    if (stageState === 'fork') {
      if (direction === 'LEFT' || direction === 'UP') {
        setStageState('ghosts');
        setAngelChat("Oh no! The ghosts of doubt and distraction! This isn't the right way. Use the D-Pad to go back.");
        addLog("Wandered into the ghosts.", "system");
      } else if (direction === 'RIGHT') {
        setStageState('x-marks');
        setAngelChat("Go click X! You found the hidden dirt trail. The Gardener left something here for you.");
        addLog("Found the dirt trail.", "system");
      }
    } else if (stageState === 'ghosts' && direction === 'DOWN') {
      setStageState('fork');
      setAngelChat("Phew, back at the crossroads. Try the other path!");
    }
  };

  const handleAskGloo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askInput.trim()) return;
    
    // Mock Gloo API Response
    const newResponse = `[Gloo Bot]: Great question about "${askInput}"! Remember, faith is active, not just passive thinking.`;
    setGlooResponses(prev => [...prev, newResponse]);
    setAskInput("");
  };

  return (
    <div className="w-full h-full flex bg-slate-950 border-4 border-black overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-xl relative">
      
      {/* 🔴 LEFT SIDE: INTERACTIVE STAGE (60%) */}
      <div className="w-[60%] h-full bg-amber-50 relative flex flex-col items-center justify-center border-r-4 border-black">
        
        {/* WEAPON TRACKER HUD */}
        <div className="absolute top-4 left-4 bg-white border-2 border-black p-2 rounded shadow-[2px_2px_0px_#000] z-20">
          <h3 className="text-[10px] font-black uppercase text-amber-700">Weapon Tracker</h3>
          <p className="text-xs font-bold text-slate-800">
            {stageState === 'solved' ? "Now faith is..." : "[ _ _ _ _ _ ]"}
          </p>
        </div>

        {/* SCENE RENDERING */}
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
          
          {stageState === 'fork' && (
            <div className="relative w-full h-full flex">
              {/* Paved Path (Left) */}
              <div className="w-1/2 h-full bg-slate-300 border-r-4 border-black border-dashed flex items-center justify-center">
                <span className="text-slate-500 font-bold uppercase rotate-[-45deg]">Paved Path</span>
              </div>
              {/* Dirt Path (Right) */}
              <div className="w-1/2 h-full bg-amber-700 flex items-center justify-center">
                <span className="text-amber-300 font-bold uppercase rotate-[45deg]">Dirt Path</span>
              </div>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-6xl drop-shadow-md animate-bounce">
                🧍
              </div>
            </div>
          )}

          {stageState === 'ghosts' && (
            <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-center p-8">
              <div className="flex gap-8 mb-8 text-6xl animate-pulse">
                <span>👻</span>
                <span className="mt-8">👻</span>
              </div>
              <div className="text-4xl">🧍</div>
              <p className="mt-8 bg-red-500 text-white font-black p-4 border-4 border-black shadow-[4px_4px_0px_#000]">
                WRONG WAY! GO BACK DOWN!
              </p>
            </div>
          )}

          {stageState === 'x-marks' && (
            <div className="w-full h-full bg-amber-700 flex flex-col items-center justify-center">
              <button 
                onClick={() => {
                  setStageState('chest');
                  setAngelChat("You dug it up! It's a locked chest. Click on the lock to break it!");
                }}
                className="text-8xl hover:scale-110 transition-transform cursor-pointer drop-shadow-xl"
              >
                ❌
              </button>
              <div className="text-5xl mt-12 flex gap-4 items-center">
                <span>🧍</span>
                <span>⛏️</span>
              </div>
            </div>
          )}

          {stageState === 'chest' && (
            <div className="w-full h-full bg-amber-700 flex flex-col items-center justify-center">
              <button 
                onClick={() => setStageState('modal')}
                className="text-9xl hover:scale-110 transition-transform cursor-pointer drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-wiggle"
              >
                📦
              </button>
              <p className="mt-4 bg-white border-2 border-black font-black px-4 py-2 uppercase shadow-[2px_2px_0px_#000]">
                Click to Open
              </p>
            </div>
          )}

          {stageState === 'solved' && (
            <div className="w-full h-full bg-amber-50 flex flex-col items-center justify-center bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px]">
              <div className="bg-yellow-100 border-4 border-black p-8 shadow-[8px_8px_0px_#000] max-w-sm text-center animate-fade-in">
                <h2 className="text-2xl font-black mb-4">📜 SCROLL UNLOCKED</h2>
                <p className="text-xl font-bold italic text-amber-900">
                  "Now faith is..."
                </p>
              </div>
              <div className="text-6xl mt-8">🧍🙌</div>
            </div>
          )}
        </div>

        {/* D-PAD CONTROLS (Hidden if digging/solved) */}
        {(stageState === 'fork' || stageState === 'ghosts') && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 bg-slate-900 p-3 rounded-full border-4 border-black shadow-[0_4px_0_#000]">
            {/* Added text-black, text-xl, and font-black to all buttons below */}
            <button 
              onClick={() => handleMove('UP')} 
              className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1 shadow-[1px_1px_0px_#000]"
            >
              ↑
            </button>
            <div className="flex gap-1">
              <button 
                onClick={() => handleMove('LEFT')} 
                className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1 shadow-[1px_1px_0px_#000]"
              >
                ←
              </button>
              <button 
                onClick={() => handleMove('DOWN')} 
                className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1 shadow-[1px_1px_0px_#000]"
              >
                ↓
              </button>
              <button 
                onClick={() => handleMove('RIGHT')} 
                className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1 shadow-[1px_1px_0px_#000]"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🔵 RIGHT SIDE: ANGEL CONSOLE (40%) */}
      <div className="w-[40%] h-full bg-slate-200 flex flex-col">
        
        {/* Riddle Box */}
        <div className="p-4 border-b-4 border-black bg-white">
          <h2 className="font-black text-sm uppercase mb-2">📜 Riddle</h2>
          <p className="text-xs font-bold italic text-slate-700">
            "Where cobblestones end and hidden trails start,<br/>
            Choose the path less traveled with all of your heart."
          </p>
        </div>

        {/* Chat with Angel */}
        <div className="flex-1 p-4 border-b-4 border-black overflow-y-auto bg-slate-100 flex flex-col gap-4">
          {/* Added text-black to the header */}
          <h2 className="font-black text-sm uppercase bg-yellow-300 text-black inline-block px-2 border-2 border-black self-start">
            Chat with Angel 👼
          </h2>
          
          {/* Added text-black to the Angel's bubble */}
          <div className="bg-white text-black border-2 border-black p-3 rounded-r-xl rounded-bl-xl shadow-[2px_2px_0px_#000] text-sm font-bold">
            {angelChat}
          </div>

          {/* Added text-black to the Gloo bot responses */}
          {glooResponses.map((res, i) => (
            <div key={i} className="bg-cyan-100 text-black border-2 border-black p-3 rounded-l-xl rounded-br-xl shadow-[2px_2px_0px_#000] text-sm font-bold text-right self-end ml-8">
              {res}
            </div>
          ))}
        </div>

        {/* Ask Question Input */}
        <div className="p-4 bg-slate-300">
          <form onSubmit={handleAskGloo} className="flex gap-2">
            <input 
              type="text" 
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-white text-black placeholder-slate-500 border-2 border-black p-2 text-sm font-bold"
            />
            <button type="submit" className="bg-blue-500 text-white font-black px-4 py-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-blue-400 active:translate-y-1">
              ASK
            </button>
          </form>
        </div>

        {/* Next Scene Button (Only shows when solved) */}
        {stageState === 'solved' && (
           <div className="p-4 bg-green-400 border-t-4 border-black">
              <button 
                onClick={() => {
                    if (onComplete) onComplete();
                    }}
                
                className="w-full bg-black text-white font-black py-3 uppercase shadow-[4px_4px_0px_#fff] border-2 border-white hover:bg-slate-800"
              >
                Continue to Hunger Trial ➔
              </button>
           </div>
        )}
      </div>

      {/* 🟡 LOCK MODAL OVERLAY */}
      {stageState === 'modal' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-8 backdrop-blur-sm">
          {/* Changed to bg-slate-900 and text-white */}
          <div className="bg-slate-900 text-white w-full max-w-2xl border-4 border-black shadow-[8px_8px_0px_#fbbf24] p-8 rounded-xl flex flex-col">
            
            <div className="flex gap-6">
              {/* Lock Graphic */}
              <div className="w-1/3 flex flex-col items-center justify-center border-r-4 border-slate-700 pr-6">
                <h2 className="text-2xl font-black uppercase mb-4 text-center text-slate-200">Break the Lock!</h2>
                <div className="text-8xl">🔒</div>
              </div>

              {/* Gloo Question Area */}
              <div className="w-2/3 pl-6">
                <p className="font-bold text-lg mb-4 text-white">
                  What is the true meaning of the Greek word <span className="bg-yellow-400 text-black px-1">Pistis</span> (Faith)?
                </p>

                {modalFeedback && (
                  <div className="mb-4 bg-red-900/50 border-2 border-red-500 text-red-200 font-bold p-2 text-sm">
                    {modalFeedback}
                  </div>
                )}

                <div className="space-y-3">
                  {/* Changed buttons to dark theme (bg-slate-800) */}
                  <button 
                    onClick={() => setModalFeedback("Not quite! Just knowing facts doesn't make you step onto the dirt path. Ask the Angel for help below!")}
                    className="w-full text-left bg-slate-800 hover:bg-slate-700 text-white border-2 border-black p-3 font-bold text-sm shadow-[2px_2px_0px_#000] transition-colors"
                  >
                    A) Knowing lots of facts and trivia about the Gardener.
                  </button>
                  <button 
                    onClick={() => {
                      setStageState('solved');
                      setAngelChat("YAY YAY YAY! You unlocked the truth!");
                    }}
                    className="w-full text-left bg-slate-800 hover:bg-slate-700 text-white border-2 border-black p-3 font-bold text-sm shadow-[2px_2px_0px_#000] transition-colors"
                  >
                    B) Active loyalty and deep trust that makes you willing to do what He says.
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-slate-700">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">Clarify with Angel (Gloo API)</p>
                  <form onSubmit={handleAskGloo} className="flex gap-2">
                    {/* Changed input to dark theme */}
                    <input 
                      type="text" 
                      value={askInput}
                      onChange={(e) => setAskInput(e.target.value)}
                      placeholder="I don't understand..."
                      className="flex-1 bg-slate-800 text-white placeholder-slate-500 border-2 border-black p-2 text-sm font-bold"
                    />
                    {/* Changed button to cyan to match your app header */}
                    <button type="submit" className="bg-cyan-500 text-black font-black px-4 border-2 border-black hover:bg-cyan-400 transition-colors">
                      Chat Here
                    </button>
                  </form>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}