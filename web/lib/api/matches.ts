import { Match } from './odds-api';

/**
 * Fetch a single match by ID
 */
export async function getMatchById(matchId: string): Promise<Match | null> {
  try {
    const response = await fetch(`/api/matches/${matchId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Transform to Match format
    return {
      id: data.id,
      league: data.league,
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      startTime: data.startTime,
      odds: data.odds,
    };
  } catch (error) {
    console.error('Error fetching match:', error);
    return null;
  }
}

/**
 * Fetch multiple matches by IDs
 */
export async function getMatchesByIds(matchIds: string[]): Promise<Match[]> {
  const matches: Match[] = [];
  
  // Fetch all matches from API once
  try {
    const response = await fetch('/api/matches', {
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const allMatches = await response.json();

    // Transform and filter by IDs
    matchIds.forEach((matchId) => {
      const game = allMatches.find((g: any) => g.id === matchId);
      if (game) {
        const bookmaker = game.bookmakers?.[0];
        const market = bookmaker?.markets?.[0];
        const outcomes = market?.outcomes || [];

        const homeOutcome = outcomes.find((o: any) => o.name === game.home_team);
        const drawOutcome = outcomes.find((o: any) => o.name === 'Draw');
        const awayOutcome = outcomes.find((o: any) => o.name === game.away_team);

        const sportKey = game.sport_key || 'soccer_epl';
        const league = getLeagueName(sportKey);

        matches.push({
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
        });
      }
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
  }

  return matches;
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

