'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import { addLog as emitGameLog } from '../utils/gameEvents';

export default function Debrief() {
  const { 
    isSongbeastRehomed, 
    setIsSongbeastRehomed, 
    tickets, 
    setTickets, 
    setCupcakes, 
    setCucumbers, 
    feedback, 
    setFeedback, 
    setCurrentScreen, 
    clearIsland 
  } = useGame();

  const handleGiveTicket = () => {
    if (tickets <= 0) {
      setFeedback("Oh no! You don't have any Basecamp Tickets in your inventory.");
      return;
    }
    setTickets(tickets - 1);
    setIsSongbeastRehomed(true);
    setCupcakes(prev => prev + 5);
    setCucumbers(prev => prev + 2);
    emitGameLog("Sent Barnaby safe to Basecamp via Ticket! Gained +5 Cupcakes and +2 Cucumbers!", "songbeast");
    clearIsland('Faith Island');
    setFeedback("Barnaby: 'Hooray! Thank you for rescuing me! See you back at the Castle!'");
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center border-b-2 border-slate-700 pb-3 mb-4">
          <span className="text-yellow-400 font-black tracking-widest uppercase text-xs">Phase 5: Debrief & Rescue</span>
          <span className="bg-yellow-950 text-yellow-400 px-2.5 py-1 text-xs font-bold rounded-lg border border-yellow-800">
            Quest Success!
          </span>
        </div>

        <div className="bg-emerald-100 border-4 border-black p-6 rounded-2xl text-black shadow-[4px_4px_0px_#000] text-center max-w-xl mx-auto my-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-15"></div>
          <div className="absolute top-4 left-6 text-2xl animate-float">🎵</div>
          <div className="absolute top-10 right-8 text-3xl animate-bounce">🎶</div>
          <div className="absolute bottom-6 left-12 text-xl animate-bounce">🌸</div>

          <div className="w-24 h-24 rounded-full bg-emerald-300 border-4 border-black flex items-center justify-center text-5xl mx-auto shadow-[3px_3px_0px_#000] animate-bounce mb-4">🐰</div>
          <h3 className="font-black text-xl text-emerald-950">Barnaby the Bunny</h3>
          <p className="text-xs bg-emerald-200 border-2 border-emerald-400 text-emerald-900 font-bold px-2 py-0.5 rounded-full inline-block mt-1">🌸 status: reborn & singing 🌸</p>
          <p className="text-sm font-bold italic text-slate-800 mt-4 leading-relaxed bg-white p-4 border-2 border-black rounded-xl">
            {"\"Oh, praise the Gardener! I can hear the lovely frequencies again!\""}
          </p>

          {!isSongbeastRehomed ? (
            <div className="mt-5 border-t border-emerald-300 pt-4 flex flex-col items-center">
              <p className="text-xs font-bold text-slate-700 mb-3">
                {"🎟️ Give Barnaby a Basecamp Ticket to escort them to safety & collect your reward items!"}
              </p>
              <button onClick={handleGiveTicket} className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-sm px-6 py-3 rounded-xl neo-btn flex items-center gap-2">
                🎟️ Give Basecamp Ticket (1 Needed)
              </button>
            </div>
          ) : (
            <div className="mt-5 border-t-2 border-dashed border-emerald-400 pt-4 text-center">
              <p className="text-green-700 font-extrabold text-sm mb-2">🎉 Barnaby is rescued!</p>
              <p className="text-xs font-bold text-slate-600">He happily hops onto the Castle carrier and glides away to Basecamp, singing beautiful harmonies!</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between">
        <span className="text-pink-400 text-xs font-bold animate-pulse">{feedback}</span>
        <button onClick={() => { setCurrentScreen('OVERWORLD'); setFeedback(''); }} className="bg-green-500 text-white font-black uppercase text-sm px-6 py-3 rounded-xl neo-btn w-full md:w-auto">
          🗺️ Return to Overworld Map
        </button>
      </div>
    </div>
  );
}
