'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Screen = 'INTRO' | 'OVERWORLD' | 'QUEST' | 'BATTLE' | 'DEBRIEF' | 'SHOP';

export interface LogEntry {
  text: string;
  type: 'system' | 'angel' | 'battle' | 'shop' | 'songbeast';
  timestamp: string;
}

export type LoginMethod = 'WALLET' | 'SOCIAL' | null;

interface GameContextType {
  // Navigation / Auth State
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  isLoggedIn: boolean;
  userWallet: string | null;
  loginMethod: LoginMethod;
  handleLogin: (method: LoginMethod, identifier?: string) => void;
  handleLogout: () => void;

  // Game Logic State
  introStep: number;
  setIntroStep: (step: number) => void;
  questObjectClicked: boolean;
  setQuestObjectClicked: (clicked: boolean) => void;
  battleStep: number;
  setBattleStep: (step: number) => void;
  battleShieldHp: number;
  setBattleShieldHp: (hp: number) => void;
  portalActive: boolean;
  setPortalActive: (active: boolean) => void;
  isSongbeastRehomed: boolean;
  setIsSongbeastRehomed: (rehomed: boolean) => void;

  // Currencies / Inventory
  cupcakes: number;
  setCupcakes: (val: number | ((prev: number) => number)) => void;
  cucumbers: number;
  setCucumbers: (val: number | ((prev: number) => number)) => void;
  tickets: number;
  setTickets: (val: number | ((prev: number) => number)) => void;
  hasSwordOfTruth: boolean;
  setHasSwordOfTruth: (val: boolean) => void;
  hasHolyWater: boolean;
  setHasHolyWater: (val: boolean) => void;

  // Interface Feedbacks
  feedback: string;
  setFeedback: (fb: string) => void;
  shakeTrigger: boolean;
  setShakeTrigger: (val: boolean) => void;
  gameLogs: LogEntry[];
  setGameLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;

  // Actions
  addLog: (text: string, type: LogEntry['type']) => void;
  triggerShake: () => void;
  handleResetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Navigation & Authentication
  const [currentScreen, setCurrentScreen] = useState<Screen>('INTRO');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);

  // Gameplay Progress
  const [introStep, setIntroStep] = useState<number>(0);
  const [questObjectClicked, setQuestObjectClicked] = useState<boolean>(false);
  const [battleStep, setBattleStep] = useState<number>(0);
  const [battleShieldHp, setBattleShieldHp] = useState<number>(100);
  const [portalActive, setPortalActive] = useState<boolean>(false);
  const [isSongbeastRehomed, setIsSongbeastRehomed] = useState<boolean>(false);

  // Currencies & Inventory
  const [cupcakes, setCupcakes] = useState<number>(4);
  const [cucumbers, setCucumbers] = useState<number>(0);
  const [tickets, setTickets] = useState<number>(1);
  const [hasSwordOfTruth, setHasSwordOfTruth] = useState<boolean>(false);
  const [hasHolyWater, setHasHolyWater] = useState<boolean>(false);

  // Visual / Feedback State
  const [feedback, setFeedback] = useState<string>('');
  const [shakeTrigger, setShakeTrigger] = useState<boolean>(false);
  const [gameLogs, setGameLogs] = useState<LogEntry[]>([]);

  // Logs helper
  const addLog = (text: string, type: LogEntry['type']) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setGameLogs((prev) => [{ text, type, timestamp: time }, ...prev].slice(0, 50));
  };

  // Safe client-side initial loading log
  useEffect(() => {
    const timer = setTimeout(() => {
      addLog("System initialized. Awaiting player validation.", "system");
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Visual shaker helper
  const triggerShake = () => {
    setShakeTrigger(true);
    setTimeout(() => setShakeTrigger(false), 500);
  };

  // Mock Authentication Functions
  const handleLogin = (method: LoginMethod, identifier?: string) => {
    setIsLoggedIn(true);
    setLoginMethod(method);
    if (method === 'WALLET') {
      const mockAddress = identifier || "0x9F3...7E2a";
      setUserWallet(mockAddress);
      addLog(`Wallet Connected successfully: ${mockAddress}`, "system");
    } else {
      setUserWallet(null);
      addLog(`Authenticated via social auth: ${identifier || 'PlayerOne@google.com'}`, "system");
    }
    setFeedback("Authentication successful! Welcome to the Valley.");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserWallet(null);
    setLoginMethod(null);
    setCurrentScreen('INTRO');
    addLog("Player logged out. Connection closed.", "system");
  };

  // Reset Progression State
  const handleResetGame = () => {
    setCurrentScreen('INTRO');
    setIntroStep(0);
    setQuestObjectClicked(false);
    setBattleStep(0);
    setBattleShieldHp(100);
    setPortalActive(false);
    setIsSongbeastRehomed(false);
    setCupcakes(4);
    setCucumbers(0);
    setTickets(1);
    setHasSwordOfTruth(false);
    setHasHolyWater(false);
    setFeedback('');
    addLog("Game values reset to start. Starting over...", "system");
  };

  return (
    <GameContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        isLoggedIn,
        userWallet,
        loginMethod,
        handleLogin,
        handleLogout,

        introStep,
        setIntroStep,
        questObjectClicked,
        setQuestObjectClicked,
        battleStep,
        setBattleStep,
        battleShieldHp,
        setBattleShieldHp,
        portalActive,
        setPortalActive,
        isSongbeastRehomed,
        setIsSongbeastRehomed,

        cupcakes,
        setCupcakes,
        cucumbers,
        setCucumbers,
        tickets,
        setTickets,
        hasSwordOfTruth,
        setHasSwordOfTruth,
        hasHolyWater,
        setHasHolyWater,

        feedback,
        setFeedback,
        shakeTrigger,
        setShakeTrigger,
        gameLogs,
        setGameLogs,

        addLog,
        triggerShake,
        handleResetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
