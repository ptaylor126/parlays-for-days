/**
 * Football Data Fetcher
 * Fetches structured data from API-Football for parlay analysis
 */

const API_KEY = process.env.FOOTBALL_API_KEY || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID;

const headers = {
  'x-rapidapi-key': API_KEY || '',
  'x-rapidapi-host': 'v3.football.api-sports.io'
};

// Get current matchweek for Premier League
export async function getCurrentMatchweek(): Promise<number> {
  if (!API_KEY) {
    return 12; // Updated default fallback
  }

  try {
    // Get fixtures for current date to determine matchweek
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=39&season=2025&from=${today}&to=${today}`,
      {
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      }
    );

    const data = await response.json();
    
    if (data.response && data.response.length > 0) {
      // Get the round from any fixture today
      // Format: "Regular Season - 12"
      const roundString = data.response[0].league.round;
      const matchweekNumber = parseInt(roundString.split(' - ')[1]);
      
      console.log('Current matchweek from API:', matchweekNumber);
      
      return matchweekNumber || 12;
    }
    
    // If no fixtures today, get upcoming fixtures
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7); // Look ahead 7 days
    const futureDate = tomorrow.toISOString().split('T')[0];
    
    const futureResponse = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=39&season=2025&from=${today}&to=${futureDate}&next=1`,
      {
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      }
    );
    
    const futureData = await futureResponse.json();
    
    if (futureData.response && futureData.response.length > 0) {
      const roundString = futureData.response[0].league.round;
      const matchweekNumber = parseInt(roundString.split(' - ')[1]);
      
      console.log('Upcoming matchweek from API:', matchweekNumber);
      
      return matchweekNumber || 12;
    }
    
    return 12; // Default fallback
  } catch (error) {
    console.error('Error fetching current matchweek:', error);
    return 12; // Default fallback
  }
}

// League ID mapping
const LEAGUE_IDS: Record<string, number> = {
  'Premier League': 39,
  'Bundesliga': 78,
  'La Liga': 140,
  'Serie A': 135,
  'Ligue 1': 61,
};

// Team ID mapping (from teamBadges.ts)
const TEAM_IDS: Record<string, number> = {
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
  'Sunderland': 71,
  'Sunderland AFC': 71,
  'Leeds': 63,
  'Leeds United': 63,
  'Leeds Utd': 63,
};

/**
 * Normalize team name for matching
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
 * Get team ID from team name
 */
function getTeamId(teamName: string): number | null {
  if (!teamName) {
    return null;
  }

  const teamNameLower = teamName.trim().toLowerCase();

  // SUNDERLAND: Special check - if name contains "sunderland" (case-insensitive), return ID 71
  // This matches the badge logic and ensures Sunderland is always found regardless of name format
  if (teamNameLower.includes('sunderland')) {
    console.log(`[getTeamId] ✅ Sunderland detected in "${teamName}" -> returning ID 71`);
    return 71;
  }

  // Try exact match first
  if (TEAM_IDS[teamName]) {
    return TEAM_IDS[teamName];
  }

  // Try normalized match
  const normalized = normalizeTeamName(teamName);
  for (const [key, value] of Object.entries(TEAM_IDS)) {
    if (normalizeTeamName(key) === normalized) {
      return value;
    }
  }

  // Try partial match
  const normalizedLower = normalized.toLowerCase();
  for (const [key, value] of Object.entries(TEAM_IDS)) {
    const keyNormalized = normalizeTeamName(key);
    if (
      keyNormalized.includes(normalizedLower) ||
      normalizedLower.includes(keyNormalized)
    ) {
      return value;
    }
  }

  return null;
}

/**
 * Get current season year
 * For 2025, we want to use 2025/26 season data
 */
function getCurrentSeason(): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-12
  
  // Force 2025/26 season if we're in 2025 or later
  if (currentYear >= 2025) {
    return 2025;
  }
  
  // For previous years, season starts in August
  return currentMonth >= 8 ? currentYear : currentYear - 1;
}

/**
 * Fetch team statistics
 */
async function fetchTeamStats(teamId: number, leagueId: number, season: number) {
  try {
    console.log(`📊 Fetching team stats for team ${teamId}, league ${leagueId}, season ${season}`);
    const response = await fetch(
      `${BASE_URL}/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`,
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to fetch team stats for team ${teamId}: ${response.status} ${response.statusText}`);
      console.error(`   Error response:`, errorText.substring(0, 500));
      return null;
    }

    const data = await response.json();
    const result = data.response || null;
    
    if (result) {
      console.log(`✅ Team stats fetched for team ${teamId}:`, {
        hasLeague: !!result.league,
        hasGoals: !!result.goals,
        hasForm: !!result.form,
        position: result.league?.position,
        points: result.league?.points,
      });
    } else {
      console.warn(`⚠️ No team stats data returned for team ${teamId} (league ${leagueId}, season ${season})`);
      console.warn(`   Response structure:`, Object.keys(data));
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return null;
  }
}

/**
 * Fetch team's recent fixtures for form
 */
async function fetchTeamForm(teamId: number, leagueId: number, season: number) {
  try {
    const response = await fetch(
      `${BASE_URL}/fixtures?team=${teamId}&league=${leagueId}&season=${season}&last=5`,
      { headers }
    );

    if (!response.ok) {
      console.error(`Failed to fetch team form: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const fixtures = data.response || [];

    // Build form string (W/D/L)
    const form = fixtures
      .reverse() // Reverse to get chronological order
      .map((fixture: any) => {
        if (!fixture.fixture.status.short || fixture.fixture.status.short === 'NS') {
          return null; // Skip not started
        }

        const isHome = fixture.teams.home.id === teamId;
        const homeScore = fixture.goals.home;
        const awayScore = fixture.goals.away;

        if (homeScore === awayScore) return 'D';
        if (isHome && homeScore > awayScore) return 'W';
        if (!isHome && awayScore > homeScore) return 'W';
        return 'L';
      })
      .filter((result: string | null) => result !== null)
      .join('');

    return form || null;
  } catch (error) {
    console.error('Error fetching team form:', error);
    return null;
  }
}

/**
 * Fetch match data from FotMob (injuries and referee)
 * Returns both injuries for both teams and referee info
 */
async function fetchFotMobMatchData(homeTeamName: string, awayTeamName: string, matchDate?: string) {
  try {
    console.log(`\n=== FETCHING FOTMOB DATA ===`);
    console.log(`Teams: ${homeTeamName} vs ${awayTeamName}${matchDate ? ` on ${matchDate}` : ''}`);
    console.log(`This will appear in SERVER CONSOLE (terminal), not browser console`);
    
    // FotMob API structure: we need to find the match first
    // Try multiple date ranges (match might be upcoming or recent)
    const matchDateObj = matchDate ? new Date(matchDate) : new Date();
    const dateStr = matchDateObj.toISOString().split('T')[0];
    
    // Try dates: match date, day before, day after (in case of timezone issues)
    const datesToTry = [
      dateStr,
      new Date(matchDateObj.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date(matchDateObj.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ];
    
    // FotMob uses league ID 47 for Premier League
    // Also try without league filter
    let fotMobMatchId: number | null = null;
    
    for (const dateToTry of datesToTry) {
      // Try multiple URL formats - FotMob API structure might be different
      const urlsToTry = [
        `https://www.fotmob.com/api/matches?date=${dateToTry}&league=47`,
        `https://www.fotmob.com/api/matches?date=${dateToTry}`,
        `https://www.fotmob.com/api/leagues?id=47&date=${dateToTry}`,
      ];
      
      for (const matchesUrl of urlsToTry) {
        console.log(`Trying FotMob matches URL: ${matchesUrl}`);
        
        try {
          const matchesResponse = await fetch(matchesUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json',
              'Referer': 'https://www.fotmob.com/',
              'Origin': 'https://www.fotmob.com',
            }
          });
          
          if (matchesResponse.ok) {
            const matchesData = await matchesResponse.json();
            console.log(`FotMob matches response keys for ${dateToTry}:`, Object.keys(matchesData));
            
            // Try different response structures
            let matches: any[] = [];
            if (matchesData.leagues && Array.isArray(matchesData.leagues)) {
              matches = matchesData.leagues.flatMap((league: any) => league.matches || []);
            } else if (matchesData.matches) {
              matches = Array.isArray(matchesData.matches) ? matchesData.matches : [];
            } else if (Array.isArray(matchesData)) {
              matches = matchesData;
            }
            
            console.log(`Found ${matches.length} matches for ${dateToTry}`);
            
            // Find the match by team names (flexible matching)
            for (const match of matches) {
              const homeName = match.home?.name || match.homeTeam?.name || match.h?.name || '';
              const awayName = match.away?.name || match.awayTeam?.name || match.a?.name || '';
              
              const homeMatch = homeName && (
                homeName.toLowerCase().includes(homeTeamName.toLowerCase()) || 
                homeTeamName.toLowerCase().includes(homeName.toLowerCase()) ||
                homeName.toLowerCase() === homeTeamName.toLowerCase()
              );
              
              const awayMatch = awayName && (
                awayName.toLowerCase().includes(awayTeamName.toLowerCase()) || 
                awayTeamName.toLowerCase().includes(awayName.toLowerCase()) ||
                awayName.toLowerCase() === awayTeamName.toLowerCase()
              );
              
              if (homeMatch && awayMatch) {
                fotMobMatchId = match.id || match.matchId || match.match_id;
                console.log(`✅ Found FotMob match ID: ${fotMobMatchId} for ${homeName} vs ${awayName} on ${dateToTry}`);
                break;
              }
            }
            
            if (fotMobMatchId) break; // Break out of URL loop if match found
          } else {
            console.log(`FotMob matches API returned ${matchesResponse.status} for ${dateToTry} from ${matchesUrl}`);
            // If 401, the API might require authentication or have CORS restrictions
            if (matchesResponse.status === 401) {
              console.log('FotMob API returned 401 - may require authentication or have CORS restrictions');
            }
          }
          
          if (fotMobMatchId) break; // Break out of URL loop if match found
        } catch (e) {
          console.log(`Error fetching matches for ${dateToTry} from ${matchesUrl}:`, e);
        }
      }
      
      if (fotMobMatchId) break; // Break out of date loop if match found
    }
    
    if (!fotMobMatchId) {
      console.log('❌ Could not find FotMob match ID after trying multiple dates');
      console.log('Trying alternative: search by team names directly');
      
      // Alternative: Try to get team data and find upcoming/recent matches
      // This is a fallback if date-based search doesn't work
      try {
        const searchUrl = `https://www.fotmob.com/api/search?query=${encodeURIComponent(homeTeamName)}`;
        const searchResponse = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          }
        });
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log('FotMob search response keys:', Object.keys(searchData));
          // Try to find team and get their matches
        }
      } catch (e) {
        console.log('Alternative search also failed:', e);
      }
      
      return { homeInjuries: [], awayInjuries: [], referee: null, useApiFootball: true };
    }
    
    // Fetch match details - try multiple URL formats and headers
    const matchDetailsUrls = [
      `https://www.fotmob.com/api/matchDetails?matchId=${fotMobMatchId}`,
      `https://www.fotmob.com/api/matches/${fotMobMatchId}`,
      `https://www.fotmob.com/api/match/${fotMobMatchId}`,
    ];
    
    let matchDetailsResponse: Response | null = null;
    let matchDetails: any = null;
    
    for (const matchDetailsUrl of matchDetailsUrls) {
      console.log(`Trying FotMob match details URL: ${matchDetailsUrl}`);
      
      try {
        matchDetailsResponse = await fetch(matchDetailsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.fotmob.com/',
            'Origin': 'https://www.fotmob.com',
          }
        });
        
        if (matchDetailsResponse.ok) {
          matchDetails = await matchDetailsResponse.json();
          console.log(`✅ Successfully fetched match details from: ${matchDetailsUrl}`);
          break;
        } else {
          console.log(`FotMob match details API returned ${matchDetailsResponse.status} for ${matchDetailsUrl}`);
        }
      } catch (e) {
        console.log(`Error fetching from ${matchDetailsUrl}:`, e);
      }
    }
    
    if (!matchDetails) {
      console.log(`❌ Could not fetch match details from any FotMob URL`);
      return { homeInjuries: [], awayInjuries: [], referee: null, useApiFootball: true };
    }
    
    console.log(`FotMob match details keys:`, Object.keys(matchDetails));
    console.log(`FotMob match details full structure (first 10000 chars):`, JSON.stringify(matchDetails, null, 2).substring(0, 10000));
    
    // Try to find referee in the response - log all possible paths
    console.log('=== SEARCHING FOR REFEREE IN FOTMOB RESPONSE ===');
    console.log('matchDetails.content?.referee:', matchDetails.content?.referee);
    console.log('matchDetails.referee:', matchDetails.referee);
    console.log('matchDetails.general?.referee:', matchDetails.general?.referee);
    console.log('matchDetails.matchFacts?.referee:', matchDetails.matchFacts?.referee);
    console.log('matchDetails.content?.matchFacts?.referee:', matchDetails.content?.matchFacts?.referee);
    
    // Extract injuries and referee
    let homeInjuries: any[] = [];
    let awayInjuries: any[] = [];
    let referee: string | null = null;
    
    // Try various paths for injuries - FotMob structure can vary
    // Path 1: content.lineup.teams[].injuredPlayers
    if (matchDetails.content?.lineup?.teams) {
      const teams = matchDetails.content.lineup.teams;
      if (Array.isArray(teams) && teams.length >= 2) {
        homeInjuries = teams[0]?.injuredPlayers || teams[0]?.sidelined || teams[0]?.injuries || [];
        awayInjuries = teams[1]?.injuredPlayers || teams[1]?.sidelined || teams[1]?.injuries || [];
        console.log(`Found injuries via lineup.teams: ${homeInjuries.length} home, ${awayInjuries.length} away`);
      }
    }
    
    // Path 2: content.injuries
    if (homeInjuries.length === 0 && awayInjuries.length === 0 && matchDetails.content?.injuries) {
      if (Array.isArray(matchDetails.content.injuries)) {
        // Might be array of injuries with team info
        homeInjuries = matchDetails.content.injuries.filter((inj: any) => 
          inj.team?.toLowerCase().includes(homeTeamName.toLowerCase()) ||
          inj.teamId === homeTeamName
        );
        awayInjuries = matchDetails.content.injuries.filter((inj: any) => 
          inj.team?.toLowerCase().includes(awayTeamName.toLowerCase()) ||
          inj.teamId === awayTeamName
        );
      } else {
        homeInjuries = matchDetails.content.injuries.home || [];
        awayInjuries = matchDetails.content.injuries.away || [];
      }
      console.log(`Found injuries via content.injuries: ${homeInjuries.length} home, ${awayInjuries.length} away`);
    }
    
    // Path 3: Direct injuries array
    if (homeInjuries.length === 0 && awayInjuries.length === 0 && matchDetails.injuries) {
      if (Array.isArray(matchDetails.injuries)) {
        homeInjuries = matchDetails.injuries.filter((inj: any) => 
          inj.team?.toLowerCase().includes(homeTeamName.toLowerCase())
        );
        awayInjuries = matchDetails.injuries.filter((inj: any) => 
          inj.team?.toLowerCase().includes(awayTeamName.toLowerCase())
        );
      } else {
        homeInjuries = matchDetails.injuries.home || [];
        awayInjuries = matchDetails.injuries.away || [];
      }
      console.log(`Found injuries via direct injuries: ${homeInjuries.length} home, ${awayInjuries.length} away`);
    }
    
    // Path 4: content.sidelined
    if (homeInjuries.length === 0 && awayInjuries.length === 0 && matchDetails.content?.sidelined) {
      if (Array.isArray(matchDetails.content.sidelined)) {
        homeInjuries = matchDetails.content.sidelined.filter((inj: any) => 
          inj.team?.toLowerCase().includes(homeTeamName.toLowerCase())
        );
        awayInjuries = matchDetails.content.sidelined.filter((inj: any) => 
          inj.team?.toLowerCase().includes(awayTeamName.toLowerCase())
        );
      }
      console.log(`Found injuries via sidelined: ${homeInjuries.length} home, ${awayInjuries.length} away`);
    }
    
    // Extract referee - try multiple paths in FotMob response
    referee = matchDetails.content?.referee?.name || 
              matchDetails.content?.referee ||
              matchDetails.referee?.name || 
              matchDetails.referee ||
              matchDetails.content?.matchFacts?.referee?.name ||
              matchDetails.content?.matchFacts?.referee ||
              matchDetails.matchFacts?.referee?.name ||
              matchDetails.matchFacts?.referee ||
              matchDetails.general?.referee?.name ||
              matchDetails.general?.referee ||
              null;
    
    if (referee) {
      console.log(`✅ Found referee from FotMob: ${referee}`);
    } else {
      console.log('No referee found in FotMob match details');
      console.log('Checking available paths in matchDetails:', Object.keys(matchDetails));
      if (matchDetails.content) {
        console.log('Content keys:', Object.keys(matchDetails.content));
      }
    }
    
    console.log(`Extracted from FotMob: ${homeInjuries.length} home injuries, ${awayInjuries.length} away injuries, referee: ${referee}`);
    
    if (homeInjuries.length > 0) {
      console.log('Sample home injury:', JSON.stringify(homeInjuries[0], null, 2));
    }
    if (awayInjuries.length > 0) {
      console.log('Sample away injury:', JSON.stringify(awayInjuries[0], null, 2));
    }
    
    return {
      homeInjuries: homeInjuries.map((inj: any) => ({
        name: inj.name || inj.player?.name || inj.playerName || 'Unknown',
        reason: inj.reason || inj.injury || inj.type || inj.injuryType || inj.status || 'Unknown',
        status: inj.status || (inj.returnDate ? 'Out' : 'Doubtful'),
        returnDate: inj.returnDate || inj.expectedReturn || null,
      })),
      awayInjuries: awayInjuries.map((inj: any) => ({
        name: inj.name || inj.player?.name || inj.playerName || 'Unknown',
        reason: inj.reason || inj.injury || inj.type || inj.injuryType || inj.status || 'Unknown',
        status: inj.status || (inj.returnDate ? 'Out' : 'Doubtful'),
        returnDate: inj.returnDate || inj.expectedReturn || null,
      })),
      referee: referee,
      useApiFootball: false,
    };
  } catch (error) {
    console.error('Error fetching FotMob match data:', error);
    return { homeInjuries: [], awayInjuries: [], referee: null, useApiFootball: true };
  }
}

/**
 * Fetch team injuries from API-Football (fallback)
 */
async function fetchTeamInjuries(teamId: number, leagueId: number, season: number) {
  try {
    const url = `${BASE_URL}/injuries?team=${teamId}&league=${leagueId}&season=${season}`;
    console.log(`Fetching injuries from API-Football: ${url}`);
    
    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.error(`Failed to fetch injuries for team ${teamId}: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return [];
    }

    const data = await response.json();
    console.log(`API-Football injuries response for team ${teamId}:`, JSON.stringify(data, null, 2).substring(0, 1000));
    
    const injuries = data.response || [];
    console.log(`Total injuries returned for team ${teamId}: ${injuries.length}`);

    // Filter to only recent/current injuries (last 30 days) and exclude non-injury reasons
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Reasons to exclude (suspensions, transfers, etc.)
    const excludeReasons = [
      'loan agreement', 'personal reasons', 'red card', 'yellow cards',
      'suspension', 'transfer', 'other' // "other" is too vague
    ];
    
    const recentInjuries = injuries.filter((injury: any) => {
      const player = injury.player;
      if (!player || !player.name) return false;
      
      const reason = (player.reason || injury.reason || '').toLowerCase();
      const fixtureDate = injury.fixture?.date ? new Date(injury.fixture.date) : null;
      
      // Exclude non-injury reasons
      if (excludeReasons.some(exclude => reason.includes(exclude))) {
        return false;
      }
      
      // Only include injuries from the last 30 days (or if no fixture date, include it)
      if (fixtureDate) {
        if (fixtureDate < thirtyDaysAgo) {
          return false; // Too old
        }
      }
      
      return true;
    });

    console.log(`Recent injuries (last 30 days, filtered) for team ${teamId}: ${recentInjuries.length}`);

    // Deduplicate by player ID (preferred) or player name
    const seenPlayers = new Set<string | number>();
    const uniqueInjuries = recentInjuries.filter((injury: any) => {
      const player = injury.player;
      const playerId = player.id;
      const playerName = player.name?.toLowerCase();
      
      // Use player ID if available, otherwise use name
      const key = playerId || playerName;
      
      if (seenPlayers.has(key)) {
        return false; // Duplicate
      }
      
      seenPlayers.add(key);
      return true;
    });

    console.log(`Unique injuries (deduplicated) for team ${teamId}: ${uniqueInjuries.length}`);

    const mappedInjuries = uniqueInjuries.map((injury: any) => {
      const player = injury.player || {};
      const reason = player.reason || injury.reason || player.type || 'Unknown';
      const returnDate = player.return || injury.return || null;
      
      // Determine status based on reason/type
      let status = 'Out';
      if (reason.toLowerCase().includes('doubtful') || reason.toLowerCase().includes('knock')) {
        status = 'Doubtful';
      }
      
      return {
        name: player.name || 'Unknown',
        reason: reason,
        status: status,
        returnDate: returnDate,
      };
    });
    
    console.log(`Mapped injuries for team ${teamId}:`, mappedInjuries.length);
    if (mappedInjuries.length > 0) {
      console.log(`Sample mapped injury:`, JSON.stringify(mappedInjuries[0], null, 2));
    }
    return mappedInjuries;
  } catch (error) {
    console.error(`Error fetching injuries for team ${teamId}:`, error);
    return [];
  }
}

/**
 * Fetch head-to-head data
 */
async function fetchHeadToHead(homeTeamId: number, awayTeamId: number) {
  try {
    console.log(`Fetching H2H for teams ${homeTeamId} vs ${awayTeamId}`);
    const response = await fetch(
      `${BASE_URL}/fixtures/headtohead?h2h=${homeTeamId}-${awayTeamId}`,
      { headers }
    );

    if (!response.ok) {
      console.error(`Failed to fetch H2H: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const fixtures = data.response || [];

    console.log(`Found ${fixtures.length} H2H fixtures`);

    // Get last 5 meetings (most recent first, so we reverse to get oldest first)
    const last5 = fixtures.slice(0, 5).reverse();

    const results = {
      homeWins: 0, // Wins for the "homeTeamId" team
      awayWins: 0, // Wins for the "awayTeamId" team
      draws: 0,
      recentMatches: last5.map((fixture: any) => ({
        date: fixture.fixture.date,
        homeScore: fixture.goals.home,
        awayScore: fixture.goals.away,
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
      })),
    };

    // Count wins/draws based on which team is which in each fixture
    last5.forEach((fixture: any) => {
      const fixtureHomeTeamId = fixture.teams.home.id;
      const fixtureAwayTeamId = fixture.teams.away.id;
      const homeScore = fixture.goals.home;
      const awayScore = fixture.goals.away;
      
      // Check if homeTeamId was the home team or away team in this fixture
      if (fixtureHomeTeamId === homeTeamId) {
        // Our "home" team was home in this fixture
      if (homeScore > awayScore) results.homeWins++;
      else if (awayScore > homeScore) results.awayWins++;
      else results.draws++;
      } else if (fixtureAwayTeamId === homeTeamId) {
        // Our "home" team was away in this fixture
        if (awayScore > homeScore) results.homeWins++;
        else if (homeScore > awayScore) results.awayWins++;
        else results.draws++;
      }
    });

    console.log(`H2H results (last 5): ${results.homeWins}W-${results.draws}D-${results.awayWins}L`);
    return results;
  } catch (error) {
    console.error('Error fetching H2H:', error);
    return null;
  }
}

/**
 * Get top scorers for a team
 */
async function fetchTopScorers(teamId: number, leagueId: number, season: number) {
  try {
    console.log(`=== FETCHING TOP SCORERS ===`);
    console.log(`Team ID: ${teamId}, League: ${leagueId}, Season: ${season}`);
    
    // Use /players endpoint with team filter to get all players from the team
    // Then we'll sort by goals and take top 3
    const url = `${BASE_URL}/players?team=${teamId}&league=${leagueId}&season=${season}`;
    console.log(`Fetching: ${url.replace(API_KEY || '', 'API_KEY_HIDDEN')}`);
    
    const response = await fetch(url, { headers });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`Failed to fetch players: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      
      // Fallback: try topscorers endpoint and filter
      console.log(`Trying fallback: topscorers endpoint`);
      return await fetchTopScorersFallback(teamId, leagueId, season);
    }

    const data = await response.json();
    console.log(`Response structure:`, Object.keys(data));
    console.log(`Response length: ${data.response?.length || 0}`);
    
    const allPlayers = data.response || [];
    console.log(`Found ${allPlayers.length} players for team ${teamId}`);
    
    if (allPlayers.length > 0) {
      console.log(`First player structure:`, JSON.stringify(allPlayers[0], null, 2).substring(0, 1000));
    }
    
    // Extract players with goals, sort by goals descending, take top 3
    const playersWithGoals = allPlayers
      .map((player: any) => {
        const name = player.player?.name || 'Unknown';
        const goals = player.statistics?.[0]?.goals?.total || 0;
        return { name, goals: Number(goals) || 0, player };
      })
      .filter((p: any) => p.goals > 0) // Only players who have scored
      .sort((a: any, b: any) => b.goals - a.goals) // Sort by goals descending
      .slice(0, 3); // Take top 3
    
    console.log(`Found ${playersWithGoals.length} scorers with goals > 0`);
    playersWithGoals.forEach((p: any, idx: number) => {
      console.log(`  Scorer ${idx + 1}: ${p.name} - ${p.goals} goals`);
    });

    const topScorers = playersWithGoals.map((p: any) => ({ name: p.name, goals: p.goals }));

    console.log(`Returning ${topScorers.length} top scorers`);
    return topScorers;
  } catch (error) {
    console.error('Error fetching top scorers:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // Try fallback
    return await fetchTopScorersFallback(teamId, leagueId, season);
  }
}

// Fallback function using topscorers endpoint
async function fetchTopScorersFallback(teamId: number, leagueId: number, season: number) {
  try {
    console.log(`=== FALLBACK: FETCHING TOP SCORERS (league-wide) ===`);
    const url = `${BASE_URL}/players/topscorers?league=${leagueId}&season=${season}`;
    
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error(`Fallback also failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const allPlayers = data.response || [];
    
    // Filter for players from this specific team
    const teamPlayers = allPlayers.filter((player: any) => {
      const playerTeamId = player.statistics?.[0]?.team?.id 
        || player.team?.id
        || player.statistics?.[0]?.team_id;
      return playerTeamId === teamId;
    });

    console.log(`Fallback: Found ${allPlayers.length} total scorers, ${teamPlayers.length} from team ${teamId}`);
    
    const topScorers = teamPlayers.slice(0, 3).map((player: any) => {
      const name = player.player?.name || 'Unknown';
      const goals = player.statistics?.[0]?.goals?.total || 0;
      return { name, goals: Number(goals) || 0 };
    });

    return topScorers;
  } catch (error) {
    console.error('Fallback also failed:', error);
    return [];
  }
}

/**
 * Enrich match data with API-Football statistics
 */
export async function getEnrichedMatchData(match: {
  homeTeam: string;
  awayTeam: string;
  league: string;
  odds?: {
    home: number;
    draw: number;
    away: number;
  };
}) {
  if (!API_KEY) {
    console.warn('API-Football key not configured');
    return null;
  }

  const leagueId = LEAGUE_IDS[match.league];
  if (!leagueId) {
    console.warn(`Unknown league: ${match.league}`);
    return null;
  }

  const homeTeamId = getTeamId(match.homeTeam);
  const awayTeamId = getTeamId(match.awayTeam);

  console.log(`🔍 Team ID lookup:`);
  console.log(`   "${match.homeTeam}" -> ${homeTeamId}`);
  console.log(`   "${match.awayTeam}" -> ${awayTeamId}`);

  if (!homeTeamId || !awayTeamId) {
    console.warn(`❌ Could not find team IDs for: ${match.homeTeam} (${homeTeamId}) or ${match.awayTeam} (${awayTeamId})`);
    console.warn(`   Available team names:`, Object.keys(TEAM_IDS).slice(0, 20).join(', '), '...');
    return null;
  }

  const season = getCurrentSeason();

  console.log(`📊 Enriching match: ${match.homeTeam} vs ${match.awayTeam}`);
  console.log(`   Team IDs: ${homeTeamId} vs ${awayTeamId}, League: ${leagueId}, Season: ${season}`);
  
  console.log('=== TEAM IDS FROM MATCH ===');
  console.log('Home Team ID:', homeTeamId, '- Name:', match.homeTeam);
  console.log('Away Team ID:', awayTeamId, '- Name:', match.awayTeam);

  // Debug: Fetch standings directly to see the structure
  console.log('=== FETCHING RAW STANDINGS API ===');
  try {
    const standingsResponse = await fetch(
      `${BASE_URL}/standings?league=${leagueId}&season=${season}`,
      { headers }
    );
    
    if (standingsResponse.ok) {
      const standingsData = await standingsResponse.json();
      
      console.log('=== RAW STANDINGS API RESPONSE ===');
      console.log('Response exists:', !!standingsData.response);
      console.log('Response length:', standingsData.response?.length);
      console.log('First response item keys:', Object.keys(standingsData.response?.[0] || {}));
      
      // Try different paths
      const path1 = standingsData.response?.[0]?.league?.standings?.[0];
      const path2 = standingsData.response?.[0]?.league?.standings;
      const path3 = standingsData.response;
      
      console.log('Path 1 (response[0].league.standings[0]) exists:', !!path1);
      console.log('Path 1 length:', path1?.length || 0);
      console.log('Path 2 (response[0].league.standings) exists:', !!path2);
      console.log('Path 2 length:', path2?.length || 0);
      console.log('Path 3 (response) length:', path3?.length || 0);
      
      // Log the actual structure
      if (standingsData.response?.[0]) {
        const structureSample = JSON.stringify(standingsData.response[0], null, 2);
        console.log('Full structure sample (first 1000 chars):', structureSample.substring(0, 1000));
        
        // Try to find the correct path
        if (standingsData.response[0].league) {
          console.log('League keys:', Object.keys(standingsData.response[0].league));
          if (standingsData.response[0].league.standings) {
            console.log('Standings type:', Array.isArray(standingsData.response[0].league.standings) ? 'Array' : typeof standingsData.response[0].league.standings);
            console.log('Standings length:', standingsData.response[0].league.standings.length);
            if (standingsData.response[0].league.standings[0]) {
              console.log('First standings item type:', Array.isArray(standingsData.response[0].league.standings[0]) ? 'Array' : typeof standingsData.response[0].league.standings[0]);
              if (Array.isArray(standingsData.response[0].league.standings[0])) {
                console.log('First standings array length:', standingsData.response[0].league.standings[0].length);
                if (standingsData.response[0].league.standings[0].length > 0) {
                  console.log('First team in standings:', JSON.stringify(standingsData.response[0].league.standings[0][0], null, 2));
                }
              }
            }
          }
        }
      }
    } else {
      console.log('Standings API request failed:', standingsResponse.status);
    }
  } catch (error) {
    console.error('Error fetching standings for debug:', error);
  }

  // Fetch all data in parallel
  console.log(`🔄 Fetching data for season ${season}, league ${leagueId}...`);
  const [
    homeStats,
    awayStats,
    homeForm,
    awayForm,
    homeInjuries,
    awayInjuries,
    h2h,
    homeScorers,
    awayScorers,
  ] = await Promise.all([
    fetchTeamStats(homeTeamId, leagueId, season).catch(err => {
      console.error(`❌ Error fetching home team stats for ${match.homeTeam} (ID: ${homeTeamId}):`, err);
      return null;
    }),
    fetchTeamStats(awayTeamId, leagueId, season).catch(err => {
      console.error(`❌ Error fetching away team stats for ${match.awayTeam} (ID: ${awayTeamId}):`, err);
      return null;
    }),
    fetchTeamForm(homeTeamId, leagueId, season).catch(err => {
      console.error(`❌ Error fetching home team form:`, err);
      return null;
    }),
    fetchTeamForm(awayTeamId, leagueId, season).catch(err => {
      console.error(`❌ Error fetching away team form:`, err);
      return null;
    }),
    fetchTeamInjuries(homeTeamId, leagueId, season).catch(err => {
      console.error(`❌ Error fetching home team injuries:`, err);
      return [];
    }),
    fetchTeamInjuries(awayTeamId, leagueId, season).catch(err => {
      console.error(`❌ Error fetching away team injuries:`, err);
      return [];
    }),
    fetchHeadToHead(homeTeamId, awayTeamId).catch(err => {
      console.error(`❌ Error fetching head-to-head:`, err);
      return null;
    }),
    fetchTopScorers(homeTeamId, leagueId, season).catch(err => {
      console.error(`❌ Error fetching home team top scorers for ${match.homeTeam} (ID: ${homeTeamId}):`, err);
      return [];
    }),
    fetchTopScorers(awayTeamId, leagueId, season).catch(err => {
      console.error(`❌ Error fetching away team top scorers for ${match.awayTeam} (ID: ${awayTeamId}):`, err);
      return [];
    }),
  ]);
  
  console.log(`✅ Data fetch complete:`);
  console.log(`   Home stats:`, homeStats ? '✅' : '❌');
  console.log(`   Away stats:`, awayStats ? '✅' : '❌');
  console.log(`   Home scorers:`, homeScorers?.length || 0, 'players');
  console.log(`   Away scorers:`, awayScorers?.length || 0, 'players');
  
  // Debug: Log what fetchTeamStats actually returns
  console.log('=== RAW TEAM STATS API RESPONSE ===');
  console.log('homeStats exists:', !!homeStats);
  console.log('awayStats exists:', !!awayStats);
  
  if (homeStats) {
    console.log('homeStats full response:', JSON.stringify(homeStats, null, 2).substring(0, 2000));
    console.log('homeStats keys:', Object.keys(homeStats));
    if (homeStats.league) {
      console.log('homeStats.league keys:', Object.keys(homeStats.league));
      console.log('homeStats.league.position:', homeStats.league.position);
      console.log('homeStats.league.points:', homeStats.league.points);
    }
    console.log('homeStats.form:', homeStats.form);
    console.log('homeStats.goals:', homeStats.goals ? {
      for: homeStats.goals.for,
      against: homeStats.goals.against
    } : 'null');
  }
  
  if (awayStats) {
    console.log('awayStats full response:', JSON.stringify(awayStats, null, 2).substring(0, 2000));
    console.log('awayStats keys:', Object.keys(awayStats));
    if (awayStats.league) {
      console.log('awayStats.league keys:', Object.keys(awayStats.league));
      console.log('awayStats.league.position:', awayStats.league.position);
      console.log('awayStats.league.points:', awayStats.league.points);
    }
    console.log('awayStats.form:', awayStats.form);
    console.log('awayStats.goals:', awayStats.goals ? {
      for: awayStats.goals.for,
      against: awayStats.goals.against
    } : 'null');
  }
  
  // Show what we're extracting
  console.log('=== EXTRACTING DATA ===');
  console.log('Extracting home position from:', homeStats?.league?.position);
  console.log('Extracting home points from:', homeStats?.league?.points);
  console.log('Extracting home form from:', homeStats?.form || homeForm);
  console.log('Extracting away position from:', awayStats?.league?.position);
  console.log('Extracting away points from:', awayStats?.league?.points);
  console.log('Extracting away form from:', awayStats?.form || awayForm);

  // Debug: Check team stats structure
  console.log('=== CHECKING TEAM STATS STRUCTURE ===');
  console.log('Home stats exists:', !!homeStats);
  console.log('Home stats object keys:', homeStats ? Object.keys(homeStats) : 'null');
  console.log('Home league object:', homeStats?.league);
  console.log('Home league keys:', homeStats?.league ? Object.keys(homeStats.league) : 'null');
  console.log('Home goals object:', homeStats?.goals);
  console.log('Home goals keys:', homeStats?.goals ? Object.keys(homeStats.goals) : 'null');
  console.log('Home form:', homeStats?.form);
  console.log('Home stats full response sample:', JSON.stringify(homeStats, null, 2).substring(0, 1500));
  
  console.log('Away stats exists:', !!awayStats);
  console.log('Away stats object keys:', awayStats ? Object.keys(awayStats) : 'null');
  console.log('Away league object:', awayStats?.league);
  console.log('Away goals object:', awayStats?.goals);
  console.log('Away form:', awayStats?.form);

  // Extract data - match the structure used by getEnrichedMatchesData (working matches)
  // The API returns: response.league.position, response.league.points, response.form, response.goals.for.total.total
  // Since fetchTeamStats returns data.response, homeStats is already the response object
  const homePosition = homeStats?.league?.position || 0;
  const awayPosition = awayStats?.league?.position || 0;
  const homePoints = homeStats?.league?.points || 0;
  const awayPoints = awayStats?.league?.points || 0;
  
  console.log('=== POSITION & POINTS EXTRACTION ===');
  console.log(`Home position: ${homePosition} from homeStats?.league?.position`);
  console.log(`Home points: ${homePoints} from homeStats?.league?.points`);
  console.log(`Away position: ${awayPosition} from awayStats?.league?.position`);
  console.log(`Away points: ${awayPoints} from awayStats?.league?.points`);
  
  // Check what we're actually extracting
  console.log('=== EXTRACTING VALUES ===');
  console.log('Extracted home position:', homePosition, 'from homeStats?.league?.position');
  console.log('Extracted home points:', homePoints, 'from homeStats?.league?.points');
  console.log('Extracted home goals for:', homeStats?.goals?.for?.total?.all);
  console.log('Extracted home goals against:', homeStats?.goals?.against?.total?.all);
  console.log('Extracted home form:', homeStats?.form);
  console.log('Extracted away position:', awayPosition, 'from awayStats?.league?.position');
  console.log('Extracted away points:', awayPoints, 'from awayStats?.league?.points');
  console.log('Extracted away goals for:', awayStats?.goals?.for?.total?.all);
  console.log('Extracted away goals against:', awayStats?.goals?.against?.total?.all);
  console.log('Extracted away form:', awayStats?.form);

  // Use the same data extraction as getEnrichedMatchesData (working matches)
  // Try .total.total first (what working matches use), then fall back to .total.all
  const homeGoalsFor = homeStats?.goals?.for?.total?.total ?? homeStats?.goals?.for?.total?.all ?? 0;
  const homeGoalsAgainst = homeStats?.goals?.against?.total?.total ?? homeStats?.goals?.against?.total?.all ?? 0;
  const awayGoalsFor = awayStats?.goals?.for?.total?.total ?? awayStats?.goals?.for?.total?.all ?? 0;
  const awayGoalsAgainst = awayStats?.goals?.against?.total?.total ?? awayStats?.goals?.against?.total?.all ?? 0;
  
  console.log('=== GOALS EXTRACTION (matching working matches) ===');
  console.log(`Home goals for: ${homeGoalsFor} (from .total.total or .total.all)`);
  console.log(`Away goals for: ${awayGoalsFor} (from .total.total or .total.all)`);

  // Extract H2H record from head-to-head data
  let homeWins = 0, draws = 0, awayWins = 0;
  if (h2h && typeof h2h === 'object' && 'homeWins' in h2h) {
    homeWins = h2h.homeWins || 0;
    awayWins = h2h.awayWins || 0;
    draws = h2h.draws || 0;
  }

  // Format form string to array (last 5 matches)
  // Use form from team stats if available, otherwise use fetched form
  const homeFormString = homeStats?.form || homeForm || '';
  const awayFormString = awayStats?.form || awayForm || '';
  const homeFormArray = homeFormString ? homeFormString.split('').slice(-5) : [];
  const awayFormArray = awayFormString ? awayFormString.split('').slice(-5) : [];

  console.log(`✅ Enriched data extracted:`);
  console.log(`   Home: Position ${homePosition}, Form ${homeFormArray.join('')}, Points ${homePoints}`);
  console.log(`   Away: Position ${awayPosition}, Form ${awayFormArray.join('')}, Points ${awayPoints}`);
  console.log(`   H2H: ${homeWins}W-${draws}D-${awayWins}L`);

  return {
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    league: match.league,
    odds: match.odds,
    homeTeamStats: {
      position: homePosition,
      form: homeFormArray,
      goalsFor: homeGoalsFor,
      goalsAgainst: homeGoalsAgainst,
      points: homePoints,
      topScorers: homeScorers || [],
    },
    awayTeamStats: {
      position: awayPosition,
      form: awayFormArray,
      goalsFor: awayGoalsFor,
      goalsAgainst: awayGoalsAgainst,
      points: awayPoints,
      topScorers: awayScorers || [],
    },
    h2hRecord: {
      homeWins,
      draws,
      awayWins,
    },
    homeTeamInjuries: homeInjuries || [],
    awayTeamInjuries: awayInjuries || [],
  };
}

/**
 * Look up fixture ID by team names and date
 */
export async function lookupFixtureId(
  homeTeam: string,
  awayTeam: string,
  league: string,
  date?: string
): Promise<number | null> {
  const API_KEY = process.env.FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
  
  if (!API_KEY) {
    console.error('FOOTBALL_API_KEY not found');
    return null;
  }

  const leagueId = LEAGUE_IDS[league];
  if (!leagueId) {
    console.warn(`Unknown league: ${league}`);
    return null;
  }

  const homeTeamId = getTeamId(homeTeam);
  const awayTeamId = getTeamId(awayTeam);

  console.log(`=== TEAM ID LOOKUP ===`);
  console.log(`Home Team: "${homeTeam}" -> ID: ${homeTeamId}`);
  console.log(`Away Team: "${awayTeam}" -> ID: ${awayTeamId}`);

  if (!homeTeamId || !awayTeamId) {
    console.error(`❌ Could not find team IDs for: ${homeTeam} (${homeTeamId}) or ${awayTeam} (${awayTeamId})`);
    console.error(`   Available team names in mapping:`, Object.keys(TEAM_IDS).slice(0, 10).join(', '), '...');
    return null;
  }

  try {
    // Build date range (today to 7 days ahead)
    // Handle date input - could be ISO string or Date object
    let today: string;
    if (date) {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      today = dateObj.toISOString().split('T')[0];
    } else {
      today = new Date().toISOString().split('T')[0];
    }
    
    // Also search backwards 7 days in case the match is in the past
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - 7);
    const pastDateStr = pastDate.toISOString().split('T')[0];
    
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const season = getCurrentSeason();
    
    console.log(`=== LOOKUP FIXTURE ID ===`);
    console.log(`Home Team: ${homeTeam} (ID: ${homeTeamId})`);
    console.log(`Away Team: ${awayTeam} (ID: ${awayTeamId})`);
    console.log(`League: ${league} (ID: ${leagueId})`);
    console.log(`Date input: ${date}`);
    console.log(`Date range: ${pastDateStr} to ${futureDateStr} (centered on ${today})`);
    console.log(`Season: ${season}`);
    console.log(`API Key exists: ${!!API_KEY}`);
    console.log(`API Key length: ${API_KEY?.length || 0}`);
    
    // Search for fixtures with both teams - search wider date range
    const url = `${BASE_URL}/fixtures?league=${leagueId}&season=${season}&from=${pastDateStr}&to=${futureDateStr}&team=${homeTeamId}`;
    console.log(`Fetching: ${url.replace(API_KEY, 'API_KEY_HIDDEN')}`);
    
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to lookup fixture: ${response.status}`);
      console.error(`Error response: ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`Response data keys:`, Object.keys(data));
    console.log(`Number of fixtures: ${data.response?.length || 0}`);
    
    const fixtures = data.response || [];

    // Log all fixtures found
    if (fixtures.length > 0) {
      console.log(`Found ${fixtures.length} fixtures, searching for match...`);
      fixtures.forEach((f: any, idx: number) => {
        console.log(`  Fixture ${idx + 1}: ${f.teams.home.name} (${f.teams.home.id}) vs ${f.teams.away.name} (${f.teams.away.id})`);
      });
    }

    // Find fixture matching both teams
    const fixture = fixtures.find((f: any) => 
      (f.teams.home.id === homeTeamId && f.teams.away.id === awayTeamId) ||
      (f.teams.home.id === awayTeamId && f.teams.away.id === homeTeamId)
    );

    if (fixture) {
      console.log(`✅ Found fixture ID: ${fixture.fixture.id}`);
      return fixture.fixture.id;
    }

    console.warn(`❌ No fixture found for ${homeTeam} vs ${awayTeam}`);
    console.warn(`   Searched ${fixtures.length} fixtures`);
    return null;
  } catch (error) {
    console.error('❌ Error looking up fixture ID:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    return null;
  }
}

/**
 * Enrich multiple matches in parallel
 */
export async function getEnrichedMatchesData(fixtureIds: number[]) {
  const API_KEY = process.env.FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;

  if (!API_KEY) {
    console.error('FOOTBALL_API_KEY not found in environment variables');
    return [];
  }

  const enrichedMatches = [];

  for (const fixtureId of fixtureIds) {
    try {
      console.log(`\n=== ENRICHING FIXTURE ${fixtureId} ===`);
      console.log(`Fetching fixture ${fixtureId}...`);
      
      // 1. Get fixture
      const fixtureResponse = await fetch(
        `https://v3.football.api-sports.io/fixtures?id=${fixtureId}`,
        {
          headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': 'v3.football.api-sports.io'
          }
        }
      );

      if (!fixtureResponse.ok) {
        console.error(`Failed to fetch fixture ${fixtureId}: ${fixtureResponse.status} ${fixtureResponse.statusText}`);
        continue;
      }

      const fixtureData = await fixtureResponse.json();
      
      console.log(`Fixture ${fixtureId} response:`, JSON.stringify(fixtureData, null, 2));
      
      // Check if response has data
      if (!fixtureData.response || fixtureData.response.length === 0) {
        console.error(`No fixture data returned for ID ${fixtureId}`);
        console.error(`Response structure:`, Object.keys(fixtureData));
        continue;
      }

      const fixture = fixtureData.response[0]; // Get first element of response array
      
      console.log(`Fixture object keys:`, Object.keys(fixture || {}));
      console.log(`Fixture.fixture keys:`, Object.keys(fixture?.fixture || {}));
      console.log(`Referee in fixture.fixture:`, fixture?.fixture?.referee);
      console.log(`Referee in fixture:`, fixture?.referee);
      
      // Validate fixture structure
      if (!fixture || !fixture.teams || !fixture.teams.home || !fixture.teams.away) {
        console.error(`Invalid fixture structure for ID ${fixtureId}`);
        console.error(`Fixture keys:`, fixture ? Object.keys(fixture) : 'fixture is null/undefined');
        continue;
      }
      
      const homeTeamId = fixture.teams.home.id;
      const awayTeamId = fixture.teams.away.id;
      
      if (!homeTeamId || !awayTeamId) {
        console.error(`Missing team IDs for fixture ${fixtureId}. Home: ${homeTeamId}, Away: ${awayTeamId}`);
        continue;
      }
      
      console.log(`Teams: ${fixture.teams.home.name} (${homeTeamId}) vs ${fixture.teams.away.name} (${awayTeamId})`);
      
      // 2. Get team statistics AND standings (position/points come from standings)
      console.log('Calling Team Statistics API...');
      const season = getCurrentSeason();
      const leagueId = 39; // Premier League
      
      const [homeStatsData, awayStatsData, standingsData, homeScorers, awayScorers, h2hData, fotMobData] = await Promise.all([
        fetch(`https://v3.football.api-sports.io/teams/statistics?league=${leagueId}&season=${season}&team=${homeTeamId}`, {
          headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
        }).then(r => r.json()),
        fetch(`https://v3.football.api-sports.io/teams/statistics?league=${leagueId}&season=${season}&team=${awayTeamId}`, {
          headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
        }).then(r => r.json()),
        // Fetch standings to get position and points
        fetch(`https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`, {
          headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
        }).then(r => r.json()),
        // Fetch top scorers for both teams
        fetchTopScorers(homeTeamId, leagueId, season),
        fetchTopScorers(awayTeamId, leagueId, season),
        // Fetch head-to-head data
        fetchHeadToHead(homeTeamId, awayTeamId),
        // Fetch injuries and referee from FotMob
        fetchFotMobMatchData(fixture.teams.home.name, fixture.teams.away.name, fixture.fixture.date).catch((error) => {
          console.error('FotMob fetch failed:', error);
          return { homeInjuries: [], awayInjuries: [], referee: null, useApiFootball: true };
        })
      ]);
      
      // Extract injuries and referee from FotMob data
      let homeInjuries = fotMobData?.homeInjuries || [];
      let awayInjuries = fotMobData?.awayInjuries || [];
      let fotMobReferee = fotMobData?.referee || null;
      
      console.log('=== FOTMOB DATA EXTRACTION ===');
      console.log(`FotMob useApiFootball flag: ${fotMobData?.useApiFootball}`);
      console.log(`Home injuries: ${homeInjuries.length}, Away injuries: ${awayInjuries.length}, Referee from FotMob: ${fotMobReferee || 'null'}`);
      
      // Check if referee is in the fixture data
      console.log('=== CHECKING REFEREE IN FIXTURE ===');
      console.log(`fixture.fixture.referee: ${fixture.fixture.referee || 'null'}`);
      console.log(`fixture.referee: ${fixture.referee || 'null'}`);
      
      // If FotMob failed (401 or no data), fallback to API-Football injuries endpoint
      const shouldUseApiFootball = fotMobData?.useApiFootball || (homeInjuries.length === 0 && awayInjuries.length === 0 && !fotMobReferee);
      console.log(`Should use API-Football fallback: ${shouldUseApiFootball}`);
      
      if (shouldUseApiFootball) {
        console.log('FotMob data unavailable, fetching from API-Football injuries endpoint');
        console.log(`Fetching injuries for team ${homeTeamId} (home) and ${awayTeamId} (away) in league ${leagueId}, season ${season}`);
        
        try {
          const [apiFootballHomeInjuries, apiFootballAwayInjuries] = await Promise.all([
            fetchTeamInjuries(homeTeamId, leagueId, season),
            fetchTeamInjuries(awayTeamId, leagueId, season)
          ]);
          
          console.log(`API-Football injuries response: ${apiFootballHomeInjuries.length} home, ${apiFootballAwayInjuries.length} away`);
          
          if (apiFootballHomeInjuries && apiFootballHomeInjuries.length > 0) {
            console.log('Sample home injury from API-Football:', JSON.stringify(apiFootballHomeInjuries[0], null, 2));
          }
          if (apiFootballAwayInjuries && apiFootballAwayInjuries.length > 0) {
            console.log('Sample away injury from API-Football:', JSON.stringify(apiFootballAwayInjuries[0], null, 2));
          }
          
          homeInjuries = apiFootballHomeInjuries || [];
          awayInjuries = apiFootballAwayInjuries || [];
          console.log(`Final injuries after API-Football fallback: ${homeInjuries.length} home, ${awayInjuries.length} away`);
          
          // Also try to get referee from API-Football fixture if not already set
          if (!fotMobReferee) {
            const apiFootballReferee = fixture.fixture?.referee || fixture.referee || null;
            if (apiFootballReferee) {
              fotMobReferee = apiFootballReferee;
              console.log(`✅ Got referee from API-Football fixture: ${fotMobReferee}`);
            } else {
              console.log('❌ No referee found in API-Football fixture');
              console.log('Checking fixture structure for referee...');
              console.log('fixture.fixture keys:', Object.keys(fixture.fixture || {}));
              if (fixture.fixture) {
                console.log('fixture.fixture.referee:', fixture.fixture.referee);
                console.log('fixture.fixture.refereeId:', fixture.fixture.refereeId);
              }
              
              // Try to fetch referee from alternative API-Football endpoints
              console.log('Attempting to fetch referee from API-Football predictions endpoint...');
              try {
                const predictionsResponse = await fetch(
                  `https://v3.football.api-sports.io/predictions?fixture=${fixtureId}`,
                  {
                    headers: {
                      'x-rapidapi-key': API_KEY,
                      'x-rapidapi-host': 'v3.football.api-sports.io'
                    }
                  }
                );
                
                if (predictionsResponse.ok) {
                  const predictionsData = await predictionsResponse.json();
                  const prediction = predictionsData.response?.[0];
                  if (prediction?.fixture?.referee) {
                    fotMobReferee = prediction.fixture.referee;
                    console.log(`✅ Got referee from API-Football predictions: ${fotMobReferee}`);
                  }
                }
              } catch (e) {
                console.log('Error fetching referee from predictions endpoint:', e);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching API-Football injuries:', error);
        }
      }
      
      // Final referee check - try Google Search API as last resort if available
      let finalReferee = fotMobReferee || fixture.fixture?.referee || fixture.referee || null;
      
      if (!finalReferee && GOOGLE_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
        console.log('Attempting to fetch referee via Google Custom Search API...');
        try {
          const matchDate = new Date(fixture.fixture.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          const searchQuery = `${fixture.teams.home.name} vs ${fixture.teams.away.name} ${matchDate} referee Premier League`;
          const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&num=5`;
          
          const googleResponse = await fetch(googleSearchUrl);
          if (googleResponse.ok) {
            const googleData = await googleResponse.json();
            // Try to extract referee name from search snippets
            const snippets = googleData.items?.map((item: any) => (item.snippet || item.title || '')).join(' ') || '';
            // Look for common referee name patterns (e.g., "Referee: John Smith" or "officiated by Michael Oliver")
            const refereePatterns = [
              /(?:referee|officiating|ref):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
              /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:will\s+)?(?:referee|officiate)/i,
              /(?:referee|officiating)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
            ];
            
            for (const pattern of refereePatterns) {
              const match = snippets.match(pattern);
              if (match && match[1]) {
                finalReferee = match[1].trim();
                console.log(`✅ Found referee via Google Search: ${finalReferee}`);
                break;
              }
            }
            
            if (!finalReferee) {
              console.log('Could not extract referee name from Google Search results');
            }
          } else {
            console.log(`Google Search API returned ${googleResponse.status}`);
          }
        } catch (e) {
          console.log('Error fetching referee from Google Search API:', e);
        }
      } else if (!finalReferee && (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID)) {
        console.log('Google API credentials not configured. To enable referee search, add GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID to .env.local');
      }
      
      console.log('=== FINAL INJURIES & REFEREE ===');
      console.log(`Home injuries: ${homeInjuries.length}, Away injuries: ${awayInjuries.length}, Referee: ${finalReferee || 'null'}`);
      
      console.log('=== STANDINGS DATA ===');
      console.log('Standings response keys:', Object.keys(standingsData));
      console.log('Standings response[0] keys:', standingsData.response?.[0] ? Object.keys(standingsData.response[0]) : 'null');
      console.log('Standings league keys:', standingsData.response?.[0]?.league ? Object.keys(standingsData.response[0].league) : 'null');
      console.log('Standings structure (first 1500 chars):', JSON.stringify(standingsData.response, null, 2).substring(0, 1500));
      
      // Log the full response structure to understand what we're working with
      console.log('=== HOME STATS RESPONSE STRUCTURE ===');
      console.log('Full response (first 2000 chars):', JSON.stringify(homeStatsData.response, null, 2).substring(0, 2000));
      console.log('Response keys:', Object.keys(homeStatsData.response || {}));
      
      // Try multiple paths for position
      console.log('Position attempts:');
      console.log('  response.league.position:', homeStatsData.response?.league?.position);
      console.log('  response.league.standings[0].rank:', homeStatsData.response?.league?.standings?.[0]?.rank);
      console.log('  response.league.standings[0].position:', homeStatsData.response?.league?.standings?.[0]?.position);
      
      // Try multiple paths for points
      console.log('Points attempts:');
      console.log('  response.league.points:', homeStatsData.response?.league?.points);
      console.log('  response.league.standings[0].points:', homeStatsData.response?.league?.standings?.[0]?.points);
      
      // Try multiple paths for goals
      console.log('Goals For attempts:');
      console.log('  response.goals.for.total.all:', homeStatsData.response?.goals?.for?.total?.all);
      console.log('  response.goals.for.total:', homeStatsData.response?.goals?.for?.total);
      console.log('  response.goals.for:', homeStatsData.response?.goals?.for);
      
      console.log('Goals Against attempts:');
      console.log('  response.goals.against.total.all:', homeStatsData.response?.goals?.against?.total?.all);
      console.log('  response.goals.against.total:', homeStatsData.response?.goals?.against?.total);
      console.log('  response.goals.against:', homeStatsData.response?.goals?.against);
      
      console.log('Form:', homeStatsData.response?.form);
      
      console.log('=== AWAY STATS RESPONSE STRUCTURE ===');
      console.log('Full response (first 2000 chars):', JSON.stringify(awayStatsData.response, null, 2).substring(0, 2000));
      console.log('Response keys:', Object.keys(awayStatsData.response || {}));
      
      // Extract position and points from STANDINGS (not team statistics)
      // Standings structure: response[0].league.standings[0][0] (array of arrays) or response[0].league.standings[0] (array)
      let homePosition = 0;
      let homePoints = 0;
      let awayPosition = 0;
      let awayPoints = 0;
      
      if (standingsData.response && standingsData.response[0]?.league?.standings) {
        const standings = standingsData.response[0].league.standings;
        console.log('=== STANDINGS EXTRACTION ===');
        console.log('Standings type:', Array.isArray(standings) ? 'Array' : typeof standings);
        console.log('Standings length:', Array.isArray(standings) ? standings.length : 'N/A');
        
        // Standings can be array of arrays or just array
        let teamsArray: any[] = [];
        if (Array.isArray(standings) && standings.length > 0) {
          if (Array.isArray(standings[0])) {
            // It's an array of arrays - flatten it
            console.log('Standings is array of arrays, flattening...');
            teamsArray = standings.flat();
          } else {
            // It's a regular array
            console.log('Standings is regular array');
            teamsArray = standings;
          }
        }
        
        console.log('Teams in standings:', teamsArray.length);
        if (teamsArray.length > 0) {
          console.log('First team structure:', JSON.stringify(teamsArray[0], null, 2).substring(0, 500));
        }
        
        // Find home team in standings
        const homeTeamStanding = teamsArray.find((team: any) => team.team?.id === homeTeamId);
        if (homeTeamStanding) {
          homePosition = homeTeamStanding.rank || homeTeamStanding.position || 0;
          homePoints = homeTeamStanding.points || 0;
          console.log(`✅ Found home team in standings: Position ${homePosition}, Points ${homePoints}`);
          console.log('Home team standing keys:', Object.keys(homeTeamStanding));
        } else {
          console.log(`❌ Home team ${homeTeamId} not found in standings`);
          console.log('Available team IDs in standings:', teamsArray.map((t: any) => t.team?.id).filter(Boolean).slice(0, 10));
        }
        
        // Find away team in standings
        const awayTeamStanding = teamsArray.find((team: any) => team.team?.id === awayTeamId);
        if (awayTeamStanding) {
          awayPosition = awayTeamStanding.rank || awayTeamStanding.position || 0;
          awayPoints = awayTeamStanding.points || 0;
          console.log(`✅ Found away team in standings: Position ${awayPosition}, Points ${awayPoints}`);
          console.log('Away team standing keys:', Object.keys(awayTeamStanding));
        } else {
          console.log(`❌ Away team ${awayTeamId} not found in standings`);
          console.log('Available team IDs in standings:', teamsArray.map((t: any) => t.team?.id).filter(Boolean).slice(0, 10));
        }
      } else {
        console.log('❌ No standings data available');
        console.log('Standings response structure:', JSON.stringify(standingsData, null, 2).substring(0, 1000));
      }
        
      // Goals are in goals.for.total.total (not .all!)
      // From the API: "goals": { "for": { "total": { "total": 19 } } }
      const homeGoalsFor = homeStatsData.response?.goals?.for?.total?.total || 0;
      const homeGoalsAgainst = homeStatsData.response?.goals?.against?.total?.total || 0;
      const homeForm = homeStatsData.response?.form || '';
      
      const awayGoalsFor = awayStatsData.response?.goals?.for?.total?.total || 0;
      const awayGoalsAgainst = awayStatsData.response?.goals?.against?.total?.total || 0;
      const awayForm = awayStatsData.response?.form || '';
      
      // Extract cards data and calculate averages per game
      const homeGamesPlayed = homeStatsData.response?.fixtures?.played?.total || 1;
      const awayGamesPlayed = awayStatsData.response?.fixtures?.played?.total || 1;
      
      // Log the actual structure to verify what we're working with
      console.log('=== CARDS & FOULS API STRUCTURE ===');
      console.log('Home cards object:', JSON.stringify(homeStatsData.response?.cards, null, 2).substring(0, 1000));
      console.log('Home cards keys:', homeStatsData.response?.cards ? Object.keys(homeStatsData.response.cards) : 'no cards object');
      console.log('Home fouls object:', JSON.stringify(homeStatsData.response?.fouls, null, 2));
      console.log('Home response top-level keys:', Object.keys(homeStatsData.response || {}));
      
      // Calculate total yellow cards (sum across all time periods)
      // Structure: cards.yellow["0-15"] = { total: 1, percentage: "7.14%" }
      let homeYellowTotal = 0;
      if (homeStatsData.response?.cards?.yellow) {
        console.log('Home yellow cards structure:', JSON.stringify(homeStatsData.response.cards.yellow, null, 2).substring(0, 500));
        Object.values(homeStatsData.response.cards.yellow).forEach((period: any) => {
          if (period && typeof period === 'object' && period.total !== null && period.total !== undefined) {
            const periodTotal = Number(period.total) || 0;
            homeYellowTotal += periodTotal;
            console.log(`  Adding yellow card period: ${JSON.stringify(period)} = ${periodTotal} (total so far: ${homeYellowTotal})`);
          }
        });
      }
      
      let awayYellowTotal = 0;
      if (awayStatsData.response?.cards?.yellow) {
        Object.values(awayStatsData.response.cards.yellow).forEach((period: any) => {
          if (period && typeof period === 'object' && period.total !== null && period.total !== undefined) {
            awayYellowTotal += Number(period.total) || 0;
          }
        });
      }
      
      // Calculate total red cards
      let homeRedTotal = 0;
      if (homeStatsData.response?.cards?.red) {
        console.log('Home red cards structure:', JSON.stringify(homeStatsData.response.cards.red, null, 2).substring(0, 500));
        Object.values(homeStatsData.response.cards.red).forEach((period: any) => {
          if (period && typeof period === 'object' && period.total !== null && period.total !== undefined) {
            const periodTotal = Number(period.total) || 0;
            homeRedTotal += periodTotal;
            console.log(`  Adding red card period: ${JSON.stringify(period)} = ${periodTotal} (total so far: ${homeRedTotal})`);
          }
        });
      }
      
      let awayRedTotal = 0;
      if (awayStatsData.response?.cards?.red) {
        Object.values(awayStatsData.response.cards.red).forEach((period: any) => {
          if (period && typeof period === 'object' && period.total !== null && period.total !== undefined) {
            awayRedTotal += Number(period.total) || 0;
          }
        });
      }
      
      // Calculate averages per game
      const homeYellowAvg = homeGamesPlayed > 0 ? homeYellowTotal / homeGamesPlayed : 0;
      const awayYellowAvg = awayGamesPlayed > 0 ? awayYellowTotal / awayGamesPlayed : 0;
      const homeRedAvg = homeGamesPlayed > 0 ? homeRedTotal / homeGamesPlayed : 0;
      const awayRedAvg = awayGamesPlayed > 0 ? awayRedTotal / awayGamesPlayed : 0;
      
      // Fouls - Check if API provides this directly
      // API-Football team statistics may not include fouls directly
      // We'll check for it, but if not available, we should NOT estimate from cards
      const homeFoulsFromAPI = homeStatsData.response?.fouls?.total || homeStatsData.response?.fouls;
      const awayFoulsFromAPI = awayStatsData.response?.fouls?.total || awayStatsData.response?.fouls;
      
      console.log('Fouls check - Home:', {
        'response.fouls': homeStatsData.response?.fouls,
        'response.fouls?.total': homeStatsData.response?.fouls?.total,
        'extracted': homeFoulsFromAPI
      });
      
      // Only use fouls if API provides it, otherwise set to null/undefined to indicate unavailable
      const homeFoulsTotal = homeFoulsFromAPI !== undefined && homeFoulsFromAPI !== null ? Number(homeFoulsFromAPI) : null;
      const awayFoulsTotal = awayFoulsFromAPI !== undefined && awayFoulsFromAPI !== null ? Number(awayFoulsFromAPI) : null;
      const homeFoulsAvg = homeFoulsTotal !== null && homeGamesPlayed > 0 ? homeFoulsTotal / homeGamesPlayed : null;
      const awayFoulsAvg = awayFoulsTotal !== null && awayGamesPlayed > 0 ? awayFoulsTotal / awayGamesPlayed : null;
      
      console.log('=== CARDS & FOULS EXTRACTION RESULTS ===');
      console.log(`Home: Games ${homeGamesPlayed}, Yellow ${homeYellowTotal} (avg ${homeYellowAvg.toFixed(2)}), Red ${homeRedTotal} (avg ${homeRedAvg.toFixed(2)}), Fouls ${homeFoulsTotal !== null ? `${homeFoulsTotal} (avg ${homeFoulsAvg?.toFixed(2)})` : 'NOT AVAILABLE IN API'}`);
      console.log(`Away: Games ${awayGamesPlayed}, Yellow ${awayYellowTotal} (avg ${awayYellowAvg.toFixed(2)}), Red ${awayRedTotal} (avg ${awayRedAvg.toFixed(2)}), Fouls ${awayFoulsTotal !== null ? `${awayFoulsTotal} (avg ${awayFoulsAvg?.toFixed(2)})` : 'NOT AVAILABLE IN API'}`);
      
      console.log('=== GOALS EXTRACTION ===');
      console.log(`Home Goals For: ${homeGoalsFor} (from goals.for.total.total)`);
      console.log(`Home Goals Against: ${homeGoalsAgainst} (from goals.against.total.total)`);
      console.log(`Away Goals For: ${awayGoalsFor} (from goals.for.total.total)`);
      console.log(`Away Goals Against: ${awayGoalsAgainst} (from goals.against.total.total)`);
      
      // Extract advanced stats (shots, corners, etc.)
      // NOTE: Team statistics endpoint doesn't include shots/corners - need to fetch from fixtures
      console.log('=== FETCHING ADVANCED STATS FROM FIXTURES ===');
      
      // Use existing season and leagueId variables
      
      // Get all fixtures for both teams this season
      const [homeFixturesResponse, awayFixturesResponse] = await Promise.all([
        fetch(`https://v3.football.api-sports.io/fixtures?team=${homeTeamId}&league=${leagueId}&season=${season}`, {
          headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
        }).then(r => r.json()),
        fetch(`https://v3.football.api-sports.io/fixtures?team=${awayTeamId}&league=${leagueId}&season=${season}`, {
          headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
        }).then(r => r.json())
      ]);
      
      const homeFixtures = homeFixturesResponse.response || [];
      const awayFixtures = awayFixturesResponse.response || [];
      
      // Filter to only finished matches
      const finishedHomeFixtures = homeFixtures.filter((f: any) => f.fixture.status.short === 'FT');
      const finishedAwayFixtures = awayFixtures.filter((f: any) => f.fixture.status.short === 'FT');
      
      console.log(`Found ${finishedHomeFixtures.length} finished home fixtures, ${finishedAwayFixtures.length} finished away fixtures`);
      
      // Fetch statistics for all finished fixtures and aggregate
      const homeStatsPromises = finishedHomeFixtures.map((fixture: any) => 
        fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixture.fixture.id}`, {
          headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
        }).then(r => r.json()).then(data => {
          // Find the team's stats in the response
          const teamStats = data.response?.find((stat: any) => stat.team.id === homeTeamId);
          return teamStats?.statistics || [];
        })
      );
      
      const awayStatsPromises = finishedAwayFixtures.map((fixture: any) =>
        fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixture.fixture.id}`, {
          headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
        }).then(r => r.json()).then(data => {
          const teamStats = data.response?.find((stat: any) => stat.team.id === awayTeamId);
          return teamStats?.statistics || [];
        })
      );
      
      const [homeAllStats, awayAllStats] = await Promise.all([
        Promise.all(homeStatsPromises),
        Promise.all(awayStatsPromises)
      ]);
      
      // Aggregate shots, shots on target, and corners
      let homeShotsTotal = 0;
      let homeShotsOnTarget = 0;
      let homeCornersTotal = 0;
      
      let awayShotsTotal = 0;
      let awayShotsOnTarget = 0;
      let awayCornersTotal = 0;
      
      // Log first match stats to see what types are available
      if (homeAllStats.length > 0 && homeAllStats[0].length > 0) {
        console.log('Sample home match stats types:', homeAllStats[0].map((s: any) => s.type));
        console.log('Sample home match stats:', JSON.stringify(homeAllStats[0].slice(0, 10), null, 2));
      }
      
      homeAllStats.forEach((matchStats: any[]) => {
        matchStats.forEach((stat: any) => {
          const statType = stat.type?.toLowerCase() || '';
          // Try multiple variations for shots total
          // Match: "Shots Total", "Total Shots", "Shots", etc.
          if (statType.includes('shot') && !statType.includes('on') && !statType.includes('target') && !statType.includes('goal') && !statType.includes('off')) {
            homeShotsTotal += parseInt(stat.value) || 0;
          }
          // Try multiple variations for shots on target
          // Match: "Shots on Goal", "Shots on Target", "On Target", etc.
          if (statType.includes('shot') && (statType.includes('on') || statType.includes('target') || statType.includes('goal'))) {
            homeShotsOnTarget += parseInt(stat.value) || 0;
          }
          // Try multiple variations for corners
          if (statType.includes('corner')) {
            homeCornersTotal += parseInt(stat.value) || 0;
          }
        });
      });
      
      awayAllStats.forEach((matchStats: any[]) => {
        matchStats.forEach((stat: any) => {
          const statType = stat.type?.toLowerCase() || '';
          // Try multiple variations for shots total
          if (statType.includes('shot') && !statType.includes('on') && !statType.includes('target') && !statType.includes('goal') && !statType.includes('off')) {
            awayShotsTotal += parseInt(stat.value) || 0;
          }
          // Try multiple variations for shots on target
          if (statType.includes('shot') && (statType.includes('on') || statType.includes('target') || statType.includes('goal'))) {
            awayShotsOnTarget += parseInt(stat.value) || 0;
          }
          // Try multiple variations for corners
          if (statType.includes('corner')) {
            awayCornersTotal += parseInt(stat.value) || 0;
          }
        });
      });
      
      console.log('Aggregated stats:');
      console.log(`  Home: Shots ${homeShotsTotal}, On Target ${homeShotsOnTarget}, Corners ${homeCornersTotal}`);
      console.log(`  Away: Shots ${awayShotsTotal}, On Target ${awayShotsOnTarget}, Corners ${awayCornersTotal}`);
      
      // Calculate averages
      const homeShotsAvg = finishedHomeFixtures.length > 0 ? homeShotsTotal / finishedHomeFixtures.length : 0;
      const awayShotsAvg = finishedAwayFixtures.length > 0 ? awayShotsTotal / finishedAwayFixtures.length : 0;
      const homeShotsOnTargetAvg = finishedHomeFixtures.length > 0 ? homeShotsOnTarget / finishedHomeFixtures.length : 0;
      const awayShotsOnTargetAvg = finishedAwayFixtures.length > 0 ? awayShotsOnTarget / finishedAwayFixtures.length : 0;
      const homeCornersAvg = finishedHomeFixtures.length > 0 ? homeCornersTotal / finishedHomeFixtures.length : 0;
      const awayCornersAvg = finishedAwayFixtures.length > 0 ? awayCornersTotal / finishedAwayFixtures.length : 0;
      
      // Extract xG (expected goals) - API might not have this in team statistics
      // May need to use fixtures/statistics endpoint instead
      const homeXG = homeStatsData.response?.expected_goals?.for || null;
      const awayXG = awayStatsData.response?.expected_goals?.for || null;
      const homeXGAvg = homeXG !== null && homeGamesPlayed > 0 ? homeXG / homeGamesPlayed : null;
      const awayXGAvg = awayXG !== null && awayGamesPlayed > 0 ? awayXG / awayGamesPlayed : null;
      
      console.log('=== ADVANCED STATS EXTRACTION ===');
      console.log(`Home: Shots ${homeShotsTotal} (avg ${homeShotsAvg.toFixed(1)}), On Target ${homeShotsOnTarget} (avg ${homeShotsOnTargetAvg.toFixed(1)}), Corners ${homeCornersTotal} (avg ${homeCornersAvg.toFixed(1)}), xG ${homeXG !== null ? `${homeXG} (avg ${homeXGAvg?.toFixed(1)})` : 'NOT AVAILABLE'}`);
      console.log(`Away: Shots ${awayShotsTotal} (avg ${awayShotsAvg.toFixed(1)}), On Target ${awayShotsOnTarget} (avg ${awayShotsOnTargetAvg.toFixed(1)}), Corners ${awayCornersTotal} (avg ${awayCornersAvg.toFixed(1)}), xG ${awayXG !== null ? `${awayXG} (avg ${awayXGAvg?.toFixed(1)})` : 'NOT AVAILABLE'}`);
      
      console.log('=== EXTRACTED VALUES ===');
      console.log(`Home: Position ${homePosition}, Points ${homePoints}, Goals For ${homeGoalsFor}, Goals Against ${homeGoalsAgainst}, Form ${homeForm}`);
      console.log(`Away: Position ${awayPosition}, Points ${awayPoints}, Goals For ${awayGoalsFor}, Goals Against ${awayGoalsAgainst}, Form ${awayForm}`);
      
      enrichedMatches.push({
        _rawHomeStats: homeStatsData.response, // Include raw response for debugging
        _rawAwayStats: awayStatsData.response, // Include raw response for debugging
        _rawHomeScorers: homeScorers, // Include raw scorers for debugging
        _rawAwayScorers: awayScorers, // Include raw scorers for debugging
        id: fixture.fixture.id,
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        date: fixture.fixture.date,
        league: 'Premier League',
        homeTeamStats: {
          position: homePosition,
          form: homeForm ? homeForm.split('').slice(-5) : [], // Last 5 matches
          goalsFor: homeGoalsFor,
          goalsAgainst: homeGoalsAgainst,
          points: homePoints,
          topScorers: homeScorers || [],
          foulsAvg: homeFoulsAvg !== null ? homeFoulsAvg : undefined,
          yellowCardsAvg: homeYellowAvg,
          redCardsAvg: homeRedAvg,
          shotsAvg: homeShotsAvg,
          shotsOnTargetAvg: homeShotsOnTargetAvg,
          cornersAvg: homeCornersAvg,
          xGAvg: homeXGAvg !== null ? homeXGAvg : undefined,
        },
        awayTeamStats: {
          position: awayPosition,
          form: awayForm ? awayForm.split('').slice(-5) : [], // Last 5 matches
          goalsFor: awayGoalsFor,
          goalsAgainst: awayGoalsAgainst,
          points: awayPoints,
          topScorers: awayScorers || [],
          foulsAvg: awayFoulsAvg !== null ? awayFoulsAvg : undefined,
          yellowCardsAvg: awayYellowAvg,
          redCardsAvg: awayRedAvg,
          shotsAvg: awayShotsAvg,
          shotsOnTargetAvg: awayShotsOnTargetAvg,
          cornersAvg: awayCornersAvg,
          xGAvg: awayXGAvg !== null ? awayXGAvg : undefined,
        },
        h2hRecord: h2hData ? { 
          homeWins: h2hData.homeWins || 0, 
          draws: h2hData.draws || 0, 
          awayWins: h2hData.awayWins || 0 
        } : { homeWins: 0, draws: 0, awayWins: 0 },
        homeTeamInjuries: homeInjuries || [],
        awayTeamInjuries: awayInjuries || [],
        referee: finalReferee || null
      });
      
    } catch (error) {
      console.error(`Error enriching fixture ${fixtureId}:`, error);
    }
  }
  
  return enrichedMatches;
}

