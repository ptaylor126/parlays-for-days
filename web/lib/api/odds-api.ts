export interface Match {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

export async function getUpcomingSoccerMatches(): Promise<Match[]> {
  // Use Next.js API route to avoid CORS issues
  const response = await fetch('/api/matches', {
    cache: 'no-store', // Always fetch fresh data on the client
  });

  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }

  const data = await response.json();

  // Transform API data to our Match format
  const allMatches: Match[] = [];

  data.forEach((game: any) => {
    // Find the first bookmaker with valid odds
    const bookmaker = game.bookmakers?.[0];
    const market = bookmaker?.markets?.[0];
    const outcomes = market?.outcomes || [];

    // Find outcomes for home, draw, and away
    const homeOutcome = outcomes.find((o: any) => o.name === game.home_team);
    const drawOutcome = outcomes.find((o: any) => o.name === 'Draw');
    const awayOutcome = outcomes.find((o: any) => o.name === game.away_team);

    // Try to determine league from sport key if available, otherwise use a default
    const sportKey = game.sport_key || 'soccer_epl';
    const league = getLeagueName(sportKey);

    const match: Match = {
      id: game.id,
      league,
      homeTeam: game.home_team,
      awayTeam: game.away_team,
      startTime: game.commence_time,
      odds: {
        home: homeOutcome?.price || 0,
        draw: drawOutcome?.price || 0,
        away: awayOutcome?.price || 0,
      },
    };

    // Only add matches with valid odds
    if (match.odds.home !== 0 || match.odds.away !== 0) {
      allMatches.push(match);
    }
  });

  // Sort matches by start time
  allMatches.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return allMatches;
}

function getLeagueName(sportKey: string): string {
  const leagueMap: Record<string, string> = {
    'soccer_epl': 'Premier League',
    'soccer_germany_bundesliga': 'Bundesliga',
    'soccer_spain_la_liga': 'La Liga',
    'soccer_italy_serie_a': 'Serie A',
    'soccer_france_ligue_one': 'Ligue 1',
    'soccer_uefa_champs_league': 'Champions League',
  };
  return leagueMap[sportKey] || sportKey;
}

