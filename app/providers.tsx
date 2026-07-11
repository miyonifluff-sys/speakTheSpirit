'use client';

import React, { Suspense } from 'react';
import { GameProvider } from '../context/GameContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <GameProvider>
        {children}
      </GameProvider>
    </Suspense>
  );
}
