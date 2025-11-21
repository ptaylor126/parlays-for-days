/**
 * League logo mapping
 * Maps league names to their logo URLs
 */
export function getLeagueLogo(leagueName: string): string {
  const leagueLogoMap: Record<string, string> = {
    'Premier League': 'https://media.api-sports.io/football/leagues/39.png',
    'Bundesliga': 'https://media.api-sports.io/football/leagues/78.png',
    'La Liga': 'https://media.api-sports.io/football/leagues/140.png',
    'Serie A': 'https://media.api-sports.io/football/leagues/135.png',
    'Ligue 1': 'https://media.api-sports.io/football/leagues/61.png',
    'Champions League': 'https://media.api-sports.io/football/leagues/2.png',
  };

  return leagueLogoMap[leagueName] || 'https://media.api-sports.io/football/leagues/39.png';
}

