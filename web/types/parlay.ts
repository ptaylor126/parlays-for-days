export interface ParlayLeg {
  prediction: string;
  match: string;
  odds: string;
}

export interface Parlay {
  type: 'SAFEST PARLAY' | 'VALUE UPSET PARLAY' | 'BTTS SPECIAL' | 'CONSERVATIVE WIN';
  totalOdds: string;
  confidence: string;
  legs: ParlayLeg[];
  combinedOdds: string;
  whyThisWorks: string;
}

export interface UpsetAlert {
  prediction: string;
  odds: string;
  reasoning: string;
}

export interface TopIndividualBet {
  prediction: string;
  details: string;
  odds: string;
  reasoning: string;
}

export interface MatchPrediction {
  type: string;
  odds: string;
  confidence: 'High' | 'Medium-High' | 'Medium' | 'Low';
  reasoning: string;
}

export interface KeyStats {
  homeForm: string;
  awayForm: string;
  homePosition: number;
  awayPosition: number;
  h2h: string;
  injuries: string;
}

export interface MatchAnalysis {
  match: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  predictions: MatchPrediction[];
  keyStats: KeyStats;
}

export interface ParlayAnalysis {
  research_summary: string;
  matchAnalysis: MatchAnalysis[];
  parlays: Parlay[];
  upsetAlerts: UpsetAlert[];
  topIndividualBets: TopIndividualBet[];
}

