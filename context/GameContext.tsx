'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { addLog as emitGameLog } from '../utils/gameEvents';
import { supabaseService } from '../services/supabaseService';

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

  // Progression Tracking
  clearedIslands: string[];
  clearIsland: (islandName: string) => void;

  // Interface Feedbacks
  feedback: string;
  setFeedback: (fb: string) => void;
  shakeTrigger: boolean;
  setShakeTrigger: (val: boolean) => void;
  isTransactionPending: boolean;
  setIsTransactionPending: (pending: boolean) => void;
  gameLogs: LogEntry[];
  setGameLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;

  // Actions
  triggerShake: () => void;
  handleResetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navigation & Authentication
  const [currentScreen, setCurrentScreenState] = useState<Screen>('INTRO');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);

  // Sync state with URL on load and on URL change
  useEffect(() => {
    const screenParam = searchParams.get('screen');
    if (screenParam) {
      const validScreens: Screen[] = ['INTRO', 'OVERWORLD', 'QUEST', 'BATTLE', 'DEBRIEF', 'SHOP'];
      if (validScreens.includes(screenParam as Screen)) {
        setCurrentScreenState(screenParam as Screen);
      }
    }
  }, [searchParams]);

  const setCurrentScreen = (screen: Screen) => {
    setCurrentScreenState(screen);
    router.push(`?screen=${screen}`, { scroll: false });
  };

  // Gameplay Progress
  const [introStep, setIntroStep] = useState<number>(0);
  const [questObjectClicked, setQuestObjectClicked] = useState<boolean>(false);
  const [battleStep, setBattleStep] = useState<number>(0);
  const [battleShieldHp, setBattleShieldHp] = useState<number>(100);
  const [portalActive, setPortalActive] = useState<boolean>(false);
  const [isSongbeastRehomed, setIsSongbeastRehomed] = useState<boolean>(false);

  // Currencies & Inventory
  const getSavedReward = (key: string) => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('sts_rewards');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      return parsed[key];
    } catch {
      return null;
    }
  };

  const [cupcakes, setCupcakesState] = useState<number>(() => getSavedReward('cupcakes') ?? 0);
  const [cucumbers, setCucumbersState] = useState<number>(() => getSavedReward('cucumbers') ?? 0);
  const [tickets, setTicketsState] = useState<number>(() => getSavedReward('tickets') ?? 0);
  const [hasSwordOfTruth, setHasSwordOfTruth] = useState<boolean>(false);
  const [hasHolyWater, setHasHolyWater] = useState<boolean>(false);

  // Progression
  const [clearedIslands, setClearedIslands] = useState<string[]>([]);

  // Visual / Feedback State
  const [feedback, setFeedback] = useState<string>('');
  const [shakeTrigger, setShakeTrigger] = useState<boolean>(false);
  const [isTransactionPending, setIsTransactionPending] = useState<boolean>(false);
  const [gameLogs, setGameLogs] = useState<LogEntry[]>([]);

  // --- MOCK SMART CONTRACT BRIDGE (LocalStorage) ---
  const persistRewards = (newCupcakes: number, newCucumbers: number, newTickets: number) => {
    localStorage.setItem('sts_rewards', JSON.stringify({
      cupcakes: newCupcakes,
      cucumbers: newCucumbers,
      tickets: newTickets,
    }));
  };

  // --- SUPABASE DATABASE INTEGRATION ---
  const fetchProfile = async (wallet: string) => {
    try {
      const profile = await supabaseService.fetchProfile(wallet);

      if (profile) {
        setCupcakesState(profile.cupcakes ?? 5);
        setCucumbersState(profile.cucumbers ?? 5);
        setTicketsState(profile.tickets ?? 1);
        
        const loadedIslands = profile.clearedIslands || [];
        setClearedIslands(loadedIslands);
        
        persistRewards(profile.cupcakes ?? 5, profile.cucumbers ?? 5, profile.tickets ?? 1);
      } else {
        loadOfflineFallback();
      }
    } catch (err: unknown) {
      console.error("Supabase profile fetch exception:", err);
      emitGameLog("Database exception. Using offline fallback.", "system");
      loadOfflineFallback();
    }
  };

  const loadOfflineFallback = () => {
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
    } else {
      setCupcakesState(5);
      setCucumbersState(5);
      setTicketsState(1);
    }
  };

  const saveProfile = async (wallet: string, updatedFields: {
    cupcakes?: number;
    cucumbers?: number;
    tickets?: number;
    clearedIslands?: string[];
  }) => {
    try {
      await supabaseService.saveProfile(wallet, updatedFields);
    } catch (err) {
      console.error("Supabase profile update exception:", err);
    }
  };

  // Wrappers for currency updates to ensure persistence
  const setCupcakes = (val: number | ((prev: number) => number)) => {
    setCupcakesState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      queueMicrotask(() => {
        persistRewards(next, cucumbers, tickets);
        if (userWallet) {
          saveProfile(userWallet, { cupcakes: next });
        }
      });
      return next;
    });
  };

  const setCucumbers = (val: number | ((prev: number) => number)) => {
    setCucumbersState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      queueMicrotask(() => {
        persistRewards(cupcakes, next, tickets);
        if (userWallet) {
          saveProfile(userWallet, { cucumbers: next });
        }
      });
      return next;
    });
  };

  const setTickets = (val: number | ((prev: number) => number)) => {
    setTicketsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      queueMicrotask(() => {
        persistRewards(cupcakes, cucumbers, next);
        if (userWallet) {
          saveProfile(userWallet, { tickets: next });
        }
      });
      return next;
    });
  };

  // Progression Tracking Clear Island
  const clearIsland = async (islandName: string) => {
    setClearedIslands((prev) => {
      if (prev.includes(islandName)) return prev;
      const next = [...prev, islandName];
      queueMicrotask(() => {
        if (userWallet) {
          saveProfile(userWallet, { clearedIslands: next });
        }
      });
      return next;
    });
    emitGameLog(`Cleared island progression updated: ${islandName}!`, "system");
  };

  // Visual shaker helper
  const triggerShake = () => {
    setShakeTrigger(true);
    setTimeout(() => setShakeTrigger(false), 500);
  };

  // Mock Authentication Functions

  // Mock Authentication Functions
  const handleLogin = async () => {
    setIsLoggedIn(true);
    setLoginMethod('MOCK');
    const wallet = "0xMOCK_USER_VALIDATED";
    setUserWallet(wallet);
    
    // Fetch profile from Supabase
    await fetchProfile(wallet);
    setFeedback("Authentication successful! Welcome to the Valley.");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserWallet(null);
    setLoginMethod(null);
    setCurrentScreen('INTRO');
    emitGameLog("Player logged out. Connection closed.", "system");
  };

  // Reset Progression State
  const handleResetGame = async () => {
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
    setClearedIslands([]);
    
    setHasSwordOfTruth(false);
    setHasHolyWater(false);
    setFeedback('');
    emitGameLog("Game values reset to start. Starting over...", "system");

    if (userWallet) {
      await saveProfile(userWallet, {
        cupcakes: resetCupcakes,
        cucumbers: resetCucumbers,
        tickets: resetTickets,
        clearedIslands: [],
      });
    } else {
      persistRewards(resetCupcakes, resetCucumbers, resetTickets);
    }
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

        clearedIslands,
        clearIsland,

        feedback,
        setFeedback,
        shakeTrigger,
        setShakeTrigger,
        isTransactionPending,
        setIsTransactionPending,
        gameLogs,
        setGameLogs,

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
