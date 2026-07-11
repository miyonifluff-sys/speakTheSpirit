'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import { addLog as emitGameLog } from '../utils/gameEvents';

export default function BattleArea() {
  const { 
    battleShieldHp, 
    setBattleShieldHp, 
    battleStep, 
    setBattleStep, 
    feedback, 
    setFeedback, 
    triggerShake, 
    hasSwordOfTruth, 
    setPortalActive, 
    setCurrentScreen, 
    setFeedback: updateFeedback 
  } = useGame();

  const battleRounds = [
    {
      question: "For God so ________ the world...",
      correct: "Loved",
      options: ["Hated", "Loved", "Forgot", "Created"],
    },
    {
      question: "...that He gave His only begotten ________...",
      correct: "Son",
      options: ["Servant", "Prophet", "Son", "Book"],
    },
    {
      question: "...that whoever believes in Him should not perish but have eternal ________.",
      correct: "Life",
      options: ["Riches", "Life", "Fame", "Comfort"],
    }
  ];

  const handleBattleAnswer = (answer: string) => {
    const currentRound = battleRounds[battleStep];
    if (answer === currentRound.correct) {
      emitGameLog(`Correct! Selected "${answer}". The Silencer's shield takes damage!`, "battle");
      const nextHp = Math.max(0, battleShieldHp - 33);
      setBattleShieldHp(nextHp);
      if (battleStep < 2) {
        setBattleStep(battleStep + 1);
        setFeedback("Holy frequencies matching! Keep decoding!");
      } else {
        setBattleShieldHp(0);
        setFeedback("Shield fully neutralized! The Songbeast is ready to be restored!");
        emitGameLog("The Silencer's noise shield is down! Trigger the restoration portal!", "system");
      }
    } else {
      triggerShake();
      setFeedback("Static interference! That word didn't match the vibration of Truth.");
      emitGameLog(`Incorrect answer "${answer}". The Silencer's shield deflected the strike.`, "battle");
    }
  };

  const handleUseSwordOfTruth = () => {
    if (!hasSwordOfTruth) return;
    emitGameLog("You raise the Sword of Truth! Pure radiant light pierces the static barrier!", "battle");
    setBattleShieldHp(0);
    setBattleStep(2);
    setFeedback("The Sword of Truth instantly shattered the Silencer's barrier!");
  };

  const handleTriggerPortal = () => {
    setPortalActive(true);
    emitGameLog("Activating Born Again Portal... Restoring frequencies!", "system");
    setTimeout(() => {
      setPortalActive(false);
      setCurrentScreen('DEBRIEF');
      emitGameLog("Songbeast Barnaby restored successfully! Entering debrief phase.", "songbeast");
    }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center border-b-2 border-slate-700 pb-3 mb-4">
          <span className="text-purple-400 font-black tracking-widest uppercase text-xs">Phase 4: Battle Area</span>
          <span className="bg-red-950 text-red-400 px-2.5 py-1 text-xs font-bold rounded-lg border border-red-800 animate-pulse">
            COMBAT ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900/80 border-4 border-black p-4 rounded-xl flex flex-col items-center justify-between relative shadow-[3px_3px_0px_#000]">
            <div className="text-center">
              <p className="text-xs font-black text-pink-400 uppercase tracking-wider">Captive Songbeast</p>
              <h4 className="font-extrabold text-base text-slate-200 mt-1">Barnaby the Bunny 🐰</h4>
            </div>
            <div className="my-4 relative">
              {battleShieldHp > 0 ? (
                <div className="flex flex-col items-center">
                  <span className="text-6xl filter grayscale opacity-75">🐰</span>
                  <div className="absolute -top-3 -right-3 text-3xl animate-pulse">🎧</div>
                  <div className="absolute -bottom-2 -left-3 text-3xl animate-bounce">📱</div>
                  <span className="bg-red-600 text-white font-mono font-black text-[10px] px-2 py-0.5 rounded uppercase mt-2 animate-pulse">😵‍💫 HYPNOTIZED (MUTED)</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-6xl animate-bounce">🐰</span>
                  <div className="absolute -top-3 text-2xl animate-float">🎵</div>
                  <span className="bg-green-500 text-black font-mono font-black text-[10px] px-2 py-0.5 rounded uppercase mt-2">🌟 FREEDOM NEAR!</span>
                </div>
              )}
            </div>
            <div className="w-full bg-slate-950 h-5 border-2 border-black rounded-lg overflow-hidden flex items-center justify-center relative">
              <div className="absolute left-0 top-0 bottom-0 bg-red-500 transition-all duration-300" style={{ width: `${battleShieldHp}%` }}></div>
              <span className="z-10 text-[10px] font-black text-white mix-blend-difference">NOISE BARRIER: {battleShieldHp}%</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border-4 border-black p-4 rounded-xl flex flex-col items-center justify-between shadow-[3px_3px_0px_#000]">
            <div className="text-center">
              <p className="text-xs font-black text-red-400 uppercase tracking-wider">Invader Enemy</p>
              <h4 className="font-extrabold text-base text-slate-200 mt-1">Noise Silencer Bot 🤖</h4>
            </div>
            <div className="my-4 animate-float">
              {battleShieldHp > 0 ? <span className="text-6xl">🤖📡</span> : <span className="text-6xl filter sepia opacity-40 grayscale rotate-45 transition-transform duration-500">💥</span>}
            </div>
            <div className="text-center">
              {battleShieldHp > 0 ? (
                <span className="bg-slate-800 text-red-400 font-mono text-[10px] px-2.5 py-1 border-2 border-red-900 rounded uppercase">📢 Blasting Static Frequencies</span>
              ) : (
                <span className="bg-slate-800 text-green-400 font-mono text-[10px] px-2.5 py-1 border-2 border-green-900 rounded uppercase">☠️ System De-energized</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-4 border-4 border-black rounded-xl">
          {battleShieldHp > 0 ? (
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                <span className="text-yellow-400 font-black text-xs uppercase">Decryption Cipher</span>
                <span className="text-slate-400 text-xs">Round {battleStep + 1} of 3</span>
              </div>
              <p className="text-sm font-black text-center text-slate-200 py-3 bg-slate-900 border border-slate-700 rounded-lg px-2">
                {battleRounds[battleStep].question}
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {battleRounds[battleStep].options.map((opt, idx) => (
                  <button key={idx} onClick={() => handleBattleAnswer(opt)} className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-2.5 rounded-lg neo-btn text-sm uppercase">
                    {opt}
                  </button>
                ))}
              </div>
              {hasSwordOfTruth && (
                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-center">
                  <button onClick={handleUseSwordOfTruth} className="bg-yellow-400 text-black font-black uppercase text-xs px-4 py-2 rounded-lg neo-btn flex items-center gap-1.5">
                    ⚔️ Use Sword of Truth (Instant Shield Shatter!)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-green-400 font-black text-xl mb-2 animate-bounce">🛡️ SHIELD NEUTRALIZED! 🛡️</p>
              <p className="text-xs text-slate-300 max-w-md mx-auto mb-6">
                {"The static broadcasting is defeated! The Songbeast is longing to sing the Gardener's melodies. Use your spiritual resonance to open the restoration portal now!"}
              </p>
              <button onClick={handleTriggerPortal} className="bg-green-500 hover:bg-green-400 text-white font-black uppercase text-lg px-8 py-4 rounded-2xl neo-btn animate-pulse">
                {"✨ RESTORE SONGBEAST! ✨"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-3 border-t-2 border-slate-700 flex justify-between items-center text-xs">
        <span className="text-pink-400 font-bold animate-pulse">{feedback}</span>
        <button onClick={() => setCurrentScreen('OVERWORLD')} className="text-slate-400 hover:text-white underline font-semibold">
          Retreat to Overworld
        </button>
      </div>
    </div>
  );
}
