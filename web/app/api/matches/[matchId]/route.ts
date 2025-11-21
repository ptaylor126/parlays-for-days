import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_ODDS_API_KEY;
const BASE_URL = 'https://api.the-odds-api.com/v4';

export async function GET(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  const { matchId } = params;
  // Only search Premier League
  const PREMIER_LEAGUE_KEY = 'soccer_epl';

  try {
    const response = await fetch(
      `${BASE_URL}/sports/${PREMIER_LEAGUE_KEY}/odds?apiKey=${API_KEY}&regions=us&markets=h2h&oddsFormat=american`,
      { next: { revalidate: 60 } }
    );

    if (response.ok) {
      const data = await response.json();
      const match = data.find((game: any) => game.id === matchId);

      if (match) {
        // Find the first bookmaker with valid odds
        const bookmaker = match.bookmakers?.[0];
        const market = bookmaker?.markets?.[0];
        const outcomes = market?.outcomes || [];

        const homeOutcome = outcomes.find((o: any) => o.name === match.home_team);
        const drawOutcome = outcomes.find((o: any) => o.name === 'Draw');
        const awayOutcome = outcomes.find((o: any) => o.name === match.away_team);

        return NextResponse.json({
          id: match.id,
          league: getLeagueName(PREMIER_LEAGUE_KEY),
          homeTeam: match.home_team,
          awayTeam: match.away_team,
          startTime: match.commence_time,
          odds: {
            home: homeOutcome?.price || 0,
            draw: drawOutcome?.price || 0,
            away: awayOutcome?.price || 0,
          },
        });
      }
    }
  } catch (error) {
    console.error(`Error fetching ${PREMIER_LEAGUE_KEY}:`, error);
  }

  return NextResponse.json(
    { error: 'Match not found' },
    { status: 404 }
  );
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

