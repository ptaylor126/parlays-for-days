import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_ODDS_API_KEY;
const BASE_URL = 'https://api.the-odds-api.com/v4';
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY;
const FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';

// Get current season year (Premier League season runs Aug-May)
function getCurrentSeason(): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-12
  // Season starts in August, so if we're before August, use previous year
  return currentMonth >= 8 ? currentYear : currentYear - 1;
}

// Get the active matchweek (current if it has unfinished matches, otherwise next)
async function getUpcomingMatchweek(): Promise<number> {
  if (!FOOTBALL_API_KEY) {
    console.warn('Football API key not configured, cannot filter by matchweek');
    return 0; // Return 0 to indicate we can't filter
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const season = getCurrentSeason();
    
    // First, try to get the current matchweek from today's fixtures
    const todayResponse = await fetch(
      `${FOOTBALL_BASE_URL}/fixtures?league=39&season=${season}&date=${today}`,
      {
        headers: {
          'x-rapidapi-key': FOOTBALL_API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      }
    );

    const todayData = await todayResponse.json();
    
    // If we have fixtures today, check their matchweek
    if (todayData.response && todayData.response.length > 0) {
      const firstFixture = todayData.response[0];
      const roundString = firstFixture.league?.round;
      
      if (roundString) {
        const currentMatchweek = parseInt(roundString.split(' - ')[1]);
        
        if (currentMatchweek) {
          // Check if this matchweek has any unfinished matches
          const round = `Regular Season - ${currentMatchweek}`;
          const matchweekResponse = await fetch(
            `${FOOTBALL_BASE_URL}/fixtures?league=39&season=${season}&round=${encodeURIComponent(round)}`,
            {
              headers: {
                'x-rapidapi-key': FOOTBALL_API_KEY,
                'x-rapidapi-host': 'v3.football.api-sports.io'
              }
            }
          );
          
          const matchweekData = await matchweekResponse.json();
          
          if (matchweekData.response && matchweekData.response.length > 0) {
            // Check if any matches are not finished
            const unfinishedMatches = matchweekData.response.filter((fixture: any) => {
              const status = fixture.fixture?.status?.short;
              return !status || status === 'NS' || status === 'TBD' || status === 'LIVE' || status === 'HT' || status === '1H' || status === '2H';
            });
            
            if (unfinishedMatches.length > 0) {
              console.log(`Current matchweek ${currentMatchweek} has ${unfinishedMatches.length} unfinished matches`);
              return currentMatchweek;
            } else {
              console.log(`Current matchweek ${currentMatchweek} is finished, looking for next matchweek`);
            }
          }
        }
      }
    }
    
    // If current matchweek is finished or no fixtures today, get the next matchweek
    // Look ahead 7 days to find the next matchweek
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    const futureResponse = await fetch(
      `${FOOTBALL_BASE_URL}/fixtures?league=39&season=${season}&from=${today}&to=${futureDateStr}`,
      {
        headers: {
          'x-rapidapi-key': FOOTBALL_API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      }
    );
    
    const futureData = await futureResponse.json();
    
    if (futureData.response && futureData.response.length > 0) {
      // Filter to only not-started matches
      const upcomingFixtures = futureData.response.filter((fixture: any) => {
        const status = fixture.fixture?.status?.short;
        return !status || status === 'NS' || status === 'TBD';
      });
      
      if (upcomingFixtures.length > 0) {
        // Get the matchweek from the earliest upcoming fixture
        const earliestFixture = upcomingFixtures.sort((a: any, b: any) => {
          const dateA = new Date(a.fixture?.date || 0).getTime();
          const dateB = new Date(b.fixture?.date || 0).getTime();
          return dateA - dateB;
        })[0];
        
        const roundString = earliestFixture.league?.round;
        if (roundString) {
          const nextMatchweek = parseInt(roundString.split(' - ')[1]);
          if (nextMatchweek) {
            console.log(`Next matchweek: ${nextMatchweek}`);
            return nextMatchweek;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching matchweek:', error);
  }
  
  return 0; // Return 0 if we can't determine matchweek
}

// Get fixtures for a specific matchweek
async function getMatchweekFixtures(matchweek: number): Promise<Array<{ homeTeam: string; awayTeam: string }>> {
  if (!FOOTBALL_API_KEY || matchweek === 0) {
    return [];
  }

  try {
    const season = getCurrentSeason();
    const round = `Regular Season - ${matchweek}`;
    const response = await fetch(
      `${FOOTBALL_BASE_URL}/fixtures?league=39&season=${season}&round=${encodeURIComponent(round)}`,
      {
        headers: {
          'x-rapidapi-key': FOOTBALL_API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      }
    );

    const data = await response.json();
    
    if (data.response && data.response.length > 0) {
      // Verify all fixtures are from the correct matchweek
      const validFixtures = data.response.filter((fixture: any) => {
        const fixtureRound = fixture.league?.round;
        if (!fixtureRound) return false;
        const fixtureMatchweek = parseInt(fixtureRound.split(' - ')[1]);
        return fixtureMatchweek === matchweek;
      });
      
      const fixtures = validFixtures.map((fixture: any) => {
        const fixtureMatchweek = parseInt(fixture.league?.round?.split(' - ')[1] || '0');
        console.log(`  ✓ Fixture: ${fixture.teams.home.name} vs ${fixture.teams.away.name} (matchweek ${fixtureMatchweek})`);
        return {
          homeTeam: fixture.teams.home.name,
          awayTeam: fixture.teams.away.name,
        };
      });
      
      console.log(`\n✅ Found ${fixtures.length} fixtures for matchweek ${matchweek} (verified from ${validFixtures.length} fixtures)`);
      
      if (validFixtures.length !== data.response.length) {
        console.warn(`⚠️ Warning: ${data.response.length - validFixtures.length} fixtures were filtered out (expected ${data.response.length}, got ${validFixtures.length})`);
        // Log which fixtures were filtered out
        data.response.forEach((fixture: any) => {
          const fixtureMatchweek = parseInt(fixture.league?.round?.split(' - ')[1] || '0');
          if (fixtureMatchweek !== matchweek) {
            console.warn(`  ⚠️ Filtered out: ${fixture.teams.home.name} vs ${fixture.teams.away.name} (matchweek ${fixtureMatchweek}, expected ${matchweek})`);
          }
        });
      }
      
      return fixtures;
    }
  } catch (error) {
    console.error('Error fetching matchweek fixtures:', error);
  }
  
  return [];
}

// Normalize team name for matching (handles variations like "Man City" vs "Manchester City")
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

// Check if a match is in the matchweek fixtures
function isMatchInMatchweek(
  homeTeam: string,
  awayTeam: string,
  matchweekFixtures: Array<{ homeTeam: string; awayTeam: string }>
): boolean {
  if (matchweekFixtures.length === 0) {
    return false; // Strict: if no fixtures, exclude all matches
  }

  const normalizedHome = normalizeTeamName(homeTeam);
  const normalizedAway = normalizeTeamName(awayTeam);

  // Check if this exact match exists in the matchweek fixtures
  const matchFound = matchweekFixtures.some(fixture => {
    const fixtureHome = normalizeTeamName(fixture.homeTeam);
    const fixtureAway = normalizeTeamName(fixture.awayTeam);
    
    // Check if teams match (in either order, but must be exact match)
    const exactMatch = (normalizedHome === fixtureHome && normalizedAway === fixtureAway);
    const reverseMatch = (normalizedHome === fixtureAway && normalizedAway === fixtureHome);
    
    return exactMatch || reverseMatch;
  });

  return matchFound;
}

export async function GET(request: Request) {
  // Disable caching for this route to ensure fresh data
  const responseHeaders = new Headers();
  responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  responseHeaders.set('Pragma', 'no-cache');
  responseHeaders.set('Expires', '0');
  
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500, headers: responseHeaders }
    );
  }

  // Only fetch Premier League matches
  const PREMIER_LEAGUE_KEY = 'soccer_epl';

  const allMatches: any[] = [];

  try {
    // Get the current/upcoming matchweek number
    const currentMatchweek = await getUpcomingMatchweek();
    console.log(`\n📅 Current matchweek: ${currentMatchweek}`);
    
    // Get the fixtures for this matchweek
    const matchweekFixtures = await getMatchweekFixtures(currentMatchweek);
    console.log(`📋 Found ${matchweekFixtures.length} fixtures for matchweek ${currentMatchweek}`);
    
    // Simple date-based filtering: Matchweek ends on Monday
    // Find the most recent Monday (or upcoming Monday if we're before it)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for comparison
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate the Monday that ends the current matchweek
    let matchweekEndDate = new Date(today);
    
    if (dayOfWeek === 0) {
      // If it's Sunday, the matchweek ended yesterday (Saturday), so use last Monday
      matchweekEndDate.setDate(today.getDate() - 6);
    } else if (dayOfWeek === 1) {
      // If it's Monday, this is the last day of the matchweek
      matchweekEndDate = new Date(today);
    } else {
      // If it's Tuesday-Saturday, go back to the most recent Monday
      matchweekEndDate.setDate(today.getDate() - (dayOfWeek - 1));
    }
    
    // Set time to end of Monday (23:59:59)
    matchweekEndDate.setHours(23, 59, 59, 999);
    
    // FOR DEBUGGING: Log to stderr to ensure it shows up
    console.error(`\n🔍 DATE FILTER DEBUG:`);
    console.error(`📅 Today: ${today.toISOString().split('T')[0]} (day ${dayOfWeek})`);
    console.error(`📅 Matchweek ends on: ${matchweekEndDate.toISOString().split('T')[0]}`);
    console.error(`🎯 Only showing matches on or before: ${matchweekEndDate.toISOString()}`);
    console.error(`🎯 Only showing matches from matchweek ${currentMatchweek}\n`);

    const response = await fetch(
      `${BASE_URL}/sports/${PREMIER_LEAGUE_KEY}/odds?apiKey=${API_KEY}&regions=us&markets=h2h&oddsFormat=american`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );

    if (response.ok) {
      const data = await response.json();
      console.log(`📊 Received ${data.length} matches from odds API`);
      
      // Filter by both date AND matchweek: Only show matches on or before the matchweek end (Monday) AND in the current matchweek
      console.error(`\n🔍 FILTERING ${data.length} MATCHES:`);
      const filteredData = data.filter((game: any) => {
        if (!game.commence_time) {
          console.error(`  ❌ EXCLUDED: ${game.home_team} vs ${game.away_team} (no date)`);
          return false;
        }
        
        // First check: Date must be on or before matchweek end (Monday)
        const gameDate = new Date(game.commence_time);
        const gameDateOnly = new Date(gameDate.getFullYear(), gameDate.getMonth(), gameDate.getDate());
        const endDateOnly = new Date(matchweekEndDate.getFullYear(), matchweekEndDate.getMonth(), matchweekEndDate.getDate());
        
        const gameDateStr = gameDateOnly.toISOString().split('T')[0];
        const endDateStr = endDateOnly.toISOString().split('T')[0];
        const gameTimestamp = gameDateOnly.getTime();
        const endTimestamp = endDateOnly.getTime();
        
        const isBeforeEnd = gameTimestamp <= endTimestamp;
        
        // Second check: Match must be in the current matchweek fixtures list
        const isInMatchweek = currentMatchweek > 0 && matchweekFixtures.length > 0 
          ? isMatchInMatchweek(game.home_team, game.away_team, matchweekFixtures)
          : true; // If we can't determine matchweek, fall back to date-only filtering
        
        const shouldInclude = isBeforeEnd && isInMatchweek;
        
        if (shouldInclude) {
          console.error(`  ✅ INCLUDED: ${game.home_team} vs ${game.away_team} (${gameDateStr} <= ${endDateStr}, matchweek ${currentMatchweek})`);
        } else {
          if (!isBeforeEnd) {
            console.error(`  ❌ EXCLUDED: ${game.home_team} vs ${game.away_team} (${gameDateStr} > ${endDateStr})`);
          } else if (!isInMatchweek) {
            console.error(`  ❌ EXCLUDED: ${game.home_team} vs ${game.away_team} (not in matchweek ${currentMatchweek} fixtures)`);
          }
        }
        
        return shouldInclude;
      });
      
      console.log(`\n✅ Date + Matchweek filter result: ${filteredData.length} matches (from ${data.length} total)`);

      // Deduplicate by match ID to ensure we don't have duplicates
      const seenIds = new Set<string>();
      const uniqueMatches = filteredData.filter((game: any) => {
        if (seenIds.has(game.id)) {
          return false;
        }
        seenIds.add(game.id);
        return true;
      });

      // Final verification: double-check dates and matchweek one more time (strict comparison)
      const finalVerifiedMatches = uniqueMatches.filter((game: any) => {
        if (!game.commence_time) {
          return false;
        }
        
        // Verify date
        const gameDate = new Date(game.commence_time);
        const gameDateOnly = new Date(gameDate.getFullYear(), gameDate.getMonth(), gameDate.getDate());
        const endDateOnly = new Date(matchweekEndDate.getFullYear(), matchweekEndDate.getMonth(), matchweekEndDate.getDate());
        
        const isBeforeEnd = gameDateOnly.getTime() <= endDateOnly.getTime();
        
        // Verify matchweek
        const isInMatchweek = currentMatchweek > 0 && matchweekFixtures.length > 0 
          ? isMatchInMatchweek(game.home_team, game.away_team, matchweekFixtures)
          : true;
        
        if (!isBeforeEnd) {
          console.error(`🚫 REMOVED: ${game.home_team} vs ${game.away_team} - date ${gameDate.toISOString().split('T')[0]} is after matchweek end ${matchweekEndDate.toISOString().split('T')[0]}`);
        } else if (!isInMatchweek) {
          console.error(`🚫 REMOVED: ${game.home_team} vs ${game.away_team} - not in matchweek ${currentMatchweek} fixtures`);
        }
        
        return isBeforeEnd && isInMatchweek;
      });

      // Add sport_key to each game for league identification
      const gamesWithSportKey = finalVerifiedMatches.map((game: any) => ({
        ...game,
        sport_key: PREMIER_LEAGUE_KEY,
      }));
      allMatches.push(...gamesWithSportKey);
      
      console.log(`✅ Final result: ${allMatches.length} verified matches (matchweek ${currentMatchweek}, before ${matchweekEndDate.toISOString().split('T')[0]})`);
      
      // Log all included matches for verification
      allMatches.forEach((match, i) => {
        const matchDate = new Date(match.commence_time);
        console.log(`  ${i + 1}. ${match.home_team} vs ${match.away_team} (${matchDate.toISOString().split('T')[0]})`);
      });
      
      // Add headers to response for debugging
      responseHeaders.set('X-Matchweek-Number', currentMatchweek.toString());
      responseHeaders.set('X-Matchweek-End', matchweekEndDate.toISOString().split('T')[0]);
      responseHeaders.set('X-Matches-Count', allMatches.length.toString());
      responseHeaders.set('X-Filtered-From', data.length.toString());
      
      console.error(`\n✅ RETURNING ${allMatches.length} matches (filtered from ${data.length})`);
      console.error(`📅 Matchweek: ${currentMatchweek}`);
      console.error(`📅 Cutoff date: ${matchweekEndDate.toISOString().split('T')[0]}\n`);
      
      return NextResponse.json(allMatches, { headers: responseHeaders });
    }
  } catch (error) {
    console.error(`Error fetching ${PREMIER_LEAGUE_KEY}:`, error);
  }

  responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  return NextResponse.json(allMatches, { headers: responseHeaders });
}

