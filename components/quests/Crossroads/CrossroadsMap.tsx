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
  // 🎮 Internal Map State
  const [playerPos, setPlayerPos] = useState({ x: 368, y: 550 });
  const playerSpeed = 10;

  // 🗺️ WAYPOINTS FOR BOTH MAPS
  const forkWaypoints = [
    // Your exact traced waypoints for the crossroads!
    { x: 368, y: 559 }, { x: 428, y: 562 }, { x: 431, y: 522 }, { x: 376, y: 506 }, { x: 365, y: 456 }, 
    { x: 368, y: 405 }, { x: 364, y: 354 }, { x: 356, y: 298 }, { x: 317, y: 284 }, { x: 272, y: 270 }, 
    { x: 229, y: 256 }, { x: 178, y: 242 }, { x: 154, y: 210 }, { x: 133, y: 168 }, { x: 119, y: 119 }, 
    { x: 116, y: 65 }, { x: 124, y: 26 }, { x: 184, y: 34 }, { x: 188, y: 81 }, { x: 203, y: 128 }, 
    { x: 216, y: 179 }, { x: 264, y: 203 }, { x: 318, y: 223 }, { x: 368, y: 238 }, { x: 437, y: 461 }, 
    { x: 436, y: 414 }, { x: 436, y: 355 }, { x: 436, y: 305 }, { x: 433, y: 242 }, { x: 401, y: 279 }, 
    { x: 491, y: 266 }, { x: 519, y: 224 }, { x: 580, y: 241 }, { x: 567, y: 194 }, { x: 624, y: 193 }, 
    { x: 569, y: 139 }, { x: 637, y: 135 }, { x: 661, y: 83 }, { x: 704, y: 120 }, { x: 744, y: 59 }, 
    { x: 698, y: 25 }, { x: 773, y: 18 }, { x: 548, y: 277 }, { x: 601, y: 94 }, { x: 471, y: 198 }
  ];

  const xMarksWaypoints = [
    // Placeholder dirt road for the second map (Replace these using the Debugger later!)
    { x: 19, y: 313 }, { x: 73, y: 302 }, { x: 134, y: 290 }, { x: 185, y: 300 }, { x: 239, y: 300 }, { x: 301, y: 317 }, { x: 347, y: 335 }, { x: 412, y: 338 }, { x: 472, y: 329 }, { x: 494, y: 367 }, { x: 418, y: 382 }, { x: 361, y: 382 }, { x: 310, y: 370 }, { x: 264, y: 354 }, { x: 208, y: 344 }, { x: 145, y: 344 }, { x: 92, y: 350 }, { x: 48, y: 361 }, { x: 8, y: 382 }, { x: 517, y: 302 }, { x: 544, y: 350 }, { x: 568, y: 286 }, { x: 602, y: 334 }
  ];

  // 🎯 Move player to left entrance when they load into the second map
  useEffect(() => {
    if (stageState === 'x-marks') {
      setPlayerPos({ x: 50, y: 360 }); 
    }
  }, [stageState]);

  // 📐 COLLISION MATH
  const isPositionOnPath = (x: number, y: number): boolean => {
    const pathTolerance = 45; 
    const currentWaypoints = stageState === 'fork' ? forkWaypoints : xMarksWaypoints;

    for (const pt of currentWaypoints) {
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

  // 🚨 EVENT TRIGGERS (Watched safely here)
  useEffect(() => {
    if (stageState === 'fork' && playerPos.y <= 60) {
      // Fork Exits (Your custom waypoints exit left around x:120, and right around x:700)
      if (playerPos.x < 300) {
        onHitGhost();
      } else if (playerPos.x > 500) {
        onHitXMarks();
      }
    } else if (stageState === 'x-marks') {
      // Music Note Trigger Check
      const musicNoteX = 560;
      const musicNoteY = 320;
      const distanceToNote = Math.sqrt(Math.pow(playerPos.x - musicNoteX, 2) + Math.pow(playerPos.y - musicNoteY, 2));
      
      // If player gets within 50px of the note, trigger the chest!
      if (distanceToNote <= 50) {
        onClickChest();
      }
    }
  }, [playerPos, stageState, onHitGhost, onHitXMarks, onClickChest]);

  // ⌨️ KEYBOARD LISTENERS
  useEffect(() => {
    // Active for BOTH playable maps
    if (stageState !== 'fork' && stageState !== 'x-marks') return;

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
    setPlayerPos({ x: 368, y: 400 }); // Safely place them back on the main trunk
    onReturnToFork();
  };

  // Determine which background to show dynamically
  const currentBackground = stageState === 'fork' ? "url('/crossroads_map.png')" : "url('/note_on_path.png')";

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-950 p-2">
      
      {/* 🟢 PLAYABLE MAP STAGES (Fork OR X-Marks) */}
      {(stageState === 'fork' || stageState === 'x-marks') && (
        <div 
          className="relative border-4 border-black shadow-[4px_4px_0px_#000] bg-slate-800 overflow-hidden transition-all"
          style={{
            width: '800px', height: '600px',
            backgroundImage: currentBackground,
            backgroundSize: '100% 100%', backgroundPosition: 'center'
          }}
        >
          {/* 🏃‍♂️ CHARACTER */}
          <div 
            className="absolute w-24 h-24 -translate-x-1/2 -translate-y-[80%] transition-all duration-75 ease-out z-20"
            style={{ left: `${playerPos.x}px`, top: `${playerPos.y}px` }}
          >
            <img src={characterPath} alt="Character" className="w-full h-full object-contain drop-shadow-xl" />
          </div>

          {/* 🎵 TARGET DEBUG RING FOR MUSIC NOTE (Remove later if you want) */}
          {stageState === 'x-marks' && (
             <div 
               className="absolute rounded-full bg-blue-500/40 border-4 border-blue-500 animate-pulse pointer-events-none z-10"
               style={{ width: '100px', height: '100px', left: `560px`, top: `320px`, transform: 'translate(-50%, -50%)' }}
             />
          )}

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