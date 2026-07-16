import React, { useState, useEffect } from 'react';

interface CrossroadsMapProps {
  stageState: string;
  characterPath: string;
  onHitGhost: () => void;
  onHitXMarks: () => void;
  onReturnToFork: () => void;
  onClickChest: () => void;
}

export default function CrossroadsMap({
  stageState,
  characterPath,
  onHitGhost,
  onHitXMarks,
  onReturnToFork,
  onClickChest
}: CrossroadsMapProps) {
  const [playerPos, setPlayerPos] = useState({ x: 320, y: 550 });
  const playerSpeed = 10;

  const isPositionOnPath = (x: number, y: number): boolean => {
    const pathTolerance = 45; 
    const pathWaypoints = [
      { x: 368, y: 559 }, { x: 428, y: 562 }, { x: 431, y: 522 }, { x: 376, y: 506 }, { x: 365, y: 456 }, { x: 368, y: 405 }, { x: 364, y: 354 }, { x: 356, y: 298 }, { x: 317, y: 284 }, { x: 272, y: 270 }, { x: 229, y: 256 }, { x: 178, y: 242 }, { x: 154, y: 210 }, { x: 133, y: 168 }, { x: 119, y: 119 }, { x: 116, y: 65 }, { x: 124, y: 26 }, { x: 184, y: 34 }, { x: 188, y: 81 }, { x: 203, y: 128 }, { x: 216, y: 179 }, { x: 264, y: 203 }, { x: 318, y: 223 }, { x: 368, y: 238 }, { x: 437, y: 461 }, { x: 436, y: 414 }, { x: 436, y: 355 }, { x: 436, y: 305 }, { x: 433, y: 242 }, { x: 401, y: 279 }, { x: 491, y: 266 }, { x: 519, y: 224 }, { x: 580, y: 241 }, { x: 567, y: 194 }, { x: 624, y: 193 }, { x: 569, y: 139 }, { x: 637, y: 135 }, { x: 661, y: 83 }, { x: 704, y: 120 }, { x: 744, y: 59 }, { x: 698, y: 25 }, { x: 773, y: 18 }, { x: 548, y: 277 }, { x: 601, y: 94 }, { x: 471, y: 198 },
    ];
    for (const pt of pathWaypoints) {
      const distance = Math.sqrt(Math.pow(x - pt.x, 2) + Math.pow(y - pt.y, 2));
      if (distance <= pathTolerance) return true;
    }
    return false;
  };

  // 1. Math only! No side-effects here.
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

  // 2. NEW: Safely watch the player's position to trigger the scene change
  useEffect(() => {
    if (stageState === 'fork' && playerPos.y <= 60) {
      if (playerPos.x < 300) {
        onHitGhost();
      } else if (playerPos.x > 500) {
        onHitXMarks();
      }
    }
  }, [playerPos, stageState, onHitGhost, onHitXMarks]);

  // Keyboard Listeners
  useEffect(() => {
    if (stageState !== 'fork') return;

    const handleKeyDown = (e: any) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return; 

      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          e.preventDefault(); attemptPhysicalMove(0, -playerSpeed); break;
        case 'ArrowDown': case 's': case 'S':
          e.preventDefault(); attemptPhysicalMove(0, playerSpeed); break;
        case 'ArrowLeft': case 'a': case 'A':
          e.preventDefault(); attemptPhysicalMove(-playerSpeed, 0); break;
        case 'ArrowRight': case 'd': case 'D':
          e.preventDefault(); attemptPhysicalMove(playerSpeed, 0); break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stageState]);

  const handleReturnClick = () => {
    setPlayerPos({ x: 320, y: 350 });
    onReturnToFork();
  };

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-950 p-2">
      
      {stageState === 'fork' && (
        <div 
          className="relative border-4 border-black shadow-[4px_4px_0px_#000] bg-slate-800 overflow-hidden"
          style={{
            width: '800px', height: '600px',
            backgroundImage: "url('/crossroads_map.png')", // 3. FIXED IMAGE PATH!
            backgroundSize: '100% 100%', backgroundPosition: 'center'
          }}
        >
          {/* 🏃‍♂️ BIGGER CHARACTER */}
          <div 
            className="absolute w-24 h-24 -translate-x-1/2 -translate-y-[80%] transition-all duration-75 ease-out z-20"
            style={{ left: `${playerPos.x}px`, top: `${playerPos.y}px` }}
          >
            <img src={characterPath} alt="Character" className="w-full h-full object-contain drop-shadow-xl" />
          </div>

          {/* D-PAD CONTROLS */}
          <div className="absolute bottom-4 right-4 flex flex-col items-center gap-1 bg-slate-950 p-3 rounded-full border-4 border-black shadow-[0_4px_0_#000] z-30 opacity-80 hover:opacity-100 transition-opacity">
            <button onClick={() => attemptPhysicalMove(0, -playerSpeed)} className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1">↑</button>
            <div className="flex gap-1">
              <button onClick={() => attemptPhysicalMove(-playerSpeed, 0)} className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1">←</button>
              <button onClick={() => attemptPhysicalMove(0, playerSpeed)} className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1">↓</button>
              <button onClick={() => attemptPhysicalMove(playerSpeed, 0)} className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1">→</button>
            </div>
          </div>
        </div>
      )}

      {/* 👻 GHOST STAGE */}
      {stageState === 'ghosts' && (
        <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-center p-8">
          <div className="flex gap-8 mb-8 text-6xl animate-pulse">
            <span>👻</span><span className="mt-8">👻</span>
          </div>
          <div className="w-32 h-32 drop-shadow-md">
            <img src={characterPath} alt="Character" className="w-full h-full object-contain filter grayscale" />
          </div>
          <button 
            onClick={handleReturnClick}
            className="mt-8 bg-red-600 hover:bg-red-500 text-white font-black p-4 border-4 border-black shadow-[4px_4px_0px_#000] uppercase tracking-wide cursor-pointer"
          >
            WRONG WAY! GO BACK DOWN!
          </button>
        </div>
      )}

      {/* ❌ X-MARKS STAGE */}
      {stageState === 'x-marks' && (
        <div className="w-full h-full bg-amber-950/20 flex flex-col items-center justify-center">
          <button onClick={onClickChest} className="text-8xl hover:scale-110 transition-transform cursor-pointer drop-shadow-xl z-10">❌</button>
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="w-32 h-32 drop-shadow-md animate-pulse">
              <img src={characterPath} alt="Character" className="w-full h-full object-contain" />
            </div>
            <span className="text-4xl">⛏️</span>
          </div>
        </div>
      )}

      {/* 📦 CHEST STAGE */}
      {stageState === 'chest' && (
        <div className="w-full h-full bg-amber-950/20 flex flex-col items-center justify-center">
          <button onClick={onClickChest} className="text-9xl hover:scale-110 transition-transform cursor-pointer drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-wiggle">📦</button>
          <p className="mt-4 bg-slate-800 text-white border-2 border-black font-black px-4 py-2 uppercase shadow-[2px_2px_0px_#000]">Click to Open</p>
        </div>
      )}
    </div>
  );
}