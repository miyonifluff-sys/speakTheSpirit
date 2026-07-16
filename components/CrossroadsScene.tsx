'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { addLog } from '../utils/gameEvents';
import { askAngelGabriel } from '../app/actions/gloo';

interface ChatMessage {
  sender: 'you' | 'angel';
  text: string;
}

export default function CrossroadsScene({ onComplete }: { onComplete?: () => void }) {
  const { setCurrentScreen, setQuestObjectClicked } = useGame();

  // 'fork' | 'ghosts' | 'x-marks' | 'chest' | 'lock-challenge' | 'solved'
  const [stageState, setStageState] = useState('fork');
  
  // Right Console States
  const [angelChat, setAngelChat] = useState("Traveler, choose your path using the D-Pad or your Keyboard Arrow Keys. The paved road looks easy, but what does the riddle say?");
  const [askInput, setAskInput] = useState("");
  
  // Structured Chat log to separate styling
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  // Challenge Specific State
  const [challengeFeedback, setChallengeFeedback] = useState("");

  // Character Sprite Selection (Hardcoded 'girl' for demo)
  const [selectedGender] = useState<'girl' | 'boy'>('girl');
  const characterPath = selectedGender === 'girl' 
    ? "/characters/girlnobackground.png" 
    : "/characters/boynobackground.png";

  const handleMove = (direction: string) => {
    if (stageState === 'fork') {
      if (direction === 'LEFT' || direction === 'UP') {
        setStageState('ghosts');
        setAngelChat("Oh no! The ghosts of doubt and distraction! This isn't the right way. Use the D-Pad or Down arrow to go back.");
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

  // Keyboard Navigation Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable moving when typing inside inputs
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return; 
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleMove('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleMove('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleMove('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleMove('RIGHT');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [stageState]);

  const handleAskGloo = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentQuestion = askInput.trim();
    if (!currentQuestion) return;

    // Reset input text immediately
    setAskInput("");
    
    // 1. Add user's message to chat (appears on right side in blue)
    setChatLog(prev => [...prev, { sender: 'you', text: currentQuestion }]);
    
    // 2. Fire typing/thinking state
    setIsThinking(true);

    try {
      // Call the Server Action securely
      const res = await askAngelGabriel("user_123", currentQuestion, stageState);
      
      setIsThinking(false);

      if (res.error) {
        setChatLog(prev => [...prev, { sender: 'angel', text: res.error || "Static is too loud right now!" }]);
      } else if (res.reply) {
        // 3. Add Angel's answer (appears on left side in white)
        setChatLog(prev => [...prev, { sender: 'angel', text: res.reply }]);
      }
    } catch (err) {
      setIsThinking(false);
      setChatLog(prev => [...prev, { sender: 'angel', text: "The static is too loud right now! Can you try asking me that one more time?" }]);
    }
  };

  return (
    <div className="w-full h-full flex bg-slate-950 border-4 border-black overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-xl relative">
      
      {/* 🔴 LEFT SIDE: INTERACTIVE STAGE (60%) */}
      <div className="w-[60%] h-full bg-slate-900 relative flex flex-col items-center border-r-4 border-black text-white p-4">
        
        {/* TOP STATUS ROW */}
        <div className="w-full flex justify-between items-center bg-slate-800 border-2 border-black p-2 rounded shadow-[2px_2px_0px_#000] shrink-0 mb-4 z-20">
          <div>
            <h3 className="text-[10px] font-black uppercase text-amber-400">Weapon Tracker</h3>
            <p className="text-xs font-bold text-slate-200">
              {stageState === 'solved' ? "Now faith is..." : "[ _ _ _ _ _ ]"}
            </p>
          </div>
          {stageState === 'lock-challenge' && (
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 border border-black rounded">
              <span className="text-xl">🔒</span>
              <span className="text-[10px] font-black uppercase text-amber-400">Lock Puzzle Active</span>
            </div>
          )}
        </div>

        {/* SCENE RENDERING AREA */}
        <div className="flex-1 w-full relative overflow-hidden flex items-center justify-center">
          
          {stageState === 'fork' && (
            <div className="relative w-full h-full flex">
              <div className="w-1/2 h-full bg-slate-800 border-r-4 border-black border-dashed flex items-center justify-center">
                <span className="text-slate-500 font-black uppercase rotate-[-45deg] tracking-wider">Paved Path</span>
              </div>
              <div className="w-1/2 h-full bg-amber-900/40 flex items-center justify-center">
                <span className="text-amber-600/80 font-black uppercase rotate-[45deg] tracking-wider">Dirt Path</span>
              </div>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 w-24 h-24 drop-shadow-md animate-bounce">
                <img 
                  src={characterPath} 
                  alt="Player Character" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {stageState === 'ghosts' && (
            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-center p-8">
              <div className="flex gap-8 mb-8 text-6xl animate-pulse">
                <span>👻</span>
                <span className="mt-8">👻</span>
              </div>
              <div className="w-24 h-24 drop-shadow-md">
                <img 
                  src={characterPath} 
                  alt="Player Character" 
                  className="w-full h-full object-contain filter grayscale"
                />
              </div>
              <p className="mt-8 bg-red-600 text-white font-black p-4 border-4 border-black shadow-[4px_4px_0px_#000] uppercase tracking-wide">
                WRONG WAY! GO BACK DOWN!
              </p>
            </div>
          )}

          {stageState === 'x-marks' && (
            <div className="w-full h-full bg-amber-950/20 flex flex-col items-center justify-center">
              <button 
                onClick={() => {
                  setStageState('chest');
                  setAngelChat("You dug it up! It's a locked chest. Click on the chest to inspect the lock!");
                }}
                className="text-8xl hover:scale-110 transition-transform cursor-pointer drop-shadow-xl z-10"
              >
                ❌
              </button>
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="w-24 h-24 drop-shadow-md animate-pulse">
                  <img 
                    src={characterPath} 
                    alt="Player Character" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-4xl">⛏️</span>
              </div>
            </div>
          )}

          {stageState === 'chest' && (
            <div className="w-full h-full bg-amber-950/20 flex flex-col items-center justify-center">
              <button 
                onClick={() => {
                  setStageState('lock-challenge');
                  setAngelChat("To open this chest, you must break the lock! Answer the question on the left. If you need help, ask me a question in our chat!");
                }}
                className="text-9xl hover:scale-110 transition-transform cursor-pointer drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-wiggle"
              >
                📦
              </button>
              <p className="mt-4 bg-slate-800 text-white border-2 border-black font-black px-4 py-2 uppercase shadow-[2px_2px_0px_#000]">
                Click to Open
              </p>
            </div>
          )}

          {/* INLINE LEFT-SIDE LOCK CHALLENGE */}
          {stageState === 'lock-challenge' && (
            <div className="w-full h-full flex flex-col justify-between animate-fade-in bg-slate-900 overflow-y-auto">
              <div className="border-b-2 border-slate-700 pb-2 mb-4 shrink-0">
                <h2 className="text-lg font-black uppercase text-amber-400 flex items-center gap-2">
                  <span>🔒</span> Break the Lock!
                </h2>
                <p className="text-xs text-slate-400">Answer correctly to unlock the first Truth Scroll.</p>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-4">
                <p className="font-bold text-base text-slate-100 leading-relaxed">
                  What is the true meaning of the ancient Greek word <span className="bg-yellow-400 text-black px-1.5 py-0.5 rounded font-black font-mono">Pistis</span> (Faith)?
                </p>

                {challengeFeedback && (
                  <div className="bg-red-950/80 border-2 border-red-500 text-red-200 font-bold p-2 text-xs rounded">
                    ⚠️ {challengeFeedback}
                  </div>
                )}

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setChallengeFeedback("Not quite! Just knowing facts doesn't make you step onto the dirt path. Check my advice in the Angel Chat on the right!");
                      setAngelChat("Think about it, Messenger! Knowing trivia is helpful, but true Pistis requires you to take a step of action. Read the trampoline example in our chat history!");
                    }}
                    className="w-full text-left bg-slate-800 hover:bg-slate-700 text-white border-2 border-black p-3.5 font-bold text-xs shadow-[2px_2px_0px_#000] transition-colors rounded"
                  >
                    A) Knowing lots of facts and trivia about the Gardener.
                  </button>
                  <button 
                    onClick={() => {
                      setStageState('solved');
                      setAngelChat("YAY YAY YAY! You unlocked the truth! Click the green button on the right to continue your journey.");
                    }}
                    className="w-full text-left bg-slate-800 hover:bg-slate-700 text-white border-2 border-black p-3.5 font-bold text-xs shadow-[2px_2px_0px_#000] transition-colors rounded"
                  >
                    B) Active loyalty and deep trust that makes you willing to do what He says.
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 text-center uppercase tracking-widest border-t border-slate-800 pt-2 mt-4 shrink-0">
                Need a hint? Ask Angel Gabriel on the right ➔
              </div>
            </div>
          )}

          {stageState === 'solved' && (
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px]">
              <div className="bg-yellow-100 border-4 border-black p-8 shadow-[8px_8px_0px_#000] max-w-sm text-center animate-fade-in text-black">
                <h2 className="text-2xl font-black mb-2 uppercase tracking-wide text-amber-900">📜 SCROLL UNLOCKED</h2>
                <p className="text-xl font-bold italic text-slate-800">
                  "Now faith is..."
                </p>
              </div>
              <div className="w-28 h-28 mt-8 drop-shadow-xl animate-bounce">
                <img 
                  src={characterPath} 
                  alt="Player Character" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* D-PAD CONTROLS */}
        {(stageState === 'fork' || stageState === 'ghosts') && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 bg-slate-950 p-3 rounded-full border-4 border-black shadow-[0_4px_0_#000] z-20">
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
        <div className="p-4 border-b-4 border-black bg-white text-black">
          <h2 className="font-black text-sm uppercase mb-2">📜 Riddle</h2>
          <p className="text-xs font-bold italic text-slate-700">
            "Where cobblestones end and hidden trails start,<br/>
            Choose the path less traveled with all of your heart."
          </p>
        </div>

        {/* Chat with Angel */}
        <div className="flex-1 p-4 border-b-4 border-black overflow-y-auto bg-slate-100 flex flex-col gap-4">
          <h2 className="font-black text-sm uppercase bg-yellow-300 text-black inline-block px-2 border-2 border-black self-start">
            Chat with Angel 👼
          </h2>
          
          {/* Main Angel Clue Bubble (Always White on Left) */}
          <div className="bg-white text-black border-2 border-black p-3 rounded-r-xl rounded-bl-xl shadow-[2px_2px_0px_#000] text-sm font-bold self-start mr-8">
            {angelChat}
          </div>

          {/* Chat Feed rendering */}
          {chatLog.map((msg, i) => (
            <div 
              key={i} 
              className={`border-2 border-black p-3 text-sm font-bold shadow-[2px_2px_0px_#000] max-w-[85%] ${
                msg.sender === 'you' 
                  ? 'bg-cyan-100 text-black rounded-l-xl rounded-br-xl self-end ml-8 text-right' // 🔵 Player bubble (Blue, Right)
                  : 'bg-white text-black rounded-r-xl rounded-bl-xl self-start mr-8 text-left' // ⚪ Angel bubble (White, Left)
              }`}
            >
              <span className="text-[10px] block text-slate-500 uppercase mb-1">
                {msg.sender === 'you' ? 'You' : 'Angel Gabriel 👼'}
              </span>
              {msg.text}
            </div>
          ))}

          {/* ⏳ ANGEL IS THINKING/TYPING ANIMATION */}
          {isThinking && (
            <div className="bg-white text-black border-2 border-black p-3 rounded-r-xl rounded-bl-xl shadow-[2px_2px_0px_#000] text-sm font-bold self-start max-w-[80%] flex items-center gap-2 mr-8">
              <span className="text-[10px] block text-slate-500 uppercase">Angel Gabriel 👼</span>
              <span className="flex gap-1 items-center py-1">
                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce"></span>
                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          )}
        </div>

        {/* Ask Question Input */}
        <div className="p-4 bg-slate-300">
          <form onSubmit={handleAskGloo} className="flex gap-2">
            <input 
              type="text" 
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              disabled={isThinking} // Disable input while AI is processing
              placeholder={isThinking ? "Angel is formulating an answer..." : "Ask a question..."}
              className="flex-1 bg-white text-black placeholder-slate-500 border-2 border-black p-2 text-sm font-bold disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
            <button 
              type="submit" 
              disabled={isThinking}
              className="bg-blue-500 text-white font-black px-4 py-2 border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-blue-400 active:translate-y-1 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              ASK
            </button>
          </form>
        </div>

        {/* Next Scene Button */}
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

    </div>
  );
}