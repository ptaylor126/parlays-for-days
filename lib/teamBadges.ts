/**
 * Map common team names to their API-Football team IDs
 * Used to generate badge URLs from team names
 */
const teamIdMap: Record<string, number> = {
  // Premier League
  'Manchester United': 33,
  'Manchester City': 50,
  'Man City': 50,
  'Man United': 33,
  'Man Utd': 33,
  'Man Utd.': 33,
  'Liverpool': 40,
  'Chelsea': 49,
  'Arsenal': 42,
  'Tottenham': 47,
  'Tottenham Hotspur': 47,
  'Spurs': 47,
  'Newcastle': 34,
  'Newcastle United': 34,
  'Brighton': 51,
  'Brighton & Hove Albion': 51,
  'Brighton and Hove Albion': 51,
  'Aston Villa': 66,
  'West Ham': 48,
  'West Ham United': 48,
  'Everton': 45,
  'Nottingham Forest': 65,
  'Nott\'ham Forest': 65,
  'Crystal Palace': 52,
  'Fulham': 36,
  'Brentford': 55,
  'Wolves': 39,
  'Wolverhampton Wanderers': 39,
  'Wolverhampton': 39,
  'Bournemouth': 35,
  'AFC Bournemouth': 35,
  'Burnley': 44,
  'Luton Town': 1359,
  'Luton': 1359,
  'Sheffield United': 62,
  'Sheff Utd': 62,
  // Sunderland uses local badge, not API badge
  // 'Sunderland': 71,
  // 'Sunderland AFC': 71,
  'Leeds': 63,
  'Leeds United': 63,
  'Leeds Utd': 63,

  // Bundesliga
  'Bayern Munich': 157,
  'FC Bayern Munich': 157,
  'Bayern': 157,
  'Borussia Dortmund': 165,
  'BVB': 165,
  'Dortmund': 165,
  'RB Leipzig': 173,
  'Leipzig': 173,
  'Bayer Leverkusen': 168,
  'Leverkusen': 168,
  'Union Berlin': 182,
  'Eintracht Frankfurt': 169,
  'Frankfurt': 169,
  'Wolfsburg': 161,
  'VfL Wolfsburg': 161,
  'Freiburg': 160,
  'SC Freiburg': 160,
  'Borussia M\'gladbach': 163,
  'Borussia Monchengladbach': 163,
  'M\'gladbach': 163,
  'Stuttgart': 172,
  'VfB Stuttgart': 172,
  'Mainz': 164,
  'Mainz 05': 164,
  'Hoffenheim': 167,
  'TSG Hoffenheim': 167,
  'Augsburg': 170,
  'FC Augsburg': 170,
  'Bochum': 176,
  'VfL Bochum': 176,
  'Hertha Berlin': 159,
  'Hertha BSC': 159,
  'Koln': 162,
  'FC Koln': 162,
  'Cologne': 162,

  // La Liga
  'Real Madrid': 541,
  'Real Madrid CF': 541,
  'Barcelona': 529,
  'FC Barcelona': 529,
  'Atletico Madrid': 530,
  'Atlético Madrid': 530,
  'Atletico': 530,
  'Sevilla': 536,
  'Sevilla FC': 536,
  'Real Sociedad': 548,
  'Real Sociedad de Futbol': 548,
  'Valencia': 532,
  'Valencia CF': 532,
  'Villareal': 533,
  'Villarreal': 533,
  'Villarreal CF': 533,
  'Athletic Bilbao': 531,
  'Athletic Club': 531,
  'Real Betis': 543,
  'Betis': 543,
  'Getafe': 546,
  'Getafe CF': 546,
  'Osasuna': 727,
  'Celta Vigo': 538,
  'Celta': 538,
  'Girona': 547,
  'Girona FC': 547,
  'Alaves': 542,
  'Deportivo Alaves': 542,
  'Las Palmas': 534,
  'UD Las Palmas': 534,
  'Rayo Vallecano': 728,
  'Rayo': 728,

  // Serie A
  'Inter Milan': 108,
  'Inter': 108,
  'AC Milan': 98,
  'Milan': 98,
  'Juventus': 109,
  'Juventus FC': 109,
  'Napoli': 113,
  'SSC Napoli': 113,
  'Roma': 100,
  'AS Roma': 100,
  'Lazio': 99,
  'SS Lazio': 99,
  'Atalanta': 102,
  'Atalanta BC': 102,
  'Fiorentina': 99,
  'ACF Fiorentina': 99,
  'Bologna': 103,
  'Bologna FC': 103,
  'Torino': 107,
  'Torino FC': 107,
  'Udinese': 104,
  'Udinese Calcio': 104,
  'Sassuolo': 471,
  'US Sassuolo': 471,
  'Genoa': 107,
  'Genoa CFC': 107,

  // Ligue 1
  'PSG': 85,
  'Paris Saint-Germain': 85,
  'Paris SG': 85,
  'Marseille': 81,
  'Olympique Marseille': 81,
  'OM': 81,
  'Monaco': 91,
  'AS Monaco': 91,
  'Lyon': 80,
  'Olympique Lyon': 80,
  'Olympique Lyonnais': 80,
  'Lille': 79,
  'Lille OSC': 79,
  'Rennes': 94,
  'Stade Rennes': 94,
  'Nice': 84,
  'OGC Nice': 84,
  'Lens': 116,
  'RC Lens': 116,
  'Brest': 106,
  'Stade Brestois': 106,
  'Montpellier': 82,
  'Montpellier HSC': 82,
  'Reims': 93,
  'Stade Reims': 93,
  'Toulouse': 96,
  'FC Toulouse': 96,

  // Belgian Pro League
  'Club Brugge': 1579,
  'Brugge': 1579,
  'Club Brugge KV': 1579,
  'Cercle Brugge': 1580,
  'Cercle': 1580,
  'Anderlecht': 1578,
  'Royal Anderlecht': 1578,
  'Standard Liege': 1577,
  'Standard': 1577,
  'Genk': 1576,
  'KRC Genk': 1576,
  'Gent': 1575,
  'KAA Gent': 1575,

  // Primeira Liga (Portugal)
  'Benfica': 228,
  'SL Benfica': 228,
  'Sporting CP': 229,
  'Sporting Lisbon': 229,
  'Porto': 230,
  'FC Porto': 230,
  'Sporting': 229,
  'Braga': 231,
  'SC Braga': 231,
  'Vitoria Guimaraes': 232,
  'Guimaraes': 232,

  // Eredivisie (Netherlands)
  'Ajax': 194,
  'Ajax Amsterdam': 194,
  'AFC Ajax': 194,
  'PSV': 195,
  'PSV Eindhoven': 195,
  'Feyenoord': 197,
  'AZ Alkmaar': 196,
  'AZ': 196,
  'Twente': 198,
  'FC Twente': 198,
  'Utrecht': 199,
  'FC Utrecht': 199,

  // Süper Lig (Turkey)
  'Galatasaray': 618,
  'Galatasaray SK': 618,
  'Fenerbahce': 619,
  'Fenerbahçe': 619,
  'Besiktas': 620,
  'Beşiktaş': 620,
  'Trabzonspor': 621,
  'Basaksehir': 622,
  'Istanbul Basaksehir': 622,

  // Cyprus First Division
  'Pafos': 5555,
  'Pafos FC': 5555,
  'Pafos Football Club': 5555,

  // Azerbaijan Premier League
  'Qarabag': 5510,
  'Qarabag FK': 5510,
  'Qarabağ': 5510,
  'Qarabağ FK': 5510,
  'Qarabag Agdam': 5510,

  // Kazakhstan Premier League
  'FC Kairat': 2988,
  'Kairat': 2988,
  'Kairat Almaty': 2988,
  'Kairat FC': 2988,
};

/**
 * Normalize team name for matching
 * Removes common suffixes and normalizes case
 */
function normalizeTeamName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+fc\s*/gi, '')
    .replace(/\s+cf\s*/gi, '')
    .replace(/\s+&/gi, ' and ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * SUNDERLAND BADGE PATH - Single source of truth
 * This is the ONLY path that should be used for Sunderland badges
 */
/**
 * Get Sunderland badge path with cache-busting timestamp
 * This ensures the browser always loads the fresh image
 */
const getSunderlandBadgePath = () => {
  // Add timestamp to force browser reload and bypass caching
  return '/icons/Sunderland-AFC.png?t=' + Date.now();
};

/**
 * Special badge overrides - these take precedence over API badges
 * SUNDERLAND: Always use local badge, never API
 * Note: For specialBadgeMap, we use static path since it's evaluated at module load
 * Dynamic checks use getSunderlandBadgePath() for cache-busting
 */
const SUNDERLAND_BADGE_STATIC = '/icons/Sunderland-AFC.png';
const specialBadgeMap: Record<string, string> = {
  'Sunderland': SUNDERLAND_BADGE_STATIC,
  'Sunderland AFC': SUNDERLAND_BADGE_STATIC,
  'Sunderland A.F.C.': SUNDERLAND_BADGE_STATIC,
  'Sunderland A.F.C': SUNDERLAND_BADGE_STATIC,
  'sunderland': SUNDERLAND_BADGE_STATIC,
  'sunderland afc': SUNDERLAND_BADGE_STATIC,
  'sunderland a.f.c.': SUNDERLAND_BADGE_STATIC,
  'sunderland a.f.c': SUNDERLAND_BADGE_STATIC,
};

/**
 * Get team badge URL from team name
 * Uses API-Football badge format: https://media.api-sports.io/football/teams/{teamId}.png
 * 
 * Special handling for Sunderland: Uses local badge at /icons/Sunderland-AFC.png
 */
export function getTeamBadgeUrl(teamName: string): string {
  // Log all calls in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`[getTeamBadgeUrl] Called with: "${teamName}"`);
  }
  if (!teamName) {
    return '/icons/default-team-badge.svg';
  }

  const teamNameTrimmed = teamName.trim();
  const teamNameLower = teamNameTrimmed.toLowerCase();

  // Check special badge map first (exact match) - try both original and lowercase
  if (specialBadgeMap[teamNameTrimmed]) {
    const badgeUrl = specialBadgeMap[teamNameTrimmed];
    if (typeof window !== 'undefined') {
      console.log(`[Badge] Special map match: "${teamName}" -> "${badgeUrl}"`);
    }
    return badgeUrl;
  }
  if (specialBadgeMap[teamNameLower]) {
    const badgeUrl = specialBadgeMap[teamNameLower];
    if (typeof window !== 'undefined') {
      console.log(`[Badge] Special map match (lowercase): "${teamName}" -> "${badgeUrl}"`);
    }
    return badgeUrl;
  }

  // SUNDERLAND: Check if team name contains "sunderland" (case-insensitive) - FIRST CHECK, most permissive
  // This MUST happen before any teamIdMap lookups
  if (teamNameLower.includes('sunderland')) {
    const badgePath = getSunderlandBadgePath();
    if (typeof window !== 'undefined') {
      console.log(`[Sunderland Badge] ✅ DETECTED: "${teamName}" (lowercase: "${teamNameLower}") -> Returning: "${badgePath}"`);
    }
    return badgePath;
  }

  // Special case: Qarabag uses local badge
  const qarabagVariations = ['qarabag', 'qarabağ'];
  if (qarabagVariations.some(v => teamNameLower.includes(v))) {
    return '/designs/qarabag.png';
  }

  // Special case: Tottenham - use local badge
  const tottenhamVariations = ['tottenham', 'spurs'];
  if (tottenhamVariations.some(v => teamNameLower.includes(v))) {
    return '/icons/spurs.png';
  }

  // First try exact match
  if (teamIdMap[teamName]) {
    const teamId = teamIdMap[teamName];
    // Team ID 71 is Sunderland - ALWAYS use local badge, NEVER API
    if (teamId === 71) {
      if (typeof window !== 'undefined') {
        console.log(`[Sunderland Badge] ✅ INTERCEPTED via exact match, teamId: ${teamId}, teamName: "${teamName}" -> Returning: "${getSunderlandBadgePath()}"`);
      }
      return getSunderlandBadgePath();
    }
    return `https://media.api-sports.io/football/teams/${teamId}.png`;
  }

  // Try normalized match
  const normalized = normalizeTeamName(teamName);
  for (const [key, value] of Object.entries(teamIdMap)) {
    if (normalizeTeamName(key) === normalized) {
      // Team ID 71 is Sunderland - ALWAYS use local badge, never API
      if (value === 71) {
        if (typeof window !== 'undefined') {
          console.log('[Sunderland Badge] Found via normalized match, teamId:', value, '-> Using local badge');
        }
        return getSunderlandBadgePath();
      }
      return `https://media.api-sports.io/football/teams/${value}.png`;
    }
  }

  // Try partial match (e.g., "Tottenham" matches "Tottenham Hotspur")
  const normalizedLower = normalized.toLowerCase();
  for (const [key, value] of Object.entries(teamIdMap)) {
    const keyNormalized = normalizeTeamName(key);
    if (
      keyNormalized.includes(normalizedLower) ||
      normalizedLower.includes(keyNormalized)
    ) {
      // Team ID 71 is Sunderland - ALWAYS use local badge, never API
      if (value === 71) {
        if (typeof window !== 'undefined') {
          console.log('[Sunderland Badge] Found via normalized match, teamId:', value, '-> Using local badge');
        }
        return getSunderlandBadgePath();
      }
      return `https://media.api-sports.io/football/teams/${value}.png`;
    }
  }

  // Final check: if normalized name contains "sunderland", return local badge
  if (normalizedLower.includes('sunderland')) {
    if (typeof window !== 'undefined') {
      console.log(`[Sunderland Badge] ✅ FINAL CHECK: normalized name contains "sunderland" -> Returning: "${getSunderlandBadgePath()}"`);
    }
    return getSunderlandBadgePath();
  }

  // Always return a valid fallback
  const fallbackUrl = '/icons/default-team-badge.svg';
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`[getTeamBadgeUrl] No match found for "${teamName}", returning fallback: "${fallbackUrl}"`);
  }
  return fallbackUrl;
}

/**
 * Check if team badge needs white background
 * Teams with white/light badges that need background for visibility
 */
export function needsWhiteBackground(teamName: string): boolean {
  const whiteBackgroundTeams = [
    'Tottenham',
    'Tottenham Hotspur',
    'Spurs',
    'Real Madrid',
    'Valencia',
  ];
  
  const normalizedName = teamName.toLowerCase();
  return whiteBackgroundTeams.some(team => 
    normalizedName.includes(team.toLowerCase())
  );
}

