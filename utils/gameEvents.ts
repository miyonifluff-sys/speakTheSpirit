'use client';

export type LogType = 'system' | 'angel' | 'battle' | 'shop' | 'songbeast';

export interface LogEntry {
  text: string;
  type: LogType;
  timestamp: string;
}

/**
 * Global game log dispatcher that allows any component or hook to log a message 
 * without having to prop-drill or depend on React Context hooks directly.
 */
export function addLog(text: string, type: LogType) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('game-log', {
      detail: { text, type },
    });
    window.dispatchEvent(event);
  }
}
