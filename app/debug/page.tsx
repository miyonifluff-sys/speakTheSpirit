'use client';

import React, { useState } from 'react';

export default function MapDebugger() {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  // Calculate exact coordinates based on an 800x600 grid
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Scale the click to our 800x600 virtual game resolution
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    
    setPoints((prev) => [...prev, { x, y }]);
  };

  const clearPoints = () => setPoints([]);

  // Formats the points into an easy copy-paste block for your arrays
  const formattedCode = points.map(p => `{ x: ${p.x}, y: ${p.y} }`).join(', ');

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center gap-8 font-sans">
      <div className="text-center">
        <h1 className="text-3xl font-black text-amber-400 uppercase tracking-widest mb-2">🗺️ Map Path Debugger</h1>
        <p className="text-slate-400">Click along the paths to generate your waypoint arrays for the game engine.</p>
      </div>

      <div className="flex gap-8 items-start w-full max-w-6xl">
        
        {/* CLICKABLE MAP AREA */}
        <div 
          onClick={handleImageClick}
          className="relative border-4 border-black shadow-[8px_8px_0px_#000] cursor-crosshair shrink-0 bg-slate-800"
          style={{
            width: '800px', 
            height: '600px',
            backgroundImage: "url('/note_on_path.png')", // Change this if testing new maps!
            backgroundSize: '100% 100%'
          }}
        >
          {points.map((pt, i) => (
            <div 
              key={i}
              className="absolute pointer-events-none z-10 flex items-center justify-center"
              style={{
                left: `${pt.x}px`,
                top: `${pt.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Outer Tolerance Ring (Matches the 45px pathTolerance in your game math) */}
              <div className="absolute w-[90px] h-[90px] rounded-full bg-red-500/30 border-2 border-red-500/80"></div>
              
              {/* Inner Center Dot */}
              <div className="absolute w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
              
              {/* Number Label */}
              <span className="absolute -top-8 text-[12px] font-black text-white bg-black px-1.5 py-0.5 rounded shadow-sm">
                {i}
              </span>
            </div>
          ))}
        </div>

        {/* CODE OUTPUT PANEL */}
        <div className="flex-1 bg-slate-800 border-4 border-black p-6 shadow-[8px_8px_0px_#000] rounded flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-4 border-b-2 border-slate-700 pb-2">
            <h2 className="font-black text-xl text-cyan-400 uppercase">Generated Code</h2>
            <button 
              onClick={clearPoints}
              className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 font-black border-2 border-black rounded shadow-[2px_2px_0px_#000] active:translate-y-1"
            >
              CLEAR
            </button>
          </div>
          
          <div className="flex-1 bg-slate-950 p-4 rounded border-2 border-black overflow-y-auto font-mono text-sm text-green-400">
            {points.length === 0 ? (
              <span className="text-slate-600">Click on the map to start tracing a path...</span>
            ) : (
              <p className="whitespace-pre-wrap leading-loose">
                {formattedCode}
              </p>
            )}
          </div>
          
          <p className="text-xs text-slate-500 mt-4 italic">
            Copy this string and paste it into the pathWaypoints array in your Map component!
          </p>
        </div>
      </div>
    </div>
  );
}