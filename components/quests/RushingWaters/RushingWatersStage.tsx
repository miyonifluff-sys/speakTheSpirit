import React, { useState, useEffect } from 'react';
// 1. NEW: Import the GameContext hook
import { useGame } from '../../../context/GameContext';

interface RushingWatersStageProps {
  stageState: string;
  characterPath: string;
  onStartCrossing: () => void;
  onCrossedRiver: () => void;
  onFoundClef: () => void;
  onOpenChest: () => void;
}

export default function RushingWatersStage({
  stageState,
  characterPath,
  onStartCrossing,
  onCrossedRiver,
  onFoundClef,
  onOpenChest
}: RushingWatersStageProps) {
  
  // 2. NEW: Grab verseChunks from the context
  const { verseChunks } = useGame();

  // 🚶‍♂️ 2D WALKING STATE
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 300 });
  const [bridgeRevealed, setBridgeRevealed] = useState(false);
  const [sinkMessage, setSinkMessage] = useState("");
  const playerSpeed = 15;

  // 🌍 SPAWN POINTS
  useEffect(() => {
    if (stageState === 'find-clef') {
      // Spawn at the left side of the path for the treble clef map
      setPlayerPos({ x: 50, y: 360 }); 
    }
  }, [stageState]);

  const attemptMove = (dx: number, dy: number) => {
    setPlayerPos((prev) => {
      let targetX = prev.x + dx;
      let targetY = prev.y + dy;
      
      // Screen Boundaries
      if (targetX < 0) targetX = 0;
      if (targetX > 750) targetX = 750;
      if (targetY < 0) targetY = 0;
      if (targetY > 550) targetY = 550;

      // 🌊 River Bridge Logic
      if (stageState === 'river-crossing') {
        if (targetX > 200 && targetX < 600) {
          if (!bridgeRevealed) setBridgeRevealed(true);
        }
      }

      return { x: targetX, y: targetY };
    });
  };

  // ⌨️ KEYBOARD LISTENERS
  useEffect(() => {
    if (stageState !== 'river-crossing' && stageState !== 'find-clef' && stageState !== 'chest-scene') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': attemptMove(0, -playerSpeed); break;
        case 'ArrowDown': case 's': case 'S': attemptMove(0, playerSpeed); break;
        case 'ArrowLeft': case 'a': case 'A': attemptMove(-playerSpeed, 0); break;
        case 'ArrowRight': case 'd': case 'D': attemptMove(playerSpeed, 0); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stageState, bridgeRevealed]);

  // 🚨 EVENT TRIGGERS (River & Clef)
  useEffect(() => {
    // 1. Cross the river
    if (stageState === 'river-crossing' && playerPos.x >= 700) {
      onCrossedRiver();
    }
    
    // 2. Find the Treble Clef
    if (stageState === 'find-clef') {
      const clefX = 433;
      const clefY = 354;
      const distanceToClef = Math.sqrt(Math.pow(playerPos.x - clefX, 2) + Math.pow(playerPos.y - clefY, 2));
      
      // Hitbox tolerance of 50px
      if (distanceToClef <= 120) {
        onFoundClef();
      }
    }
  }, [playerPos, stageState, onCrossedRiver, onFoundClef]);

  // 🎒 DRAG AND DROP TRAP LOGIC
  const handleDragStart = (e: React.DragEvent, itemName: string) => {
    e.dataTransfer.setData("text/plain", itemName);
  };

  const handleDropOnRiver = (e: React.DragEvent) => {
    e.preventDefault();
    const itemName = e.dataTransfer.getData("text/plain");
    setSinkMessage(`The ${itemName} sank into the rushing waters! You cannot rely on physical tools here.`);
    setTimeout(() => setSinkMessage(""), 3000);
  };

  // 🖼️ DYNAMIC BACKGROUND LOGIC
  const getBackgroundUrl = () => {
    if (stageState === 'find-clef') return "url('/treble_clef.png')";
    if (stageState === 'chest-scene') return "url('/chest_river.png')";
    return "url('/rushing_river.png')"; 
  };

  return (
    <div className="flex-1 w-full relative overflow-hidden flex flex-col items-center justify-center bg-slate-800 rounded border-4 border-black shadow-[inset_4px_4px_0px_rgba(0,0,0,0.5)]">
      
      {/* RIDDLE INTRO */}
      {stageState === 'riddle-intro' && (
         <div className="m-auto w-full max-w-md bg-blue-50 text-black border-4 border-black p-6 rounded-xl shadow-[6px_6px_0px_#000] text-center relative z-10">
           <h2 className="text-xl font-black uppercase text-blue-900 mt-4 mb-3">The Rushing Waters</h2>
           <div className="bg-white border-2 border-black p-4 rounded-lg italic font-bold text-sm text-slate-800 leading-relaxed mb-6">
             "When wild, rushing waters block where you must go,<br />
             Take a brave step of faith—and the bridge will just show!"
           </div>
           <button 
             onClick={onStartCrossing}
             className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-3 px-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_#000] active:translate-y-1 uppercase"
           >
             Face the River ➔
           </button>
         </div>
      )}

      {/* 🟢 DYNAMIC MAP STAGE (Handles River, Clef, and Chest) */}
      {(stageState === 'river-crossing' || stageState === 'find-clef' || stageState === 'chest-scene') && (
        <div className="w-full h-full flex flex-col items-center justify-between bg-slate-950 p-2 relative">
          
          <div 
            className="relative border-4 border-black shadow-[4px_4px_0px_#000] bg-cover bg-center overflow-hidden w-full flex-1 transition-all duration-300"
            style={{ backgroundImage: getBackgroundUrl() }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnRiver}
          >
            
            {/* 🌉 RIVER SPECIFICS */}
            {stageState === 'river-crossing' && (
              <>
                <div className="absolute inset-0 bg-[url('/water_texture.png')] animate-slide-down opacity-20 mix-blend-overlay pointer-events-none" />
                <div className={`absolute top-[280px] -translate-y-1/2 left-[350px] w-[300px] h-20 bg-yellow-400/80 border-y-4 border-yellow-600 shadow-[0_10px_0_rgba(0,0,0,0.2)] transition-opacity duration-1000 z-10 ${bridgeRevealed ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-full h-full bg-[url('/cobblestone.png')] opacity-30 mix-blend-multiply" />
                </div>
              </>
            )}

            {/* 🎵 CLEF SPECIFICS (Invisible Hint Marker at x:433, y:354) */}
            {stageState === 'find-clef' && (
               <div className="absolute top-4 left-4 text-xs font-black text-amber-100 bg-black/70 p-2 rounded border-2 border-amber-500 z-50 shadow-[2px_2px_0px_#000]">
                 Walk the path to find the Gardener's Musical Mark ➔
               </div>
            )}

            {/* 📦 CHEST SPECIFICS (Clickable hotspot at x:440, y:287) */}
            {stageState === 'chest-scene' && (
               <button 
                  onClick={onOpenChest}
                  className="absolute z-30 cursor-pointer outline-none hover:scale-110 active:scale-95 transition-transform"
                  style={{ left: '440px', top: '287px', width: '150px', height: '150px', transform: 'translate(-50%, -50%)' }}
                  aria-label="Click to open chest"
               />
            )}

            {/* Sink Feedback Message (Only relevant during crossing) */}
            {sinkMessage && stageState === 'river-crossing' && (
               <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black p-3 border-4 border-black shadow-[4px_4px_0px_#000] z-50 animate-bounce">
                  💦 {sinkMessage}
               </div>
            )}

            {/* Player Character */}
            <div 
              className="absolute w-24 h-24 -translate-x-1/2 -translate-y-[80%] transition-all duration-75 ease-out z-20 pointer-events-none"
              style={{ left: `${playerPos.x}px`, top: `${playerPos.y}px` }}
            >
              <img src={characterPath} alt="Character" className="w-full h-full object-contain drop-shadow-[0_10px_8px_rgba(0,0,0,0.5)]" />
            </div>

            {/* On-Screen D-Pad */}
            <div className="absolute bottom-4 right-4 flex flex-col items-center gap-1 bg-slate-950 p-3 rounded-full border-4 border-black shadow-[0_4px_0_#000] z-30 opacity-80 hover:opacity-100 transition-opacity">
               <button onClick={() => attemptMove(0, -playerSpeed)} className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1">↑</button>
               <div className="flex gap-1">
                 <button onClick={() => attemptMove(-playerSpeed, 0)} className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1">←</button>
                 <button onClick={() => attemptMove(0, playerSpeed)} className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1">↓</button>
                 <button onClick={() => attemptMove(playerSpeed, 0)} className="w-12 h-12 bg-slate-100 text-black text-xl font-black border-2 border-black rounded hover:bg-white active:translate-y-1">→</button>
               </div>
            </div>
          </div>

          {/* BOTTOM INVENTORY BAR (Only shows during river crossing) */}
          {stageState === 'river-crossing' && (
             <div className="w-full bg-slate-300 border-4 border-black mt-2 p-3 flex items-center gap-4 shadow-[4px_4px_0px_#000] z-30 shrink-0">
                <span className="font-black text-sm uppercase text-slate-800">Drag items to water:</span>
                <div draggable onDragStart={(e) => handleDragStart(e, "Planks")} className="bg-amber-700 w-20 h-10 border-2 border-black flex items-center justify-center text-xs font-bold text-white cursor-grab active:cursor-grabbing shadow-[2px_2px_0px_#000]">Planks</div>
                <div draggable onDragStart={(e) => handleDragStart(e, "Boat")} className="bg-amber-900 w-24 h-10 border-2 border-black flex items-center justify-center text-xs font-bold text-white cursor-grab active:cursor-grabbing shadow-[2px_2px_0px_#000]">🚣 Boat</div>
                <div draggable onDragStart={(e) => handleDragStart(e, "Cat")} className="bg-orange-400 w-12 h-10 border-2 border-black flex items-center justify-center text-xs font-bold text-black cursor-grab active:cursor-grabbing shadow-[2px_2px_0px_#000]">🐱</div>
             </div>
          )}
        </div>
      )}

      {/* SOLVED STAGE */}
      {stageState === 'solved' && (
        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-blue-100 border-4 border-black p-6 shadow-[8px_8px_0px_#000] max-w-sm text-black">
            {/* 3. NEW: Dynamic chunks displaying the final fragment! */}
            <p className="text-lg font-black text-slate-900 bg-white p-2 border-2 border-black shadow-[2px_2px_0px_#000]">
              "{verseChunks.length > 0 ? verseChunks.join(' ') : 'Forging...'}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}