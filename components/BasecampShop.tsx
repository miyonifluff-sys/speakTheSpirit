'use client';

import React from 'react';
import { useGame } from '../context/GameContext';

export default function BasecampShop() {
  const { 
    cupcakes, 
    cucumbers, 
    setCupcakes, 
    setCucumbers, 
    tickets, 
    setTickets, 
    hasSwordOfTruth, 
    setHasSwordOfTruth, 
    hasHolyWater, 
    setHasHolyWater, 
    setCurrentScreen, 
    setFeedback, 
    triggerShake, 
    addLog 
  } = useGame();

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center border-b-2 border-slate-700 pb-3 mb-4">
          <span className="text-pink-400 font-black tracking-widest uppercase text-xs">Phase 2b: Basecamp & Shop</span>
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

        <div className="flex items-center gap-4 bg-slate-900 p-4 border-4 border-black rounded-xl mb-6 shadow-[3px_3px_0px_#000]">
          <div className="w-12 h-12 rounded-full bg-pink-400 border-2 border-black flex items-center justify-center text-2xl shrink-0">💂</div>
          <div>
            <p className="text-pink-400 font-bold text-xs uppercase">Basecamp Armory & Supplies</p>
            <p className="text-sm italic text-slate-200 mt-1">
              {"\"Welcome, Messenger! Trade your earned sweets for survival items. Got some Cucumbers? I'll buy them too!\""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="bg-slate-900 p-4 border-3 border-black rounded-xl flex items-center justify-between shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚔️</span>
              <div>
                <h4 className="font-extrabold text-sm text-slate-100">Sword of Truth</h4>
                <p className="text-[10px] text-slate-400">Shatters Silencer barriers instantly.</p>
                <span className="text-xs font-black text-pink-400">{hasSwordOfTruth ? "OWNED" : "Cost: 8 Cupcakes 🧁"}</span>
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
              className={`font-black text-xs px-3 py-2 rounded border-2 border-black ${hasSwordOfTruth ? 'bg-slate-700 text-slate-500 cursor-not-allowed border-slate-800' : 'bg-yellow-400 hover:bg-yellow-300 text-black neo-btn'}`}
            >
              Buy ⚔️
            </button>
          </div>

          <div className="bg-slate-900 p-4 border-3 border-black rounded-xl flex items-center justify-between shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧪</span>
              <div>
                <h4 className="font-extrabold text-sm text-slate-100">Holy Water Spray</h4>
                <p className="text-[10px] text-slate-400">Breaches Love Island's Static Barrier.</p>
                <span className="text-xs font-black text-pink-400">{hasHolyWater ? "OWNED" : "Cost: 5 Cupcakes 🧁"}</span>
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
              className={`font-black text-xs px-3 py-2 rounded border-2 border-black ${hasHolyWater ? 'bg-slate-700 text-slate-500 cursor-not-allowed border-slate-800' : 'bg-yellow-400 hover:bg-yellow-300 text-black neo-btn'}`}
            >
              Buy 🧪
            </button>
          </div>

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

      <div className="mt-6 pt-3 border-t-2 border-slate-700 flex justify-between items-center text-xs">
        <span className="text-pink-400 font-bold animate-pulse">{"Items synced! placeholder"}</span>
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
  );
}
