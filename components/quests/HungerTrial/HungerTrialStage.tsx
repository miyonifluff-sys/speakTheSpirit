import React, { useState, useEffect, useRef } from 'react';

interface HungerTrialStageProps {
  stageState: string;
  characterPath: string;
  onStartWalk: () => void;
  onReachOasis: () => void;
  onActionSelect: (action: 'fishing' | 'fruit' | 'water') => void;
  onTransitionToChallenge: () => void;
  selectedAction: 'fishing' | 'fruit' | 'water' | null;
}

export default function HungerTrialStage({
  stageState,
  characterPath,
  onStartWalk,
  onReachOasis,
  onActionSelect,
  onTransitionToChallenge,
  selectedAction
}: HungerTrialStageProps) {
  // 🚶‍♂️ 2D WALKING STATE 
  const [playerPos, setPlayerPos] = useState({ x: 80, y: 550 });
  const playerSpeed = 10;

  const hungerWaypoints = [
    { x: 79, y: 564 }, { x: 156, y: 569 }, { x: 212, y: 522 }, { x: 212, y: 522 }, { x: 152, y: 504 }, { x: 266, y: 470 }, { x: 207, y: 480 }, { x: 199, y: 568 }, { x: 339, y: 491 }, { x: 417, y: 499 }, { x: 478, y: 498 }, { x: 544, y: 497 }, { x: 599, y: 456 }, { x: 574, y: 414 }, { x: 516, y: 371 }, { x: 456, y: 373 }, { x: 372, y: 354 }, { x: 299, y: 346 }, { x: 252, y: 333 }, { x: 233, y: 279 }, { x: 303, y: 275 }, { x: 353, y: 269 }, { x: 431, y: 290 }, { x: 497, y: 296 }, { x: 560, y: 285 }, { x: 569, y: 215 }, { x: 505, y: 200 }, { x: 428, y: 204 }, { x: 366, y: 199 }, { x: 308, y: 186 }, { x: 296, y: 166 }, { x: 360, y: 154 }, { x: 407, y: 142 }, { x: 359, y: 116 }, { x: 395, y: 72 }, { x: 115, y: 520 }
  ];

  // 🎮 UNIVERSAL MINIGAME STATE
  const [minigameStatus, setMinigameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  // 🎣 FISHING STATE
  const [fishingCursor, setFishingCursor] = useState(0);
  const directionRef = useRef(1); 

  // 🍎 FRUIT STATE
  const [applesCaught, setApplesCaught] = useState(0);
  const [applePos, setApplePos] = useState<{ top: number; left: number } | null>(null);

  // 🏺 WATER STATE
  const [waterLevel, setWaterLevel] = useState(0);

  // --------------------------------------------------------
  // 1. DESERT WALK LOGIC
  // --------------------------------------------------------
  const isPositionOnPath = (x: number, y: number): boolean => {
    const pathTolerance = 45; 
    for (const pt of hungerWaypoints) {
      if (Math.sqrt(Math.pow(x - pt.x, 2) + Math.pow(y - pt.y, 2)) <= pathTolerance) return true;
    }
    return false;
  };

  const attemptPhysicalMove = (dx: number, dy: number) => {
    setPlayerPos((prev) => {
      const targetX = prev.x + dx;
      const targetY = prev.y + dy;
      if (targetX < 0 || targetX > 800 || targetY < 0 || targetY > 600) return prev;
      if (isPositionOnPath(targetX, targetY)) return { x: targetX, y: targetY };
      return prev;
    });
  };

  useEffect(() => {
    if (stageState !== 'desert-walk') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': attemptPhysicalMove(0, -playerSpeed); break;
        case 'ArrowDown': case 's': case 'S': attemptPhysicalMove(0, playerSpeed); break;
        case 'ArrowLeft': case 'a': case 'A': attemptPhysicalMove(-playerSpeed, 0); break;
        case 'ArrowRight': case 'd': case 'D': attemptPhysicalMove(playerSpeed, 0); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stageState]);

  useEffect(() => {
    if (stageState === 'desert-walk' && playerPos.y < 120) onReachOasis();
  }, [playerPos, stageState, onReachOasis]);


  // --------------------------------------------------------
  // 2. FISHING LOGIC
  // --------------------------------------------------------
  useEffect(() => {
    if (stageState === 'action-scene' && selectedAction === 'fishing' && minigameStatus === 'playing') {
      const gameLoop = setInterval(() => {
        setFishingCursor((prev) => {
          let next = prev + (directionRef.current * 3); 
          if (next >= 100) { next = 100; directionRef.current = -1; }
          if (next <= 0) { next = 0; directionRef.current = 1; }
          return next;
        });
      }, 30);
      return () => clearInterval(gameLoop);
    }
  }, [stageState, selectedAction, minigameStatus]);

  const attemptCatch = () => {
    if (fishingCursor >= 40 && fishingCursor <= 60) setMinigameStatus('won');
    else setMinigameStatus('lost');
  };


  // --------------------------------------------------------
  // 3. FRUIT LOGIC
  // --------------------------------------------------------
  useEffect(() => {
    if (stageState === 'action-scene' && selectedAction === 'fruit' && minigameStatus === 'playing') {
      const appleTimer = setInterval(() => {
        // Randomize apple position inside the tree box
        const randomTop = Math.floor(Math.random() * 70) + 10; // 10% to 80%
        const randomLeft = Math.floor(Math.random() * 80) + 10; // 10% to 90%
        setApplePos({ top: randomTop, left: randomLeft });
      }, 1000); // New apple every 1 second
      return () => clearInterval(appleTimer);
    }
  }, [stageState, selectedAction, minigameStatus]);

  const handleAppleClick = () => {
    setApplePos(null); // Hide it instantly
    const nextCount = applesCaught + 1;
    setApplesCaught(nextCount);
    if (nextCount >= 5) setMinigameStatus('won');
  };


  // --------------------------------------------------------
  // 4. WATER LOGIC
  // --------------------------------------------------------
  useEffect(() => {
    if (stageState === 'action-scene' && selectedAction === 'water' && minigameStatus === 'playing') {
      // Drain the water constantly
      const drainTimer = setInterval(() => {
        setWaterLevel((prev) => Math.max(0, prev - 3)); // Drains 3% every 200ms
      }, 200);
      return () => clearInterval(drainTimer);
    }
  }, [stageState, selectedAction, minigameStatus]);

  const handlePumpWater = () => {
    if (minigameStatus !== 'playing') return;
    const nextLevel = waterLevel + 12; // Mashing adds 12%
    if (nextLevel >= 100) {
      setWaterLevel(100);
      setMinigameStatus('won');
    } else {
      setWaterLevel(nextLevel);
    }
  };

  // Allow spacebar mashing for water game
  useEffect(() => {
    if (stageState === 'action-scene' && selectedAction === 'water' && minigameStatus === 'playing') {
      const handleSpace = (e: KeyboardEvent) => {
        if (e.key === ' ') {
          e.preventDefault();
          handlePumpWater();
        }
      };
      window.addEventListener('keydown', handleSpace);
      return () => window.removeEventListener('keydown', handleSpace);
    }
  }, [stageState, selectedAction, minigameStatus, waterLevel]);


  // --------------------------------------------------------
  // RENDER UI
  // --------------------------------------------------------
  return (
    <div className="flex-1 w-full relative overflow-hidden flex flex-col items-center justify-center bg-slate-800 rounded border-4 border-black shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)]">
      
      {/* RIDDLE INTRO */}
      {stageState === 'riddle-intro' && (
         <div className="m-auto w-full max-w-md bg-amber-50 text-black border-4 border-black p-6 rounded-xl shadow-[6px_6px_0px_#000] text-center relative">
           <h2 className="text-xl font-black uppercase text-amber-900 mt-4 mb-3">The Hunger Trial</h2>
           <div className="bg-white border-2 border-black p-4 rounded-lg italic font-bold text-sm text-slate-800 leading-relaxed mb-6">
             "When the belly rumbles and the throat is dry,<br />
             Look not to the ground, but trust the sky."
           </div>
           <button 
             onClick={onStartWalk}
             className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-3 px-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_#000] active:translate-y-1 uppercase"
           >
             Enter the Wasteland ➔
           </button>
         </div>
      )}

      {/* DESERT WALK */}
      {stageState === 'desert-walk' && (
        <div className="w-full h-full flex items-center justify-center bg-slate-950 p-2">
          <div 
            className="relative border-4 border-black shadow-[4px_4px_0px_#000] bg-slate-800 overflow-hidden"
            style={{
              width: '800px', height: '600px',
              backgroundImage: "url('/hunger_path.png')",
              backgroundSize: '100% 100%', backgroundPosition: 'center'
            }}
          >
            <div className="absolute top-4 left-4 text-xs font-black text-amber-100 bg-black/70 p-2 rounded border-2 border-amber-500 z-50 shadow-[2px_2px_0px_#000]">
              Follow the winding path to the horizon ➔
            </div>
            <div 
              className="absolute w-24 h-24 -translate-x-1/2 -translate-y-[80%] transition-all duration-75 ease-out z-20"
              style={{ left: `${playerPos.x}px`, top: `${playerPos.y}px` }}
            >
              <img src={characterPath} alt="Character" className="w-full h-full object-contain drop-shadow-[0_10px_8px_rgba(0,0,0,0.5)]" />
            </div>
            <div className="absolute bottom-4 right-4 flex flex-col items-center gap-1 bg-slate-950 p-3 rounded-full border-4 border-black shadow-[0_4px_0_#000] z-30 opacity-80 hover:opacity-100 transition-opacity">
              <button onClick={() => attemptPhysicalMove(0, -playerSpeed)} className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1">↑</button>
              <div className="flex gap-1">
                <button onClick={() => attemptPhysicalMove(-playerSpeed, 0)} className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1">←</button>
                <button onClick={() => attemptPhysicalMove(0, playerSpeed)} className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1">↓</button>
                <button onClick={() => attemptPhysicalMove(playerSpeed, 0)} className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1">→</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GARDEN CHOICE */}
      {stageState === 'garden-choice' && (
        <div className="w-full h-full flex flex-col items-center justify-end pb-10 bg-green-800 bg-[url('https://placehold.co/800x600/166534/fff?text=Lush+Garden')] bg-cover">
          <div className="flex gap-4 bg-white/90 p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_#000]">
            <button onClick={() => { onActionSelect('fishing'); setMinigameStatus('playing'); }} className="flex flex-col items-center bg-blue-100 hover:bg-blue-200 border-2 border-black p-2 rounded shadow-[2px_2px_0px_#000] active:translate-y-1">
              <span className="text-3xl">🎣</span><span className="text-black font-black text-xs mt-1">Go Fishing</span>
            </button>
            <button onClick={() => { onActionSelect('fruit'); setApplesCaught(0); setMinigameStatus('playing'); }} className="flex flex-col items-center bg-red-100 hover:bg-red-200 border-2 border-black p-2 rounded shadow-[2px_2px_0px_#000] active:translate-y-1">
              <span className="text-3xl">🍎</span><span className="text-black font-black text-xs mt-1">Pick Fruit</span>
            </button>
            <button onClick={() => { onActionSelect('water'); setWaterLevel(0); setMinigameStatus('playing'); }} className="flex flex-col items-center bg-cyan-100 hover:bg-cyan-200 border-2 border-black p-2 rounded shadow-[2px_2px_0px_#000] active:translate-y-1">
              <span className="text-3xl">🏺</span><span className="text-black font-black text-xs mt-1">Drink Water</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTION SCENE (MINIGAMES & SUCCESS) */}
      {stageState === 'action-scene' && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 p-6 relative">
          
          <div className="w-full max-w-md bg-slate-800 border-4 border-black p-6 rounded-xl shadow-[8px_8px_0px_#000] flex flex-col items-center relative">
            
            {/* 🎣 FISHING UI */}
            {selectedAction === 'fishing' && minigameStatus === 'playing' && (
              <>
                <h3 className="text-2xl font-black text-white mb-6 uppercase text-center">Cast your line!</h3>
                <div className="w-full h-10 bg-slate-950 border-4 border-black relative mb-8 rounded shadow-[inset_2px_2px_0px_rgba(0,0,0,0.8)] overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-[40%] w-[20%] bg-green-500 opacity-80 border-x-2 border-green-300" />
                  <div className="absolute top-0 bottom-0 w-3 bg-red-500 border-2 border-white drop-shadow-md z-10" style={{ left: `calc(${fishingCursor}% - 6px)` }} />
                </div>
                <button onClick={attemptCatch} className="w-full bg-blue-500 text-white border-4 border-black p-4 font-black text-xl shadow-[4px_4px_0px_#000] hover:bg-blue-400 active:translate-y-1 rounded">
                  REEL IT IN!
                </button>
              </>
            )}

            {/* 🍎 FRUIT UI */}
            {selectedAction === 'fruit' && minigameStatus === 'playing' && (
              <>
                <div className="w-full flex justify-between items-center mb-4">
                  <h3 className="text-xl font-black text-white uppercase">Harvest Time!</h3>
                  <div className="bg-white text-black font-black px-3 py-1 border-2 border-black rounded shadow-[2px_2px_0px_#000]">
                    Apples: {applesCaught}/5
                  </div>
                </div>
                {/* Pixel Art Tree Representation */}
                <div className="w-full h-64 bg-green-700 rounded-t-full border-4 border-black relative shadow-[inset_0_-20px_0_rgba(0,0,0,0.2)] mb-4 cursor-crosshair">
                  {applePos && (
                    <button 
                      onClick={handleAppleClick}
                      className="absolute text-4xl hover:scale-110 active:scale-95 transition-transform"
                      style={{ top: `${applePos.top}%`, left: `${applePos.left}%` }}
                    >
                      🍎
                    </button>
                  )}
                </div>
                <p className="text-slate-300 font-bold text-sm">Click the apples before they disappear!</p>
              </>
            )}

            {/* 🏺 WATER UI */}
            {selectedAction === 'water' && minigameStatus === 'playing' && (
              <>
                <h3 className="text-2xl font-black text-white mb-4 uppercase text-center">Pump the Well!</h3>
                {/* Water Meter */}
                <div className="w-16 h-64 bg-slate-950 border-4 border-black rounded-b-xl relative mb-6 overflow-hidden shadow-[inset_2px_2px_0px_rgba(0,0,0,0.8)]">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-blue-500 border-t-4 border-cyan-300 transition-all duration-75" 
                    style={{ height: `${waterLevel}%` }}
                  />
                </div>
                <button 
                  onClick={handlePumpWater}
                  className="w-full bg-cyan-500 text-white border-4 border-black p-4 font-black text-xl shadow-[4px_4px_0px_#000] hover:bg-cyan-400 active:translate-y-1 rounded uppercase"
                >
                  Mash Spacebar!
                </button>
              </>
            )}

            {/* ❌ UNIVERSAL LOST STATE */}
            {minigameStatus === 'lost' && (
              <div className="text-center animate-fade-in py-8">
                <span className="text-5xl block mb-4">💦</span>
                <h3 className="text-2xl font-black text-red-400 mb-4 uppercase">You missed it!</h3>
                <button 
                  onClick={() => setMinigameStatus('playing')}
                  className="bg-amber-400 text-black border-4 border-black p-3 font-black text-lg shadow-[4px_4px_0px_#000] hover:bg-amber-300 active:translate-y-1 rounded"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* ✅ UNIVERSAL WON STATE */}
            {minigameStatus === 'won' && (
              <div className="text-center animate-bounce-short py-8">
                <span className="text-6xl block mb-4">
                  {selectedAction === 'fishing' ? '🐟' : selectedAction === 'fruit' ? '🧺' : '💧'}
                </span>
                <h3 className="text-2xl font-black text-green-400 mb-6 uppercase">
                  {selectedAction === 'fishing' ? 'A Great Catch!' : selectedAction === 'fruit' ? 'Sweet Harvest!' : 'Thirst Quenched!'}
                </h3>
                <button 
                  onClick={onTransitionToChallenge}
                  className="bg-yellow-400 text-black border-4 border-black p-4 font-black text-lg shadow-[4px_4px_0px_#000] hover:bg-yellow-300 active:translate-y-1 rounded"
                >
                  Learn About Assurance ➔
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SOLVED STAGE */}
      {stageState === 'solved' && (
        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-amber-100 border-4 border-black p-6 shadow-[8px_8px_0px_#000] max-w-sm text-black">
            <h2 className="text-xl font-black mb-4 uppercase text-amber-900 border-b-4 border-black pb-2">Hypostasis (Assurance)</h2>
            <p className="text-sm font-bold text-slate-800 text-left mb-4">
              In ancient business, a <i>hypostasis</i> was a title deed—a physical piece of paper that proved you owned a piece of land, even if you hadn't walked on it yet.
            </p>
            <p className="text-lg font-black text-slate-900 bg-white p-2 border-2 border-black shadow-[2px_2px_0px_#000]">
              "Now faith is the assurance of things hoped for."
            </p>
          </div>
        </div>
      )}
    </div>
  );
}