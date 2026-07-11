'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { addLog as emitGameLog } from '../utils/gameEvents';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  gameLogs: LogEntry[];
  setGameLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;

  // Actions
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

  // Progression
  const [clearedIslands, setClearedIslands] = useState<string[]>([]);

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

  // --- SUPABASE DATABASE INTEGRATION ---
  const fetchProfile = async (wallet: string) => {
    try {
      emitGameLog("Fetching player profile from Supabase...", "system");
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet', wallet)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile from Supabase:", error);
        emitGameLog(`Database error: ${error.message}. Using offline fallback.`, "system");
        loadOfflineFallback();
        return;
      }

      if (data) {
        setCupcakesState(data.cupcakes ?? 5);
        setCucumbersState(data.cucumbers ?? 5);
        setTicketsState(data.tickets ?? 1);
        
        // Support only clearedIslands
        const loadedIslands = data.clearedIslands || [];
        setClearedIslands(loadedIslands);
        
        persistRewards(data.cupcakes ?? 5, data.cucumbers ?? 5, data.tickets ?? 1);
        emitGameLog(`Profile loaded successfully. Cleared islands: ${loadedIslands.length > 0 ? loadedIslands.join(', ') : 'None'}.`, "system");
      } else {
        // Create new profile row in Supabase
        emitGameLog("Creating new player profile on Supabase...", "system");
        const newProfile = {
          wallet: wallet,
          cupcakes: 5,
          cucumbers: 5,
          tickets: 1,
          clearedIslands: [],
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile]);

        if (insertError) {
          console.error("Error creating profile in Supabase:", insertError);
          emitGameLog(`Database error: ${insertError.message}. Using offline fallback.`, "system");
          loadOfflineFallback();
        } else {
          setCupcakesState(5);
          setCucumbersState(5);
          setTicketsState(1);
          setClearedIslands([]);
          persistRewards(5, 5, 1);
          emitGameLog("New profile created and initialized.", "system");
        }
      }
    } catch (err: any) {
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
      const payload: any = {};
      if (updatedFields.cupcakes !== undefined) payload.cupcakes = updatedFields.cupcakes;
      if (updatedFields.cucumbers !== undefined) payload.cucumbers = updatedFields.cucumbers;
      if (updatedFields.tickets !== undefined) payload.tickets = updatedFields.tickets;
      if (updatedFields.clearedIslands !== undefined) {
        payload.clearedIslands = updatedFields.clearedIslands;
      }

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('wallet', wallet);

      if (error) {
        console.error("Error updating profile in Supabase:", error);
        emitGameLog(`Failed to sync with Supabase: ${error.message}`, "system");
      }
    } catch (err) {
      console.error("Supabase profile update exception:", err);
    }
  };

  // Wrappers for currency updates to ensure persistence
  const setCupcakes = (val: number | ((prev: number) => number)) => {
    setCupcakesState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      persistRewards(next, cucumbers, tickets);
      if (userWallet) {
        saveProfile(userWallet, { cupcakes: next });
      }
      return next;
    });
  };

  const setCucumbers = (val: number | ((prev: number) => number)) => {
    setCucumbersState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      persistRewards(cupcakes, next, tickets);
      if (userWallet) {
        saveProfile(userWallet, { cucumbers: next });
      }
      return next;
    });
  };

  const setTickets = (val: number | ((prev: number) => number)) => {
    setTicketsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      persistRewards(cupcakes, cucumbers, next);
      if (userWallet) {
        saveProfile(userWallet, { tickets: next });
      }
      return next;
    });
  };

  // Progression Tracking Clear Island
  const clearIsland = async (islandName: string) => {
    setClearedIslands((prev) => {
      if (prev.includes(islandName)) return prev;
      const next = [...prev, islandName];
      if (userWallet) {
        saveProfile(userWallet, { clearedIslands: next });
      }
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
