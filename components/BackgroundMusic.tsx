'use client';

import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext'; 

export default function BackgroundMusic() {
  // Grab currentTrack from context!
  const { isMuted, setIsMuted, currentTrack } = useGame();
  const audioRef = useRef<HTMLAudioElement>(null);

  // 1. Handle Play/Pause when Mute toggles
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      if (!isMuted) {
        audioRef.current.play().catch(() => setIsMuted(true));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMuted]);

  // 2. Handle swapping the track when currentTrack changes!
  useEffect(() => {
    if (audioRef.current) {
      // If a new track is set, reload the audio engine
      audioRef.current.pause();
      audioRef.current.load(); 
      if (!isMuted) {
        audioRef.current.play().catch(() => setIsMuted(true));
      }
    }
  }, [currentTrack, isMuted]);

  return (
    <>
      {/* 🎵 Dynamic src based on context! */}
      <audio ref={audioRef} src={currentTrack} loop />
      
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="fixed bottom-4 right-4 z-50 bg-slate-800 text-white p-3 rounded-full border-2 border-black shadow-[4px_4px_0px_#000] hover:bg-slate-700 transition-transform active:translate-y-1 flex items-center justify-center"
        aria-label="Toggle Music"
      >
        {isMuted ? '🔇' : '🎵'}
      </button>
    </>
  );
}