'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Screen = 'INTRO' | 'OVERWORLD' | 'QUEST' | 'BATTLE' | 'DEBRIEF' | 'SHOP';

export interface LogEntry {
  text: string;
  type: 'system' | 'angel' | 'battle' | 'shop' | 'songbeast';
  timestamp: string;
}

export type LoginMethod = 'MOCK' | null;

interface GameContextType {
  // Navigation / Auth State
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  isLoggedIn: boolean;
  userWallet: string | null;
  loginMethod: LoginMethod;
  handleLogin: () => void;
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
  const [cupcakes, setCupcakesState] = useState<number>(0);
  const [cucumbers, setCucumbersState] = useState<number>(0);
  const [tickets, setTicketsState] = useState<number>(0);
  const [hasSwordOfTruth, setHasSwordOfTruth] = useState<boolean>(false);
  const [hasHolyWater, setHasHolyWater] = useState<boolean>(false);

  // Visual / Feedback State
  const [feedback, setFeedback] = useState<string>('');
  const [shakeTrigger, setShakeTrigger] = useState<boolean>(false);
  const [gameLogs, setGameLogs] = useState<LogEntry[]>([]);

  // --- MOCK SMART CONTRACT BRIDGE (LocalStorage) ---
  useEffect(() => {
    const savedRewards = localStorage.getItem('sts_rewards');
    if (savedRewards) {
      try {
        const { cupcakes: sCup, cucumbers: sCuc, tickets: sTix } = JSON.parse(savedRewards);
        setCupcakesState(sCup);
        setCucumbersState(sCuc);
        setTicketsState(sTix);
      } catch (e) {
        console.error("Failed to parse saved rewards", e);
      }
    }
  }, []);

  const persistRewards = (newCupcakes: number, newCucumbers: number, newTickets: number) => {
    localStorage.setItem('sts_rewards', JSON.stringify({
      cupcakes: newCupcakes,
      cucumbers: newCucumbers,
      tickets: newTickets,
    }));
  };

  // Wrappers for currency updates to ensure persistence
  const setCupcakes = (val: number | ((prev: number) => number)) => {
    setCupcakesState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      persistRewards(next, cucumbers, tickets);
      return next;
    });
  };

  const setCucumbers = (val: number | ((prev: number) => number)) => {
    setCucumbersState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      persistRewards(cupcakes, next, tickets);
      return next;
    });
  };

  const setTickets = (val: number | ((prev: number) => number)) => {
    setTicketsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      persistRewards(cupcakes, cucumbers, next);
      return next;
    });
  };

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
  const handleLogin = () => {
    setIsLoggedIn(true);
    setLoginMethod('MOCK');
    setUserWallet("0xMOCK_USER_VALIDATED");
    
    // Initialize starting rewards if first time
    if (!localStorage.getItem('sts_rewards')) {
      const startCupcakes = 5;
      const startCucumbers = 5;
      const startTickets = 1;
      setCupcakesState(startCupcakes);
      setCucumbersState(startCucumbers);
      setTicketsState(startTickets);
      persistRewards(startCupcakes, startCucumbers, startTickets);
      addLog("New Player detected. Initial rewards minted: 5 Cupcakes, 5 Cucumbers.", "system");
    } else {
      addLog("Welcome back, Player. Rewards restored from bridge.", "system");
    }

    addLog(`Authenticated via Unified Mock Auth: 0xMOCK_USER`, "system");
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
    
    const resetCupcakes = 5;
    const resetCucumbers = 5;
    const resetTickets = 1;
    setCupcakesState(resetCupcakes);
    setCucumbersState(resetCucumbers);
    setTicketsState(resetTickets);
    persistRewards(resetCupcakes, resetCucumbers, resetTickets);
    
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
