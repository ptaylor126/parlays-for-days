'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Match } from '@/lib/api/odds-api';

interface MatchContextType {
  matches: Match[];
  setMatches: (matches: Match[]) => void;
  getMatchById: (id: string) => Match | undefined;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);

  const getMatchById = (id: string) => {
    return matches.find(match => match.id === id);
  };

  return (
    <MatchContext.Provider value={{ matches, setMatches, getMatchById }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatches() {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatches must be used within MatchProvider');
  }
  return context;
}

