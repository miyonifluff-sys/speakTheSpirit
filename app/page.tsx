'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import AuthGate from '../components/AuthGate';
import GameHeader from '../components/GameHeader';
import ConsoleLog from '../components/ConsoleLog';
import IntroDialogue from '../components/IntroDialogue';
import OverworldMap from '../components/OverworldMap';
import QuestRiddle from '../components/QuestRiddle';
import BattleArea from '../components/BattleArea';
import Debrief from '../components/Debrief';
import BasecampShop from '../components/BasecampShop';

export default function Home() {
  const { currentScreen, isLoggedIn, portalActive } = useGame();

  // 1. Auth Gate: If not logged in, show the login screen and nothing else.
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <AuthGate />
      </div>
    );
  }

  // 2. Portal Animation Overlay: Shows up during restoration
  const renderPortal = () => (
    <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="absolute inset-0 bg-radial-gradient from-violet-600/30 via-transparent to-transparent animate-radial-pulse"></div>
      <div className="w-48 h-48 rounded-full border-8 border-dashed border-cyan-400 animate-spin-slow flex items-center justify-center relative">
        <div className="w-32 h-32 rounded-full border-8 border-dotted border-pink-500 animate-spin flex items-center justify-center">
          <span className="text-6xl animate-ping">✨</span>
        </div>
      </div>
      <h2 className="text-3xl font-black mt-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300 animate-pulse tracking-widest uppercase">
        RESTORING FREQUENCIES
      </h2>
      <p className="text-yellow-400 font-semibold mt-3 animate-bounce">
        {"\"For God so loved the world...\" soundwaves are breaking the silent curse!"}
      </p>
    </div>
  );

  // 3. Main Content Switcher
  const renderScreen = () => {
    switch (currentScreen) {
      case 'INTRO': return <IntroDialogue />;
      case 'OVERWORLD': return <OverworldMap />;
      case 'QUEST': return <QuestRiddle />;
      case 'BATTLE': return <BattleArea />;
      case 'DEBRIEF': return <Debrief />;
      case 'SHOP': return <BasecampShop />;
      default: return <IntroDialogue />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-mono p-4 flex flex-col items-center justify-start selection:bg-yellow-400 selection:text-black">
      
      {/* Global Styles for Neobrutalism Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes radial-pulse { 0%, 100% { transform: scale(1); opacity: 0.2; } 50% { transform: scale(1.15); opacity: 0.35; } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-shake-box { animation: shake 0.4s ease-in-out; }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        .animate-radial-pulse { animation: radial-pulse 4s ease-in-out infinite; }
        .neo-card { border: 4px solid #000; box-shadow: 6px 6px 0px 0px #000; transition: all 0.15s ease-out; }
        .neo-btn { border: 3px solid #000; box-shadow: 4px 4px 0px 0px #000; transition: all 0.1s ease-out; }
        .neo-btn:hover { transform: translate(-1px, -1px); box-shadow: 5px 5px 0px 0px #000; }
        .neo-btn:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0px 0px #000; }
      `}} />

      <GameHeader />

      <main className="w-full max-w-4xl min-h-[500px] flex flex-col justify-between p-6 bg-slate-800 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {portalActive && renderPortal()}
        {renderScreen()}
      </main>

      <ConsoleLog />
    </div>
  );
}
