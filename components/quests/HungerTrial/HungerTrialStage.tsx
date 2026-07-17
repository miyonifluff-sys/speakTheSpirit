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
  // 🚶‍♂️ 2D WALKING STATE (Bottom-left starting point based on image)
  const [playerPos, setPlayerPos] = useState({ x: 80, y: 550 });
  const playerSpeed = 10;

  // 📍 PLACEHOLDER WAYPOINTS - Swap these out using your debug tool!
  const hungerWaypoints = [
    { x: 65, y: 558 }, { x: 129, y: 561 }, { x: 192, y: 564 }, { x: 238, y: 530 }, { x: 196, y: 515 }, { x: 117, y: 498 }, { x: 175, y: 468 }, { x: 240, y: 474 }, { x: 309, y: 477 }, { x: 367, y: 486 }, { x: 431, y: 495 }, { x: 492, y: 501 }, { x: 552, y: 501 }, { x: 581, y: 466 }, { x: 632, y: 447 }, { x: 606, y: 496 }, { x: 561, y: 430 }, { x: 585, y: 399 }, { x: 531, y: 381 }, { x: 475, y: 370 }, { x: 412, y: 362 }, { x: 365, y: 362 }, { x: 303, y: 353 }, { x: 259, y: 340 }, { x: 232, y: 323 }, { x: 234, y: 281 }, { x: 282, y: 256 }, { x: 337, y: 258 }, { x: 381, y: 268 }, { x: 448, y: 273 }, { x: 505, y: 282 }, { x: 569, y: 260 }, { x: 542, y: 202 }, { x: 484, y: 186 }, { x: 432, y: 171 }, { x: 426, y: 174 }
  ];

  // 🎣 FISHING MINIGAME STATE
  const [fishingStatus, setFishingStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [fishingCursor, setFishingCursor] = useState(0);
  const directionRef = useRef(1); 

  // 📐 COLLISION MATH FOR 2D PATH
  const isPositionOnPath = (x: number, y: number): boolean => {
    const pathTolerance = 45; 
    for (const pt of hungerWaypoints) {
      const distance = Math.sqrt(Math.pow(x - pt.x, 2) + Math.pow(y - pt.y, 2));
      if (distance <= pathTolerance) return true;
    }
    return false;
  };

  const attemptPhysicalMove = (dx: number, dy: number) => {
    setPlayerPos((prev) => {
      const targetX = prev.x + dx;
      const targetY = prev.y + dy;

      if (targetX < 0 || targetX > 800 || targetY < 0 || targetY > 600) return prev;

      if (isPositionOnPath(targetX, targetY)) {
        return { x: targetX, y: targetY };
      }
      return prev;
    });
  };

  // 🚶‍♂️ KEYBOARD LISTENERS FOR 2D MOVEMENT
  useEffect(() => {
    if (stageState !== 'desert-walk') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling while playing
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

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

  // 🎯 TRIGGER OASIS WHEN PLAYER REACHES THE TOP/END OF PATH
  useEffect(() => {
    // If the player successfully navigates to the horizon (e.g., y < 100)
    if (stageState === 'desert-walk' && playerPos.y < 120) {
      onReachOasis();
    }
  }, [playerPos, stageState, onReachOasis]);

  // 🎣 FISHING MINIGAME LOOP
  useEffect(() => {
    if (stageState === 'action-scene' && selectedAction === 'fishing' && fishingStatus === 'playing') {
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
  }, [stageState, selectedAction, fishingStatus]);

  const attemptCatch = () => {
    if (fishingCursor >= 40 && fishingCursor <= 60) setFishingStatus('won');
    else setFishingStatus('lost');
  };

  return (
    <div className="flex-1 w-full relative overflow-hidden flex flex-col items-center justify-center bg-slate-800 rounded border-4 border-black shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)]">
      
      {/* 1. RIDDLE INTRO */}
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

      {/* 2. DESERT WALK (Now with 2D Map Logic) */}
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

            {/* 🏃‍♂️ CHARACTER */}
            <div 
              className="absolute w-24 h-24 -translate-x-1/2 -translate-y-[80%] transition-all duration-75 ease-out z-20"
              style={{ left: `${playerPos.x}px`, top: `${playerPos.y}px` }}
            >
              <img 
                src={characterPath} 
                alt="Character" 
                className="w-full h-full object-contain drop-shadow-[0_10px_8px_rgba(0,0,0,0.5)]" 
              />
            </div>

            {/* 🎮 D-PAD CONTROLS */}
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

      {/* 3. GARDEN CHOICE */}
      {stageState === 'garden-choice' && (
        <div className="w-full h-full flex flex-col items-center justify-end pb-10 bg-green-800 bg-[url('https://placehold.co/800x600/166534/fff?text=Lush+Garden')] bg-cover">
          <div className="flex gap-4 bg-white/90 p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_#000]">
            <button onClick={() => { onActionSelect('fishing'); setFishingStatus('playing'); }} className="flex flex-col items-center bg-blue-100 hover:bg-blue-200 border-2 border-black p-2 rounded shadow-[2px_2px_0px_#000] active:translate-y-1">
              <span className="text-3xl">🎣</span><span className="text-black font-black text-xs mt-1">Go Fishing</span>
            </button>
            <button onClick={() => onActionSelect('fruit')} className="flex flex-col items-center bg-red-100 hover:bg-red-200 border-2 border-black p-2 rounded shadow-[2px_2px_0px_#000] active:translate-y-1">
              <span className="text-3xl">🍎</span><span className="text-black font-black text-xs mt-1">Pick Fruit</span>
            </button>
            <button onClick={() => onActionSelect('water')} className="flex flex-col items-center bg-cyan-100 hover:bg-cyan-200 border-2 border-black p-2 rounded shadow-[2px_2px_0px_#000] active:translate-y-1">
              <span className="text-3xl">🏺</span><span className="text-black font-black text-xs mt-1">Drink Water</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. ACTION SCENE (MINIGAMES & SUCCESS) */}
      {stageState === 'action-scene' && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-cyan-900 p-6 relative">
          
          {/* FISHING MINIGAME UI */}
          {selectedAction === 'fishing' && (
            <div className="w-full max-w-md bg-slate-800 border-4 border-black p-6 rounded-xl shadow-[8px_8px_0px_#000] flex flex-col items-center">
              
              {fishingStatus === 'playing' && (
                <>
                  <h3 className="text-2xl font-black text-white mb-6 uppercase text-center">Cast your line!</h3>
                  <div className="w-full h-10 bg-slate-950 border-4 border-black relative mb-8 rounded shadow-[inset_2px_2px_0px_rgba(0,0,0,0.8)] overflow-hidden">
                    <div className="absolute top-0 bottom-0 left-[40%] w-[20%] bg-green-500 opacity-80 border-x-2 border-green-300" />
                    <div 
                      className="absolute top-0 bottom-0 w-3 bg-red-500 border-2 border-white drop-shadow-md z-10"
                      style={{ left: `calc(${fishingCursor}% - 6px)` }}
                    />
                  </div>
                  <button 
                    onClick={attemptCatch}
                    className="w-full bg-blue-500 text-white border-4 border-black p-4 font-black text-xl shadow-[4px_4px_0px_#000] hover:bg-blue-400 active:translate-y-1 rounded"
                  >
                    REEL IT IN!
                  </button>
                </>
              )}

              {fishingStatus === 'lost' && (
                <div className="text-center animate-fade-in">
                  <span className="text-5xl block mb-4">💦</span>
                  <h3 className="text-2xl font-black text-red-400 mb-4 uppercase">It got away!</h3>
                  <button 
                    onClick={() => setFishingStatus('playing')}
                    className="bg-amber-400 text-black border-4 border-black p-3 font-black text-lg shadow-[4px_4px_0px_#000] hover:bg-amber-300 active:translate-y-1 rounded"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {fishingStatus === 'won' && (
                <div className="text-center animate-bounce-short">
                  <span className="text-6xl block mb-4">🐟</span>
                  <h3 className="text-2xl font-black text-green-400 mb-6 uppercase">A Great Catch!</h3>
                  <button 
                    onClick={onTransitionToChallenge}
                    className="bg-yellow-400 text-black border-4 border-black p-4 font-black text-lg shadow-[4px_4px_0px_#000] hover:bg-yellow-300 active:translate-y-1 rounded"
                  >
                    Learn About Assurance ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* FALLBACK FOR FRUIT / WATER */}
          {selectedAction !== 'fishing' && (
             <div className="text-center">
                <div className="text-6xl mb-6 animate-bounce">
                  {selectedAction === 'fruit' ? '🧺' : '💧'}
                </div>
                <h2 className="text-2xl font-black text-white mb-8 text-center uppercase">
                  {selectedAction === 'fruit' ? 'Sweet Harvest!' : 'Thirst Quenched!'}
                </h2>
                <button 
                  onClick={onTransitionToChallenge}
                  className="bg-yellow-400 text-black border-4 border-black p-4 font-black text-lg shadow-[4px_4px_0px_#000] hover:bg-yellow-300 active:translate-y-1 rounded"
                >
                  Learn About Assurance ➔
                </button>
             </div>
          )}
        </div>
      )}

      {/* 6. SOLVED STAGE */}
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