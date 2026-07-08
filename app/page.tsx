'use client';

import React, { useState, useEffect } from 'react';

// Screen Types
type Screen = 'INTRO' | 'OVERWORLD' | 'QUEST' | 'BATTLE' | 'DEBRIEF' | 'SHOP';

// Game Log Entry
interface LogEntry {
  text: string;
  type: 'system' | 'angel' | 'battle' | 'shop' | 'songbeast';
  timestamp: string;
}

export default function Home() {
  // Screen Routing State
  const [currentScreen, setCurrentScreen] = useState<Screen>('INTRO');
  
  // Progression & Game States
  const [introStep, setIntroStep] = useState<number>(0);
  const [questObjectClicked, setQuestObjectClicked] = useState<boolean>(false);
  const [battleStep, setBattleStep] = useState<number>(0);
  const [battleShieldHp, setBattleShieldHp] = useState<number>(100);
  const [portalActive, setPortalActive] = useState<boolean>(false);
  const [isSongbeastRehomed, setIsSongbeastRehomed] = useState<boolean>(false);
  
  // Inventory / Currencies
  const [cupcakes, setCupcakes] = useState<number>(4); // Start with 4 to afford a ticket or water
  const [cucumbers, setCucumbers] = useState<number>(0);
  const [tickets, setTickets] = useState<number>(1); // Start with 1 ticket
  const [hasSwordOfTruth, setHasSwordOfTruth] = useState<boolean>(false);
  const [hasHolyWater, setHasHolyWater] = useState<boolean>(false);

  // Interface Feedbacks
  const [feedback, setFeedback] = useState<string>('');
  const [shakeTrigger, setShakeTrigger] = useState<boolean>(false);
  const [gameLogs, setGameLogs] = useState<LogEntry[]>([]);

  // Add event log helper
  const addLog = (text: string, type: LogEntry['type']) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setGameLogs((prev) => [{ text, type, timestamp: time }, ...prev].slice(0, 50));
  };

  // Log initial game launch safely asynchronously to avoid synchronous setState inside render loop
  useEffect(() => {
    const timer = setTimeout(() => {
      addLog("Game loaded. Teleporting into the realm...", "system");
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Helper to trigger shaking visual
  const triggerShake = () => {
    setShakeTrigger(true);
    setTimeout(() => setShakeTrigger(false), 500);
  };

  // Reset Game Helper
  const handleResetGame = () => {
    setCurrentScreen('INTRO');
    setIntroStep(0);
    setQuestObjectClicked(false);
    setBattleStep(0);
    setBattleShieldHp(100);
    setPortalActive(false);
    setIsSongbeastRehomed(false);
    setCupcakes(4);
    setCucumbers(0);
    setTickets(1);
    setHasSwordOfTruth(false);
    setHasHolyWater(false);
    setFeedback('');
    setGameLogs([]);
    addLog("Game reset successfully! Teleporting again...", "system");
  };

  // Mini-Game Battle Options
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
      addLog(`Correct! Selected "${answer}". The Silencer's shield takes damage!`, "battle");
      
      const nextHp = Math.max(0, battleShieldHp - 33);
      setBattleShieldHp(nextHp);

      if (battleStep < 2) {
        setBattleStep(battleStep + 1);
        setFeedback("Holy frequencies matching! Keep decoding!");
      } else {
        // Last step answered
        setBattleShieldHp(0);
        setFeedback("Shield fully neutralized! The Songbeast is ready to be restored!");
        addLog("The Silencer's noise shield is down! Trigger the restoration portal!", "system");
      }
    } else {
      triggerShake();
      setFeedback("Static interference! That word didn't match the vibration of Truth.");
      addLog(`Incorrect answer "${answer}". The Silencer's shield deflected the strike.`, "battle");
    }
  };

  // Instantly finish battle using Sword of Truth
  const handleUseSwordOfTruth = () => {
    if (!hasSwordOfTruth) return;
    addLog("You raise the Sword of Truth! Pure radiant light pierces the static barrier!", "battle");
    setBattleShieldHp(0);
    setBattleStep(2);
    setFeedback("The Sword of Truth instantly shattered the Silencer's barrier!");
  };

  // Trigger Portal Animation & transition to Debrief
  const handleTriggerPortal = () => {
    setPortalActive(true);
    addLog("Activating Born Again Portal... Restoring frequencies!", "system");
    
    setTimeout(() => {
      setPortalActive(false);
      setCurrentScreen('DEBRIEF');
      addLog("Songbeast Barnaby restored successfully! Entering debrief phase.", "songbeast");
    }, 2500);
  };

  // Give Ticket to Barnaby
  const handleGiveTicket = () => {
    if (tickets <= 0) {
      setFeedback("Oh no! You don't have any Basecamp Tickets in your inventory.");
      triggerShake();
      return;
    }
    setTickets(tickets - 1);
    setIsSongbeastRehomed(true);
    // Reward player
    setCupcakes(cupcakes + 5);
    setCucumbers(cucumbers + 2);
    addLog("Sent Barnaby safe to Basecamp via Ticket! Gained +5 Cupcakes and +2 Cucumbers!", "songbeast");
    setFeedback("Barnaby: 'Hooray! Thank you for rescuing me! See you back at the Castle!'");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-mono p-4 flex flex-col items-center justify-start selection:bg-yellow-400 selection:text-black">
      
      {/* Dynamic Custom Keyframe Animations CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes radial-pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.15); opacity: 0.35; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-shake-box { animation: shake 0.4s ease-in-out; }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        .animate-radial-pulse { animation: radial-pulse 4s ease-in-out infinite; }
        
        /* Cartoony Neobrutalist buttons/cards */
        .neo-card {
          border: 4px solid #000;
          box-shadow: 6px 6px 0px 0px #000;
          transition: all 0.15s ease-out;
        }
        .neo-btn {
          border: 3px solid #000;
          box-shadow: 4px 4px 0px 0px #000;
          transition: all 0.1s ease-out;
        }
        .neo-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 5px 5px 0px 0px #000;
        }
        .neo-btn:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px 0px #000;
        }
        .neo-input {
          border: 3px solid #000;
          box-shadow: inset 3px 3px 0px 0px rgba(0,0,0,0.15);
        }
      `}} />

      {/* Main Game Interface Header */}
      <header className="w-full max-w-4xl bg-yellow-400 text-black neo-card p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl z-10">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-bounce">🛡️</span>
          <div>
            <h1 className="text-xl font-black tracking-wider uppercase">Speak The Spirit</h1>
            <p className="text-xs font-semibold opacity-75">Hackathon Prototype v1.0</p>
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
          <button 
            onClick={handleResetGame}
            className="bg-red-500 text-white hover:bg-red-600 border-2 border-black px-2.5 py-1.5 rounded-lg font-black text-xs uppercase neo-btn"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main Interactive Screen View */}
      <main className={`w-full max-w-4xl min-h-[500px] flex flex-col justify-between p-6 bg-slate-800 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden ${shakeTrigger ? 'animate-shake-box' : ''}`}>
        
        {/* Portal Restoration Swirling Animation Overlay */}
        {portalActive && (
          <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-8 text-center">
            <div className="absolute inset-0 bg-radial-gradient from-violet-600/30 via-transparent to-transparent animate-radial-pulse"></div>
            <div className="w-48 h-48 rounded-full border-8 border-dashed border-cyan-400 animate-spin-slow flex items-center justify-center relative">
              <div className="w-32 h-32 rounded-full border-8 border-dotted border-pink-500 animate-spin flex items-center justify-center">
                <span className="text-6xl animate-ping">✨</span>
              </div>
            </div>
            <h2 className="text-3xl font-black mt-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300 animate-pulse tracking-widest uppercase">
              RESTORING FREQUENCIES
            </h2>
            <p className="text-yellow-400 font-semibold mt-3 animate-bounce">
              {"\"For God so loved the world...\" soundwaves are breaking the silent curse!"}
            </p>
          </div>
        )}

        {/* SCREEN 1: INTRO DIALOGUE */}
        {currentScreen === 'INTRO' && (
          <div className="flex-1 flex flex-col justify-between relative">
            {/* Dark, chaotic burning background placeholder */}
            <div className="absolute inset-0 -m-6 bg-gradient-to-b from-red-950 via-slate-950 to-slate-950 opacity-90 -z-10 overflow-hidden">
              <div className="absolute top-10 left-1/4 w-72 h-72 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
              {/* Simple background ash particle mock */}
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

              {/* Dynamic Narrative Box */}
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
                    <div className="w-24 h-24 rounded-full bg-yellow-400 border-4 border-black flex items-center justify-center text-4xl shadow-[3px_3px_0px_#000] animate-bounce shrink-0">
                      👼
                    </div>
                    <div>
                      <p className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-1">Angel Gabriel approaches:</p>
                      <p className="text-lg italic leading-relaxed text-slate-200">
                        {"\"Thank God you're here! Let me show you your gear.\""}
                      </p>
                    </div>
                  </div>
                )}

                {introStep === 2 && (
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-blue-500 border-4 border-black flex items-center justify-center text-4xl shadow-[3px_3px_0px_#000] shrink-0">
                      👤
                    </div>
                    <div>
                      <p className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-1">You (The Messenger):</p>
                      <p className="text-lg font-semibold leading-relaxed text-slate-200">
                        {"\"What's going on?\""}
                      </p>
                    </div>
                  </div>
                )}

                {introStep === 3 && (
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-yellow-400 border-4 border-black flex items-center justify-center text-4xl shadow-[3px_3px_0px_#000] shrink-0">
                      👼
                    </div>
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

            {/* Navigation controls inside Dialogue */}
            <div className="mt-8 pt-4 border-t-2 border-slate-700 flex items-center justify-between">
              <span className="text-slate-400 text-xs">Step {introStep + 1} of 4</span>
              
              {introStep < 3 ? (
                <button
                  onClick={() => {
                    const steps = [
                      "Teleported into the burning world.",
                      "Met Angel Gabriel. He presented the quest gear.",
                      "Inquired about the status of the Silent Valley.",
                      "Learned the lore of the Gardener, Songbeasts, and Silencers."
                    ];
                    addLog(steps[introStep], "angel");
                    setIntroStep(introStep + 1);
                  }}
                  className="bg-yellow-400 text-black font-black uppercase text-sm px-6 py-3 rounded-xl neo-btn"
                >
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
        )}

        {/* SCREEN 2: OVERWORLD MAP */}
        {currentScreen === 'OVERWORLD' && (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b-2 border-slate-700 pb-3 mb-4">
                <span className="text-green-400 font-black tracking-widest uppercase text-xs">Phase 2: Overworld Map</span>
                <span className="bg-emerald-950 text-emerald-400 px-2.5 py-1 text-xs font-bold rounded-lg border border-emerald-800">
                  Select a Location
                </span>
              </div>

              {/* Decorative map layout representation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                
                {/* 1. FAITH ISLAND */}
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

                {/* 2. BASECAMP / CASTLE (SHOP) */}
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

                {/* 3. HOPE ISLAND */}
                <button
                  onClick={() => {
                    triggerShake();
                    addLog("Tried to enter Hope Island, but it is locked in static mist.", "system");
                    setFeedback("Hope Island is shrouded in toxic mist! Complete Faith Island first to unlock it.");
                  }}
                  className="bg-slate-700 hover:bg-slate-650 text-slate-400 p-4 rounded-xl neo-card flex flex-col justify-between text-left h-36 relative cursor-not-allowed border-dashed"
                >
                  <div className="absolute right-2 bottom-2 text-7xl opacity-10">🔒</div>
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-900 text-slate-500 text-xs font-black px-2 py-0.5 rounded-full">LOCKED</span>
                    <span className="text-xl">🌫️</span>
                  </div>
                  <div>
                    <h3 className="font-black text-lg leading-tight text-slate-300">Hope Island</h3>
                    <p className="text-xs font-medium mt-1">Requires Faith Island clearance. (Locked in Prototype)</p>
                  </div>
                </button>

                {/* 4. LOVE ISLAND */}
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

            {/* Hint Box */}
            <div className="bg-slate-900/60 p-3 border-2 border-slate-700 rounded-lg text-xs flex justify-between items-center mt-4">
              <p className="text-yellow-400 font-bold">
                💡 Hint: Go to Faith Island to start the quest, or visit Basecamp Castle to purchase gear!
              </p>
              {feedback && (
                <span className="text-pink-400 font-bold text-right ml-2 animate-pulse">{feedback}</span>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 3: QUEST / RIDDLE SCREEN */}
        {currentScreen === 'QUEST' && (
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

              {/* Angel's Riddle instruction bubble */}
              <div className="flex items-start gap-4 bg-slate-900 p-4 border-4 border-black rounded-xl mb-6 shadow-[3px_3px_0px_#000]">
                <div className="w-12 h-12 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center text-2xl shrink-0">
                  👼
                </div>
                <div>
                  <p className="text-yellow-400 font-bold text-xs uppercase">Riddle Prompt from Angel Gabriel</p>
                  <p className="text-sm italic text-slate-200 mt-1">
                    {"\"Find a message from the maker at the crumbling wall.\""}
                  </p>
                </div>
              </div>

              {/* Visual Placeholder for Crumbling Wall and Fruit */}
              <div className="bg-amber-100 border-4 border-black p-6 rounded-2xl flex flex-col items-center justify-center text-black shadow-[4px_4px_0px_#000] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                
                <h4 className="font-black text-sm uppercase tracking-wider text-amber-900 mb-2">🧱 The Crumbling Wall 🧱</h4>
                
                {/* The wall representation */}
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

                {/* Clickable Fruit */}
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
                    <span className="bg-black text-yellow-400 text-xs px-2 py-0.5 rounded font-mono font-black">
                      {"John 3:16"}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-black font-extrabold bg-white/90 px-1 rounded">
                      👆 Click Fruit to Examine
                    </span>
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

            {/* Bottom transition actions */}
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
                <button
                  disabled
                  className="bg-slate-700 text-slate-500 font-bold uppercase text-sm px-6 py-3 rounded-xl border-3 border-slate-900 cursor-not-allowed opacity-50"
                >
                  Battle Locked
                </button>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 4: BATTLE SCREEN */}
        {currentScreen === 'BATTLE' && (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b-2 border-slate-700 pb-3 mb-4">
                <span className="text-purple-400 font-black tracking-widest uppercase text-xs">Phase 4: Battle Area</span>
                <span className="bg-red-950 text-red-400 px-2.5 py-1 text-xs font-bold rounded-lg border border-red-800 animate-pulse">
                  COMBAT ACTIVE
                </span>
              </div>

              {/* Combatants Side-by-Side Visual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                
                {/* Captured Songbeast */}
                <div className="bg-slate-900/80 border-4 border-black p-4 rounded-xl flex flex-col items-center justify-between relative shadow-[3px_3px_0px_#000]">
                  <div className="text-center">
                    <p className="text-xs font-black text-pink-400 uppercase tracking-wider">Captive Songbeast</p>
                    <h4 className="font-extrabold text-base text-slate-200 mt-1">Barnaby the Bunny 🐰</h4>
                  </div>

                  <div className="my-4 relative">
                    {battleShieldHp > 0 ? (
                      <div className="flex flex-col items-center">
                        {/* Trapped State */}
                        <span className="text-6xl filter grayscale opacity-75">🐰</span>
                        <div className="absolute -top-3 -right-3 text-3xl animate-pulse">🎧</div>
                        <div className="absolute -bottom-2 -left-3 text-3xl animate-bounce">📱</div>
                        <span className="bg-red-600 text-white font-mono font-black text-[10px] px-2 py-0.5 rounded uppercase mt-2 animate-pulse">
                          😵‍💫 HYPNOTIZED (MUTED)
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        {/* Restored State Mock (before final animation trigger) */}
                        <span className="text-6xl animate-bounce">🐰</span>
                        <div className="absolute -top-3 text-2xl animate-float">🎵</div>
                        <span className="bg-green-500 text-black font-mono font-black text-[10px] px-2 py-0.5 rounded uppercase mt-2">
                          🌟 FREEDOM NEAR!
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-full bg-slate-950 h-5 border-2 border-black rounded-lg overflow-hidden flex items-center justify-center relative">
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-red-500 transition-all duration-300" 
                      style={{ width: `${battleShieldHp}%` }}
                    ></div>
                    <span className="z-10 text-[10px] font-black text-white mix-blend-difference">
                      NOISE BARRIER: {battleShieldHp}%
                    </span>
                  </div>
                </div>

                {/* Silencer Enemy */}
                <div className="bg-slate-900/80 border-4 border-black p-4 rounded-xl flex flex-col items-center justify-between shadow-[3px_3px_0px_#000]">
                  <div className="text-center">
                    <p className="text-xs font-black text-red-400 uppercase tracking-wider">Invader Enemy</p>
                    <h4 className="font-extrabold text-base text-slate-200 mt-1">Noise Silencer Bot 🤖</h4>
                  </div>

                  <div className="my-4 animate-float">
                    {battleShieldHp > 0 ? (
                      <span className="text-6xl">🤖📡</span>
                    ) : (
                      <span className="text-6xl filter sepia opacity-40 grayscale rotate-45 transition-transform duration-500">💥</span>
                    )}
                  </div>

                  <div className="text-center">
                    {battleShieldHp > 0 ? (
                      <span className="bg-slate-800 text-red-400 font-mono text-[10px] px-2.5 py-1 border-2 border-red-900 rounded uppercase">
                        📢 Blasting Static Frequencies
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-green-400 font-mono text-[10px] px-2.5 py-1 border-2 border-green-900 rounded uppercase">
                        ☠️ System De-energized
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Minigame Mechanics Area */}
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

                    {/* Words choices select buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {battleRounds[battleStep].options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleBattleAnswer(opt)}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-2.5 rounded-lg neo-btn text-sm uppercase"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {/* Sword of Truth shortcut integration */}
                    {hasSwordOfTruth && (
                      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-center">
                        <button
                          onClick={handleUseSwordOfTruth}
                          className="bg-yellow-400 text-black font-black uppercase text-xs px-4 py-2 rounded-lg neo-btn flex items-center gap-1.5"
                        >
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
                    <button
                      onClick={handleTriggerPortal}
                      className="bg-green-500 hover:bg-green-400 text-white font-black uppercase text-lg px-8 py-4 rounded-2xl neo-btn animate-pulse"
                    >
                      {"✨ RESTORE SONGBEAST! ✨"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Screen Feedback & Navigation */}
            <div className="mt-6 pt-3 border-t-2 border-slate-700 flex justify-between items-center text-xs">
              <span className="text-pink-400 font-bold animate-pulse">{feedback}</span>
              <button 
                onClick={() => {
                  setCurrentScreen('OVERWORLD');
                  setFeedback('');
                }}
                className="text-slate-400 hover:text-white underline font-semibold"
              >
                Retreat to Overworld
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 5: DEBRIEF & BASECAMP TICKET */}
        {currentScreen === 'DEBRIEF' && (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b-2 border-slate-700 pb-3 mb-4">
                <span className="text-yellow-400 font-black tracking-widest uppercase text-xs">Phase 5: Debrief & Rescue</span>
                <span className="bg-yellow-950 text-yellow-400 px-2.5 py-1 text-xs font-bold rounded-lg border border-yellow-800">
                  Quest Success!
                </span>
              </div>

              {/* Restored Happy Songbeast Card */}
              <div className="bg-emerald-100 border-4 border-black p-6 rounded-2xl text-black shadow-[4px_4px_0px_#000] text-center max-w-xl mx-auto my-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-15"></div>
                
                {/* Floating music notes */}
                <div className="absolute top-4 left-6 text-2xl animate-float">🎵</div>
                <div className="absolute top-10 right-8 text-3xl animate-bounce">🎶</div>
                <div className="absolute bottom-6 left-12 text-xl animate-bounce">🌸</div>

                <div className="w-24 h-24 rounded-full bg-emerald-300 border-4 border-black flex items-center justify-center text-5xl mx-auto shadow-[3px_3px_0px_#000] animate-bounce mb-4">
                  🐰
                </div>

                <h3 className="font-black text-xl text-emerald-950">Barnaby the Bunny</h3>
                <p className="text-xs bg-emerald-200 border-2 border-emerald-400 text-emerald-900 font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                  🌸 status: reborn & singing 🌸
                </p>

                <p className="text-sm font-bold italic text-slate-800 mt-4 leading-relaxed bg-white p-4 border-2 border-black rounded-xl">
                  {"\"Oh, praise the Gardener! I can hear the lovely frequencies again!\""}
                </p>

                {/* Rewarding indicators */}
                {!isSongbeastRehomed ? (
                  <div className="mt-5 border-t border-emerald-300 pt-4 flex flex-col items-center">
                    <p className="text-xs font-bold text-slate-700 mb-3">
                      {"🎟️ Give Barnaby a Basecamp Ticket to escort them to safety & collect your reward items!"}
                    </p>
                    
                    <button
                      onClick={handleGiveTicket}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-sm px-6 py-3 rounded-xl neo-btn flex items-center gap-2"
                    >
                      🎟️ Give Basecamp Ticket (1 Needed)
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 border-t-2 border-dashed border-emerald-400 pt-4 text-center">
                    <p className="text-green-700 font-extrabold text-sm mb-2">🎉 Barnaby is rescued!</p>
                    <p className="text-xs font-bold text-slate-600">
                      He happily hops onto the Castle carrier and glides away to Basecamp, singing beautiful harmonies!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Feedback & Return actions */}
            <div className="mt-6 pt-4 border-t-2 border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between">
              <span className="text-pink-400 text-xs font-bold animate-pulse">{feedback}</span>
              
              <button
                onClick={() => {
                  setCurrentScreen('OVERWORLD');
                  setFeedback('');
                }}
                className="bg-green-500 text-white font-black uppercase text-sm px-6 py-3 rounded-xl neo-btn w-full md:w-auto"
              >
                🗺️ Return to Overworld Map
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 6: BASECAMP SHOP */}
        {currentScreen === 'SHOP' && (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b-2 border-slate-700 pb-3 mb-4">
                <span className="text-pink-400 font-black tracking-widest uppercase text-xs">Phase 2b: Basecamp & Shop</span>
                <button 
                  onClick={() => {
                    setCurrentScreen('OVERWORLD');
                    setFeedback('');
                  }} 
                  className="bg-slate-700 hover:bg-slate-650 text-white px-2.5 py-1 text-xs font-bold rounded border border-black neo-btn"
                >
                  🗺️ Return to Map
                </button>
              </div>

              {/* Cozy merchant banner */}
              <div className="flex items-center gap-4 bg-slate-900 p-4 border-4 border-black rounded-xl mb-6 shadow-[3px_3px_0px_#000]">
                <div className="w-12 h-12 rounded-full bg-pink-400 border-2 border-black flex items-center justify-center text-2xl shrink-0">
                  💂
                </div>
                <div>
                  <p className="text-pink-400 font-bold text-xs uppercase">Basecamp Armory & Supplies</p>
                  <p className="text-sm italic text-slate-200 mt-1">
                    {"\"Welcome, Messenger! Trade your earned sweets for survival items. Got some Cucumbers? I'll buy them too!\""}
                  </p>
                </div>
              </div>

              {/* Shop Inventory Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Item 1: Basecamp Ticket */}
                <div className="bg-slate-900 p-4 border-3 border-black rounded-xl flex items-center justify-between shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎟️</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-100">Basecamp Ticket</h4>
                      <p className="text-[10px] text-slate-400">Needed to rescue freed Songbeasts.</p>
                      <span className="text-xs font-black text-pink-400">Cost: 3 Cupcakes 🧁</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (cupcakes >= 3) {
                        setCupcakes(cupcakes - 3);
                        setTickets(tickets + 1);
                        addLog("Bought 1 Basecamp Ticket for 3 Cupcakes.", "shop");
                      } else {
                        triggerShake();
                        setFeedback("Insufficient Cupcakes! Go clear Faith Island or sell Cucumbers!");
                      }
                    }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs px-3 py-2 rounded border-2 border-black neo-btn"
                  >
                    Buy 🎟️
                  </button>
                </div>

                {/* Item 2: Sword of Truth */}
                <div className="bg-slate-900 p-4 border-3 border-black rounded-xl flex items-center justify-between shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚔️</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-100">Sword of Truth</h4>
                      <p className="text-[10px] text-slate-400">Shatters Silencer barriers instantly.</p>
                      <span className="text-xs font-black text-pink-400">
                        {hasSwordOfTruth ? "OWNED" : "Cost: 8 Cupcakes 🧁"}
                      </span>
                    </div>
                  </div>
                  <button
                    disabled={hasSwordOfTruth}
                    onClick={() => {
                      if (cupcakes >= 8) {
                        setCupcakes(cupcakes - 8);
                        setHasSwordOfTruth(true);
                        addLog("Obtained the Sword of Truth! Unleash its power in battle.", "shop");
                      } else {
                        triggerShake();
                        setFeedback("Insufficient Cupcakes for the Sword of Truth!");
                      }
                    }}
                    className={`font-black text-xs px-3 py-2 rounded border-2 border-black ${
                      hasSwordOfTruth 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed border-slate-800' 
                        : 'bg-yellow-400 hover:bg-yellow-300 text-black neo-btn'
                    }`}
                  >
                    Buy ⚔️
                  </button>
                </div>

                {/* Item 3: Holy Water Spray */}
                <div className="bg-slate-900 p-4 border-3 border-black rounded-xl flex items-center justify-between shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🧪</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-100">Holy Water Spray</h4>
                      <p className="text-[10px] text-slate-400">{"Breaches Love Island's Static Barrier."}</p>
                      <span className="text-xs font-black text-pink-400">
                        {hasHolyWater ? "OWNED" : "Cost: 5 Cupcakes 🧁"}
                      </span>
                    </div>
                  </div>
                  <button
                    disabled={hasHolyWater}
                    onClick={() => {
                      if (cupcakes >= 5) {
                        setCupcakes(cupcakes - 5);
                        setHasHolyWater(true);
                        addLog("Purchased Holy Water Spray! Love Island can now be penetrated.", "shop");
                      } else {
                        triggerShake();
                        setFeedback("Insufficient Cupcakes for Holy Water Spray!");
                      }
                    }}
                    className={`font-black text-xs px-3 py-2 rounded border-2 border-black ${
                      hasHolyWater 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed border-slate-800' 
                        : 'bg-yellow-400 hover:bg-yellow-300 text-black neo-btn'
                    }`}
                  >
                    Buy 🧪
                  </button>
                </div>

                {/* Trading / Selling station */}
                <div className="bg-slate-950 p-4 border-3 border-dashed border-pink-400 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-xs text-pink-400 uppercase tracking-wider">Trading Post</h4>
                    <p className="text-[10px] text-slate-300 mt-0.5">Sell 1 Cucumber 🥒 to earn 2 Cupcakes 🧁.</p>
                    <span className="text-[10px] font-bold text-slate-500">Inventory: {cucumbers} Cucumbers</span>
                  </div>
                  <button
                    onClick={() => {
                      if (cucumbers >= 1) {
                        setCucumbers(cucumbers - 1);
                        setCupcakes(cupcakes + 2);
                        addLog("Sold 1 Cucumber for +2 Cupcakes at the Trading Post.", "shop");
                      } else {
                        triggerShake();
                        setFeedback("No Cucumbers in stock to trade!");
                      }
                    }}
                    className="bg-green-500 hover:bg-green-400 text-white font-extrabold text-xs px-3 py-2 rounded border-2 border-black neo-btn"
                  >
                    Sell 🥒
                  </button>
                </div>

              </div>
            </div>

            {/* Feedback and back map */}
            <div className="mt-6 pt-3 border-t-2 border-slate-700 flex justify-between items-center text-xs">
              <span className="text-pink-400 font-bold animate-pulse">{feedback}</span>
              <button 
                onClick={() => {
                  setCurrentScreen('OVERWORLD');
                  setFeedback('');
                }}
                className="text-slate-400 hover:text-white underline font-semibold"
              >
                Back to Overworld Map
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Persistent Console/Game Logs Area */}
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

        <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
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
    </div>
  );
}
