"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Bet = {
  id: string;
  label: string; // e.g., "Man United to Win"
  odds: string; // e.g., "+100"
};

export type SavedBetslip = {
  id: string;
  name: string; // e.g., "3-Leg Parlay - Nov 4, 3:24 PM"
  bets: Bet[];
  combinedOdds: string; // e.g., "4.85x"
  savedAt: Date;
};

type BetslipContextType = {
  activeBets: Bet[];
  savedBetslips: SavedBetslip[];
  addBet: (bet: Bet) => boolean; // Returns true if added, false if duplicate
  addBets: (bets: Bet[]) => number; // Returns count of bets added (all non-duplicates)
  removeBet: (betId: string) => void;
  clearActive: () => void;
  saveBetslip: () => void;
  deleteBetslip: (id: string) => void;
  calculateCombinedOdds: (bets: Bet[]) => string;
};

const BetslipContext = createContext<BetslipContextType | undefined>(undefined);

export function BetslipProvider({ children }: { children: ReactNode }) {
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [savedBetslips, setSavedBetslips] = useState<SavedBetslip[]>([]);

  const addBet = (bet: Bet): boolean => {
    let wasAdded = false;
    setActiveBets((prev) => {
      // Check if bet already exists by label and odds (prevent duplicates)
      if (prev.some((b) => b.label === bet.label && b.odds === bet.odds)) {
        wasAdded = false;
        return prev;
      }
      wasAdded = true;
      return [...prev, bet];
    });
    return wasAdded;
  };

  const addBets = (bets: Bet[]): number => {
    let addedCount = 0;
    setActiveBets((prev) => {
      const newBets: Bet[] = [];
      bets.forEach((bet) => {
        // Check if bet already exists by label and odds (prevent duplicates)
        if (!prev.some((b) => b.label === bet.label && b.odds === bet.odds)) {
          newBets.push(bet);
          addedCount++;
        }
      });
      return [...prev, ...newBets];
    });
    return addedCount;
  };

  const removeBet = (betId: string) => {
    setActiveBets((prev) => prev.filter((b) => b.id !== betId));
  };

  const clearActive = () => {
    setActiveBets([]);
  };

  const calculateCombinedOdds = (bets: Bet[]): string => {
    if (bets.length === 0) return "0x";
    
    // Convert American odds to decimal, multiply, then convert back to American
    // For simplicity, we'll use a basic calculation
    // In a real app, you'd need proper odds conversion
    const decimalOdds = bets.map((bet) => {
      const odds = parseInt(bet.odds);
      if (odds > 0) {
        return (odds / 100) + 1;
      } else {
        return (100 / Math.abs(odds)) + 1;
      }
    });
    
    const combined = decimalOdds.reduce((acc, curr) => acc * curr, 1);
    
    // Convert back to American format (simplified)
    if (combined <= 2) {
      return `${((combined - 1) * 100).toFixed(0)}x`;
    } else {
      return `${((combined - 1) * 100).toFixed(2)}x`;
    }
  };

  const saveBetslip = () => {
    if (activeBets.length === 0) return;

    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[now.getMonth()];
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${displayHours}:${displayMinutes} ${ampm}`;

    const betCount = activeBets.length;
    const name = `${betCount}-Leg Parlay - ${month} ${day}, ${timeStr}`;
    const combinedOdds = calculateCombinedOdds(activeBets);

    const newBetslip: SavedBetslip = {
      id: `betslip-${Date.now()}`,
      name,
      bets: [...activeBets],
      combinedOdds,
      savedAt: now,
    };

    setSavedBetslips((prev) => [newBetslip, ...prev]);
    setActiveBets([]);
  };

  const deleteBetslip = (id: string) => {
    setSavedBetslips((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <BetslipContext.Provider
      value={{
        activeBets,
        savedBetslips,
        addBet,
        addBets,
        removeBet,
        clearActive,
        saveBetslip,
        deleteBetslip,
        calculateCombinedOdds,
      }}
    >
      {children}
    </BetslipContext.Provider>
  );
}

export function useBetslip() {
  const context = useContext(BetslipContext);
  if (context === undefined) {
    throw new Error("useBetslip must be used within a BetslipProvider");
  }
  return context;
}

