const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;

const BASE_URL = 'https://v3.football.api-sports.io';

console.log('🔑 Football API Key loaded:', !!API_KEY);

export interface TeamStats {
  form: string;
  goals: { for: number; against: number };
  position: number;
  points: number;
}

export interface Player {
  name: string;
  goals: number;
}

export interface Injury {
  name: string;
  reason: string;
}

export interface Referee {
  name: string;
  cardsPerGame?: number;
  penalties?: number;
  strictRating?: number;
}

// Mock data generator for realistic stats
function generateMockStats(teamName: string): TeamStats {
  const forms = ['WWWDW', 'WWDLW', 'WDLWW', 'DWWLW', 'LWWDW', 'WLDWW'];
  const randomForm = forms[Math.floor(Math.random() * forms.length)];
  
  return {
    form: randomForm,
    goals: {
      for: Math.floor(Math.random() * 20) + 15, // 15-35 goals
      against: Math.floor(Math.random() * 15) + 5 // 5-20 goals
    },
    position: Math.floor(Math.random() * 10) + 1, // 1-10 position
    points: Math.floor(Math.random() * 20) + 30 // 30-50 points
  };
}

function generateMockScorers(teamName: string): Player[] {
  const firstNames = ['Marcus', 'Mohamed', 'Erling', 'Kevin', 'Bruno', 'Harry', 'Bukayo', 'Phil'];
  const lastNames = ['Silva', 'Rashford', 'Haaland', 'De Bruyne', 'Fernandes', 'Kane', 'Saka', 'Foden'];
  
  return Array(3).fill(0).map((_, i) => ({
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    goals: Math.floor(Math.random() * 8) + 3 - i * 2 // Decreasing goals: 10, 7, 5
  }));
}

function generateMockInjuries(teamName: string): Injury[] {
  const injuryReasons = ['knee injury', 'suspended', 'hamstring', 'ankle', 'ill'];
  const firstNames = ['John', 'James', 'Michael', 'David', 'Robert'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
  
  // Random 0-2 injuries per team
  const count = Math.floor(Math.random() * 3);
  
  return Array(count).fill(0).map((_, i) => ({
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    reason: injuryReasons[Math.floor(Math.random() * injuryReasons.length)]
  }));
}

export async function getTeamStats(teamName: string, league: string): Promise<TeamStats | null> {
  console.log('📊 Getting stats for:', teamName);
  
  // Return mock data immediately
  return generateMockStats(teamName);
}

export async function getTopScorers(teamName: string, league: string): Promise<Player[]> {
  console.log('⚽ Getting scorers for:', teamName);
  
  // Return mock data immediately
  return generateMockScorers(teamName);
}

export async function getInjuries(teamName: string, league: string): Promise<Injury[]> {
  console.log('🏥 Getting injuries for:', teamName);
  
  // Return mock data immediately
  return generateMockInjuries(teamName);
}

export async function getHeadToHead(homeTeam: string, awayTeam: string, league: string): Promise<string | null> {
  console.log('⚔️ Getting H2H for:', homeTeam, 'vs', awayTeam);
  
  // Return mock data
  const homeWins = Math.floor(Math.random() * 3);
  const awayWins = Math.floor(Math.random() * 3);
  const draws = 5 - homeWins - awayWins;
  
  return `Last 5 meetings: ${homeTeam} won ${homeWins}, ${awayTeam} won ${awayWins}, ${draws} draw${draws !== 1 ? 's' : ''}`;
}

export async function getRefereeInfo(homeTeam: string, awayTeam: string, league: string, matchDate: string): Promise<Referee | null> {
  console.log('👨‍⚖️ Getting referee for:', homeTeam, 'vs', awayTeam);
  
  // Return mock referee data
  const refereeNames = ['Michael Oliver', 'Anthony Taylor', 'Paul Tierney', 'Stuart Attwell', 'David Coote'];
  const randomReferee = refereeNames[Math.floor(Math.random() * refereeNames.length)];
  
  return {
    name: randomReferee,
    cardsPerGame: Math.floor(Math.random() * 3) + 3, // 3-6 cards
    penalties: Math.floor(Math.random() * 3) + 1, // 1-4 penalties
    strictRating: Math.floor(Math.random() * 3) + 3, // 3-5 rating
  };
}
