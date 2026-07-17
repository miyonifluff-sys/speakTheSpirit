import React, { useState, useEffect } from 'react';

interface RushingWatersStageProps {
  stageState: string;
  characterPath: string;
  onStartCrossing: () => void;
  onCrossedRiver: () => void;
}

export default function RushingWatersStage({
  stageState,
  characterPath,
  onStartCrossing,
  onCrossedRiver
}: RushingWatersStageProps) {
  
  // 🚶‍♂️ 2D WALKING STATE
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 300 });
  const [bridgeRevealed, setBridgeRevealed] = useState(false);
  const [sinkMessage, setSinkMessage] = useState("");
  const playerSpeed = 15;

  const attemptMove = (dx: number, dy: number) => {
    setPlayerPos((prev) => {
      let targetX = prev.x + dx;
      let targetY = prev.y + dy;
      
      // Boundaries
      if (targetX < 0) targetX = 0;
      if (targetX > 750) targetX = 750;
      if (targetY < 0) targetY = 0;
      if (targetY > 550) targetY = 550;

      // The River is roughly from X: 200 to X: 600. 
      if (targetX > 300 && targetX < 700) {
        // If they step onto the water, reveal the bridge!
        if (!bridgeRevealed) {
          setBridgeRevealed(true);
        }
      }

      return { x: targetX, y: targetY };
    });
  };

  useEffect(() => {
    if (stageState !== 'river-crossing') return;
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Check win condition
  useEffect(() => {
    if (stageState === 'river-crossing' && playerPos.x >= 600) {
      onCrossedRiver();
    }
  }, [playerPos, stageState, onCrossedRiver]);

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

      {/* RIVER CROSSING STAGE */}
      {stageState === 'river-crossing' && (
        <div className="w-full h-full flex flex-col items-center justify-between bg-slate-950 p-2 relative">
          
          {/* 🌊 ACTUAL RUSHING RIVER (Takes up the whole visual stage) */}
          <div 
            className="relative border-4 border-black shadow-[4px_4px_0px_#000] bg-[url('/rushing_river.png')] bg-cover bg-center overflow-hidden w-full flex-1"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnRiver}
          >
            {/* Optional: Keeping a slight animated texture over the image for extra movement */}
            <div className="absolute inset-0 bg-[url('/water_texture.png')] animate-slide-down opacity-20 mix-blend-overlay pointer-events-none" />

            {/* 🌉 The Invisible Bridge (Only reveals when stepped on) */}
            <div className={`absolute top-[280px] -translate-y-1/2 left-[350px] w-[300px] h-20 bg-yellow-400/80 border-y-4 border-yellow-600 shadow-[0_10px_0_rgba(0,0,0,0.2)] transition-opacity duration-1000 z-10 ${bridgeRevealed ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-full h-full bg-[url('/cobblestone.png')] opacity-30 mix-blend-multiply" />
            </div>

            {/* Instructions */}
            <div className="absolute top-4 left-4 text-xs font-black text-amber-100 bg-black/70 p-2 rounded border-2 border-amber-500 z-50 shadow-[2px_2px_0px_#000]">
              Use Arrow Keys to move. What are you walking on? ➔
            </div>

            {/* Sink Feedback Message */}
            {sinkMessage && (
               <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black p-3 border-4 border-black shadow-[4px_4px_0px_#000] z-50 animate-bounce">
                  💦 {sinkMessage}
               </div>
            )}

            {/* Player Character */}
            <div 
              className="absolute w-24 h-24 -translate-x-1/2 -translate-y-[80%] transition-all duration-75 ease-out z-20"
              style={{ left: `${playerPos.x}px`, top: `${playerPos.y}px` }}
            >
              <img src={characterPath} alt="Character" className="w-full h-full object-contain drop-shadow-[0_10px_8px_rgba(0,0,0,0.5)]" />
            </div>
          </div>

          {/* BOTTOM INVENTORY BAR (The Trap) */}
          <div className="w-full bg-slate-300 border-4 border-black mt-2 p-3 flex items-center gap-4 shadow-[4px_4px_0px_#000] z-30 shrink-0">
             <span className="font-black text-sm uppercase text-slate-800">Drag items to water:</span>
             <div 
                draggable 
                onDragStart={(e) => handleDragStart(e, "Planks")}
                className="bg-amber-700 w-20 h-10 border-2 border-black flex items-center justify-center text-xs font-bold text-white cursor-grab active:cursor-grabbing shadow-[2px_2px_0px_#000]"
             >
                Planks
             </div>
             <div 
                draggable 
                onDragStart={(e) => handleDragStart(e, "Boat")}
                className="bg-amber-900 w-24 h-10 border-2 border-black flex items-center justify-center text-xs font-bold text-white cursor-grab active:cursor-grabbing shadow-[2px_2px_0px_#000]"
             >
                🚣 Boat
             </div>
             <div 
                draggable 
                onDragStart={(e) => handleDragStart(e, "Cat")}
                className="bg-orange-400 w-12 h-10 border-2 border-black flex items-center justify-center text-xs font-bold text-black cursor-grab active:cursor-grabbing shadow-[2px_2px_0px_#000]"
             >
                🐱
             </div>
          </div>
        </div>
      )}

      {/* SOLVED STAGE */}
      {stageState === 'solved' && (
        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-blue-100 border-4 border-black p-6 shadow-[8px_8px_0px_#000] max-w-sm text-black">
            <h2 className="text-xl font-black mb-4 uppercase text-blue-900 border-b-4 border-black pb-2">Conviction (Elenchos)</h2>
            <p className="text-sm font-bold text-slate-800 text-left mb-4">
              In ancient courts, an <i>elenchos</i> was physical evidence that forced the truth to light. Faith isn't a blind guess; it is acting on the undeniable character of the Gardener.
            </p>
            <p className="text-lg font-black text-slate-900 bg-white p-2 border-2 border-black shadow-[2px_2px_0px_#000]">
              "and the conviction of things not seen."
            </p>
          </div>
        </div>
      )}
    </div>
  );
}