'use client';

import React from 'react';
import { GameProvider } from '../context/GameContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GameProvider>
      {children}
    </GameProvider>
  );
}
