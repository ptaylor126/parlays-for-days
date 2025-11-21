/**
 * Comprehensive team logo mapping with variations
 * Maps various team name formats to their logo URLs
 */
const TEAM_LOGO_MAP: Record<string, string> = {
  // Premier League
  "Manchester City": "https://media.api-sports.io/football/teams/50.png",
  "Man City": "https://media.api-sports.io/football/teams/50.png",
  "Manchester United": "https://media.api-sports.io/football/teams/33.png",
  "Man United": "https://media.api-sports.io/football/teams/33.png",
  "Man Utd": "https://media.api-sports.io/football/teams/33.png",
  "Man Utd.": "https://media.api-sports.io/football/teams/33.png",
  "Liverpool": "https://media.api-sports.io/football/teams/40.png",
  "Chelsea": "https://media.api-sports.io/football/teams/49.png",
  "Arsenal": "https://media.api-sports.io/football/teams/42.png",
  "Tottenham": "https://crests.football-data.org/73.svg",
  "Tottenham Hotspur": "https://crests.football-data.org/73.svg",
  "Spurs": "https://crests.football-data.org/73.svg",
  "Newcastle": "https://media.api-sports.io/football/teams/34.png",
  "Newcastle United": "https://media.api-sports.io/football/teams/34.png",
  "Brighton": "https://media.api-sports.io/football/teams/51.png",
  "Brighton & Hove Albion": "https://media.api-sports.io/football/teams/51.png",
  "Brighton and Hove Albion": "https://media.api-sports.io/football/teams/51.png",
  "Aston Villa": "https://media.api-sports.io/football/teams/66.png",
  "West Ham": "https://media.api-sports.io/football/teams/48.png",
  "West Ham United": "https://media.api-sports.io/football/teams/48.png",
  "Everton": "https://media.api-sports.io/football/teams/45.png",
  "Nottingham Forest": "https://media.api-sports.io/football/teams/65.png",
  "Nott'ham Forest": "https://media.api-sports.io/football/teams/65.png",
  "Crystal Palace": "https://media.api-sports.io/football/teams/52.png",
  "Fulham": "https://media.api-sports.io/football/teams/36.png",
  "Brentford": "https://media.api-sports.io/football/teams/55.png",
  "Wolves": "https://media.api-sports.io/football/teams/39.png",
  "Wolverhampton Wanderers": "https://media.api-sports.io/football/teams/39.png",
  "Wolverhampton": "https://media.api-sports.io/football/teams/39.png",
  "Bournemouth": "https://media.api-sports.io/football/teams/35.png",
  "AFC Bournemouth": "https://media.api-sports.io/football/teams/35.png",
  "Burnley": "https://media.api-sports.io/football/teams/44.png",
  "Luton Town": "https://media.api-sports.io/football/teams/1359.png",
  "Luton": "https://media.api-sports.io/football/teams/1359.png",
  "Sheffield United": "https://media.api-sports.io/football/teams/62.png",
  "Sheff Utd": "https://media.api-sports.io/football/teams/62.png",
  "Sunderland": "https://crests.football-data.org/71.png",
  "Sunderland AFC": "https://crests.football-data.org/71.png",
  "Leeds": "https://media.api-sports.io/football/teams/63.png",
  "Leeds United": "https://media.api-sports.io/football/teams/63.png",
  "Leeds Utd": "https://media.api-sports.io/football/teams/63.png",

  // Bundesliga
  "Bayern Munich": "https://media.api-sports.io/football/teams/157.png",
  "FC Bayern Munich": "https://media.api-sports.io/football/teams/157.png",
  "Bayern": "https://media.api-sports.io/football/teams/157.png",
  "Borussia Dortmund": "https://media.api-sports.io/football/teams/165.png",
  "BVB": "https://media.api-sports.io/football/teams/165.png",
  "Dortmund": "https://media.api-sports.io/football/teams/165.png",
  "RB Leipzig": "https://media.api-sports.io/football/teams/173.png",
  "Leipzig": "https://media.api-sports.io/football/teams/173.png",
  "Bayer Leverkusen": "https://media.api-sports.io/football/teams/168.png",
  "Leverkusen": "https://media.api-sports.io/football/teams/168.png",
  "Union Berlin": "https://media.api-sports.io/football/teams/182.png",
  "Eintracht Frankfurt": "https://media.api-sports.io/football/teams/169.png",
  "Frankfurt": "https://media.api-sports.io/football/teams/169.png",
  "Wolfsburg": "https://media.api-sports.io/football/teams/161.png",
  "VfL Wolfsburg": "https://media.api-sports.io/football/teams/161.png",
  "Freiburg": "https://media.api-sports.io/football/teams/160.png",
  "SC Freiburg": "https://media.api-sports.io/football/teams/160.png",
  "Borussia M'gladbach": "https://media.api-sports.io/football/teams/163.png",
  "Borussia Monchengladbach": "https://media.api-sports.io/football/teams/163.png",
  "M'gladbach": "https://media.api-sports.io/football/teams/163.png",
  "Stuttgart": "https://media.api-sports.io/football/teams/172.png",
  "VfB Stuttgart": "https://media.api-sports.io/football/teams/172.png",
  "Borussia Monchengladbach": "https://media.api-sports.io/football/teams/163.png",
  "Mainz": "https://media.api-sports.io/football/teams/164.png",
  "Mainz 05": "https://media.api-sports.io/football/teams/164.png",
  "Hoffenheim": "https://media.api-sports.io/football/teams/167.png",
  "TSG Hoffenheim": "https://media.api-sports.io/football/teams/167.png",
  "Augsburg": "https://media.api-sports.io/football/teams/170.png",
  "FC Augsburg": "https://media.api-sports.io/football/teams/170.png",
  "Bochum": "https://media.api-sports.io/football/teams/176.png",
  "VfL Bochum": "https://media.api-sports.io/football/teams/176.png",
  "Hertha Berlin": "https://media.api-sports.io/football/teams/159.png",
  "Hertha BSC": "https://media.api-sports.io/football/teams/159.png",
  "Koln": "https://media.api-sports.io/football/teams/162.png",
  "FC Koln": "https://media.api-sports.io/football/teams/162.png",
  "Cologne": "https://media.api-sports.io/football/teams/162.png",

  // La Liga
  "Real Madrid": "https://media.api-sports.io/football/teams/541.png",
  "Real Madrid CF": "https://media.api-sports.io/football/teams/541.png",
  "Barcelona": "https://media.api-sports.io/football/teams/529.png",
  "FC Barcelona": "https://media.api-sports.io/football/teams/529.png",
  "Atletico Madrid": "https://media.api-sports.io/football/teams/530.png",
  "Atlético Madrid": "https://media.api-sports.io/football/teams/530.png",
  "Atletico": "https://media.api-sports.io/football/teams/530.png",
  "Sevilla": "https://media.api-sports.io/football/teams/536.png",
  "Sevilla FC": "https://media.api-sports.io/football/teams/536.png",
  "Real Sociedad": "https://media.api-sports.io/football/teams/548.png",
  "Real Sociedad de Futbol": "https://media.api-sports.io/football/teams/548.png",
  "Valencia": "https://media.api-sports.io/football/teams/532.png",
  "Valencia CF": "https://media.api-sports.io/football/teams/532.png",
  "Villareal": "https://media.api-sports.io/football/teams/533.png",
  "Villarreal": "https://media.api-sports.io/football/teams/533.png",
  "Villarreal CF": "https://media.api-sports.io/football/teams/533.png",
  "Athletic Bilbao": "https://media.api-sports.io/football/teams/531.png",
  "Athletic Club": "https://media.api-sports.io/football/teams/531.png",
  "Real Betis": "https://media.api-sports.io/football/teams/543.png",
  "Betis": "https://media.api-sports.io/football/teams/543.png",
  "Getafe": "https://media.api-sports.io/football/teams/546.png",
  "Getafe CF": "https://media.api-sports.io/football/teams/546.png",
  "Osasuna": "https://media.api-sports.io/football/teams/727.png",
  "Celta Vigo": "https://media.api-sports.io/football/teams/538.png",
  "Celta": "https://media.api-sports.io/football/teams/538.png",
  "Girona": "https://media.api-sports.io/football/teams/547.png",
  "Girona FC": "https://media.api-sports.io/football/teams/547.png",
  "Alaves": "https://media.api-sports.io/football/teams/542.png",
  "Deportivo Alaves": "https://media.api-sports.io/football/teams/542.png",
  "Las Palmas": "https://media.api-sports.io/football/teams/534.png",
  "UD Las Palmas": "https://media.api-sports.io/football/teams/534.png",
  "Rayo Vallecano": "https://media.api-sports.io/football/teams/728.png",
  "Rayo": "https://media.api-sports.io/football/teams/728.png",

  // Serie A
  "Inter Milan": "https://media.api-sports.io/football/teams/108.png",
  "Inter": "https://media.api-sports.io/football/teams/108.png",
  "AC Milan": "https://media.api-sports.io/football/teams/98.png",
  "Milan": "https://media.api-sports.io/football/teams/98.png",
  "Juventus": "https://media.api-sports.io/football/teams/109.png",
  "Juventus FC": "https://media.api-sports.io/football/teams/109.png",
  "Napoli": "https://media.api-sports.io/football/teams/113.png",
  "SSC Napoli": "https://media.api-sports.io/football/teams/113.png",
  "Roma": "https://media.api-sports.io/football/teams/100.png",
  "AS Roma": "https://media.api-sports.io/football/teams/100.png",
  "Lazio": "https://media.api-sports.io/football/teams/99.png",
  "SS Lazio": "https://media.api-sports.io/football/teams/99.png",
  "Atalanta": "https://media.api-sports.io/football/teams/102.png",
  "Atalanta BC": "https://media.api-sports.io/football/teams/102.png",
  "Fiorentina": "https://media.api-sports.io/football/teams/99.png",
  "ACF Fiorentina": "https://media.api-sports.io/football/teams/99.png",
  "Bologna": "https://media.api-sports.io/football/teams/103.png",
  "Bologna FC": "https://media.api-sports.io/football/teams/103.png",
  "Torino": "https://media.api-sports.io/football/teams/107.png",
  "Torino FC": "https://media.api-sports.io/football/teams/107.png",
  "Udinese": "https://media.api-sports.io/football/teams/104.png",
  "Udinese Calcio": "https://media.api-sports.io/football/teams/104.png",
  "Sassuolo": "https://media.api-sports.io/football/teams/471.png",
  "US Sassuolo": "https://media.api-sports.io/football/teams/471.png",
  "Genoa": "https://media.api-sports.io/football/teams/107.png",
  "Genoa CFC": "https://media.api-sports.io/football/teams/107.png",

  // Ligue 1
  "PSG": "https://media.api-sports.io/football/teams/85.png",
  "Paris Saint-Germain": "https://media.api-sports.io/football/teams/85.png",
  "Paris SG": "https://media.api-sports.io/football/teams/85.png",
  "Marseille": "https://media.api-sports.io/football/teams/81.png",
  "Olympique Marseille": "https://media.api-sports.io/football/teams/81.png",
  "OM": "https://media.api-sports.io/football/teams/81.png",
  "Monaco": "https://media.api-sports.io/football/teams/91.png",
  "AS Monaco": "https://media.api-sports.io/football/teams/91.png",
  "Lyon": "https://media.api-sports.io/football/teams/80.png",
  "Olympique Lyon": "https://media.api-sports.io/football/teams/80.png",
  "Olympique Lyonnais": "https://media.api-sports.io/football/teams/80.png",
  "Lille": "https://media.api-sports.io/football/teams/79.png",
  "Lille OSC": "https://media.api-sports.io/football/teams/79.png",
  "Rennes": "https://media.api-sports.io/football/teams/94.png",
  "Stade Rennes": "https://media.api-sports.io/football/teams/94.png",
  "Nice": "https://media.api-sports.io/football/teams/84.png",
  "OGC Nice": "https://media.api-sports.io/football/teams/84.png",
  "Lens": "https://media.api-sports.io/football/teams/116.png",
  "RC Lens": "https://media.api-sports.io/football/teams/116.png",
  "Brest": "https://media.api-sports.io/football/teams/106.png",
  "Stade Brestois": "https://media.api-sports.io/football/teams/106.png",
  "Montpellier": "https://media.api-sports.io/football/teams/82.png",
  "Montpellier HSC": "https://media.api-sports.io/football/teams/82.png",
  "Reims": "https://media.api-sports.io/football/teams/93.png",
  "Stade Reims": "https://media.api-sports.io/football/teams/93.png",
  "Toulouse": "https://media.api-sports.io/football/teams/96.png",
  "FC Toulouse": "https://media.api-sports.io/football/teams/96.png",
  
  // Champions League (major European teams)
  "Manchester City": "https://media.api-sports.io/football/teams/50.png",
  "Man City": "https://media.api-sports.io/football/teams/50.png",
  "Real Madrid": "https://media.api-sports.io/football/teams/541.png",
  "Bayern Munich": "https://media.api-sports.io/football/teams/157.png",
  "Bayern": "https://media.api-sports.io/football/teams/157.png",
  "Barcelona": "https://media.api-sports.io/football/teams/529.png",
  "Borussia Dortmund": "https://media.api-sports.io/football/teams/165.png",
  "Dortmund": "https://media.api-sports.io/football/teams/165.png",
  "Atletico Madrid": "https://media.api-sports.io/football/teams/530.png",
  "Atlético Madrid": "https://media.api-sports.io/football/teams/530.png",
  "Atletico": "https://media.api-sports.io/football/teams/530.png",
  "Inter Milan": "https://media.api-sports.io/football/teams/108.png",
  "Inter": "https://media.api-sports.io/football/teams/108.png",
  "AC Milan": "https://media.api-sports.io/football/teams/98.png",
  "Milan": "https://media.api-sports.io/football/teams/98.png",
  "Juventus": "https://media.api-sports.io/football/teams/109.png",
  "Napoli": "https://media.api-sports.io/football/teams/113.png",
  "Paris Saint-Germain": "https://media.api-sports.io/football/teams/85.png",
  "PSG": "https://media.api-sports.io/football/teams/85.png",
  "Arsenal": "https://media.api-sports.io/football/teams/42.png",
  "Chelsea": "https://media.api-sports.io/football/teams/49.png",
  "Liverpool": "https://media.api-sports.io/football/teams/40.png",
  "Manchester United": "https://media.api-sports.io/football/teams/33.png",
  "Man United": "https://media.api-sports.io/football/teams/33.png",
  "Tottenham": "https://crests.football-data.org/73.svg",
  "Tottenham Hotspur": "https://crests.football-data.org/73.svg",
  "Sevilla": "https://media.api-sports.io/football/teams/536.png",
  "RB Leipzig": "https://media.api-sports.io/football/teams/173.png",
  "Leipzig": "https://media.api-sports.io/football/teams/173.png",
};

/**
 * Normalize team name for matching
 * Removes common suffixes and normalizes case
 */
function normalizeTeamName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/fc\s*/gi, '')
    .replace(/\s+cf\s*/gi, '')
    .replace(/\s+&/gi, ' and ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get team logo URL by matching team name
 * Handles variations and common abbreviations
 */
export function getTeamLogo(teamName: string): string | undefined {
  // First try exact match
  if (TEAM_LOGO_MAP[teamName]) {
    return TEAM_LOGO_MAP[teamName];
  }

  // Try normalized match
  const normalized = normalizeTeamName(teamName);
  for (const [key, value] of Object.entries(TEAM_LOGO_MAP)) {
    if (normalizeTeamName(key) === normalized) {
      return value;
    }
  }

  // Try partial match (e.g., "Tottenham" matches "Tottenham Hotspur")
  const normalizedLower = normalized.toLowerCase();
  for (const [key, value] of Object.entries(TEAM_LOGO_MAP)) {
    const keyNormalized = normalizeTeamName(key);
    if (
      keyNormalized.includes(normalizedLower) ||
      normalizedLower.includes(keyNormalized)
    ) {
      return value;
    }
  }

  return undefined;
}

