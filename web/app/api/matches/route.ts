import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_ODDS_API_KEY;
const BASE_URL = 'https://api.the-odds-api.com/v4';
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY;
const FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';

// Get current season year (Premier League season runs Aug-May)
// For 2025, we want to use 2025/26 season data
function getCurrentSeason(): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-12
  
  // Force 2025/26 season if we're in 2025 or later
  if (currentYear >= 2025) {
    return 2025;
  }
  
  // For previous years, season starts in August, so if we're before August, use previous year
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

// Get fixtures for a specific matchweek (returns full fixture data with dates)
async function getMatchweekFixtures(matchweek: number): Promise<any[]> {
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
      
      console.log(`\n✅ Found ${validFixtures.length} fixtures for matchweek ${matchweek} (verified from ${data.response.length} total)`);
      
      // Log all fixtures with their dates
      validFixtures.forEach((fixture: any) => {
        const fixtureDate = new Date(fixture.fixture?.date || 0);
        console.log(`  ✓ ${fixture.teams.home.name} vs ${fixture.teams.away.name} (${fixtureDate.toISOString().split('T')[0]})`);
      });
      
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
      
      return validFixtures;
    }
  } catch (error) {
    console.error('Error fetching matchweek fixtures:', error);
  }
  
  return [];
}

// Get the date range (earliest to latest) for a matchweek from fixtures
function getMatchweekDateRange(fixtures: any[]): { earliest: Date; latest: Date } | null {
  if (!fixtures || fixtures.length === 0) {
    return null;
  }

  // Extract all match dates from fixtures
  const matchDates = fixtures
    .map(f => {
      if (!f.fixture?.date) return null;
      return new Date(f.fixture.date);
    })
    .filter((date): date is Date => date !== null);

  if (matchDates.length === 0) {
    return null;
  }

  // Find earliest and latest dates
  const earliestMatch = new Date(Math.min(...matchDates.map(d => d.getTime())));
  const latestMatch = new Date(Math.max(...matchDates.map(d => d.getTime())));

  // Set to start/end of day for proper range comparison
  earliestMatch.setHours(0, 0, 0, 0);
  latestMatch.setHours(23, 59, 59, 999);

  return {
    earliest: earliestMatch,
    latest: latestMatch,
  };
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
    
    // Get the fixtures for this matchweek (full fixture data with dates)
    const matchweekFixtures = await getMatchweekFixtures(currentMatchweek);
    console.log(`📋 Found ${matchweekFixtures.length} fixtures for matchweek ${currentMatchweek}`);
    
    // Extract the date range from fixtures (earliest to latest match date)
    const dateRange = getMatchweekDateRange(matchweekFixtures);
    
    if (!dateRange) {
      console.warn(`⚠️ Could not determine date range for matchweek ${currentMatchweek}, falling back to today onwards`);
    }
    
    // Get today's date at start of day for filtering upcoming matches
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for comparison
    
    // FOR DEBUGGING: Log to stderr to ensure it shows up
    console.error(`\n🔍 DATE FILTER DEBUG:`);
    console.error(`📅 Today: ${today.toISOString().split('T')[0]}`);
    if (dateRange) {
      console.error(`📅 Matchweek ${currentMatchweek} runs from ${dateRange.earliest.toISOString().split('T')[0]} to ${dateRange.latest.toISOString().split('T')[0]}`);
      console.error(`🎯 Filtering matches by date range: ${dateRange.earliest.toISOString().split('T')[0]} to ${dateRange.latest.toISOString().split('T')[0]}`);
    } else {
      console.error(`🎯 Showing matches from ${today.toISOString().split('T')[0]} onwards (upcoming matches)`);
    }

    const response = await fetch(
      `${BASE_URL}/sports/${PREMIER_LEAGUE_KEY}/odds?apiKey=${API_KEY}&regions=us&markets=h2h&oddsFormat=american`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );

    if (response.ok) {
      const data = await response.json();
      console.log(`📊 Received ${data.length} matches from odds API`);
      
      // Filter matches by date range from matchweek fixtures
      console.error(`\n🔍 FILTERING ${data.length} MATCHES:`);
      const filteredData = data.filter((game: any) => {
        if (!game.commence_time) {
          console.error(`  ❌ EXCLUDED: ${game.home_team} vs ${game.away_team} (no date)`);
          return false;
        }
        
        const gameDate = new Date(game.commence_time);
        const gameDateStr = gameDate.toISOString().split('T')[0];
        
        // If we have a date range from fixtures, filter by that range
        if (dateRange) {
          const isInRange = gameDate >= dateRange.earliest && gameDate <= dateRange.latest;
          
          if (isInRange) {
            console.error(`  ✅ INCLUDED: ${game.home_team} vs ${game.away_team} (${gameDateStr} within matchweek ${currentMatchweek} date range)`);
          } else {
            console.error(`  ❌ EXCLUDED: ${game.home_team} vs ${game.away_team} (${gameDateStr} outside matchweek ${currentMatchweek} range)`);
          }
          
          return isInRange;
        } else {
          // Fallback: filter by today onwards if we can't determine date range
          const gameDateOnly = new Date(gameDate.getFullYear(), gameDate.getMonth(), gameDate.getDate());
          const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isUpcoming = gameDateOnly.getTime() >= todayDateOnly.getTime();
          
          if (isUpcoming) {
            console.error(`  ✅ INCLUDED: ${game.home_team} vs ${game.away_team} (${gameDateStr} >= ${today.toISOString().split('T')[0]})`);
          } else {
            console.error(`  ❌ EXCLUDED: ${game.home_team} vs ${game.away_team} (${gameDateStr} < ${today.toISOString().split('T')[0]})`);
          }
          
          return isUpcoming;
        }
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

      // Final verification: double-check dates one more time (strict comparison)
      const finalVerifiedMatches = uniqueMatches.filter((game: any) => {
        if (!game.commence_time) {
          return false;
        }
        
        const gameDate = new Date(game.commence_time);
        
        // If we have a date range, verify the match is within it
        if (dateRange) {
          const isInRange = gameDate >= dateRange.earliest && gameDate <= dateRange.latest;
          
          if (!isInRange) {
            console.error(`🚫 REMOVED: ${game.home_team} vs ${game.away_team} - date ${gameDate.toISOString().split('T')[0]} is outside matchweek ${currentMatchweek} range (${dateRange.earliest.toISOString().split('T')[0]} to ${dateRange.latest.toISOString().split('T')[0]})`);
          }
          
          return isInRange;
        } else {
          // Fallback: verify date is today or in the future
          const gameDateOnly = new Date(gameDate.getFullYear(), gameDate.getMonth(), gameDate.getDate());
          const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isUpcoming = gameDateOnly.getTime() >= todayDateOnly.getTime();
          
          if (!isUpcoming) {
            console.error(`🚫 REMOVED: ${game.home_team} vs ${game.away_team} - date ${gameDate.toISOString().split('T')[0]} is before today ${today.toISOString().split('T')[0]}`);
          }
          
          return isUpcoming;
        }
      });

      // Add sport_key to each game for league identification
      const gamesWithSportKey = finalVerifiedMatches.map((game: any) => ({
        ...game,
        sport_key: PREMIER_LEAGUE_KEY,
      }));
      allMatches.push(...gamesWithSportKey);
      
      if (dateRange) {
        console.log(`✅ Final result: ${allMatches.length} verified matches (matchweek ${currentMatchweek}, date range: ${dateRange.earliest.toISOString().split('T')[0]} to ${dateRange.latest.toISOString().split('T')[0]})`);
      } else {
        console.log(`✅ Final result: ${allMatches.length} verified matches (matchweek ${currentMatchweek}, from ${today.toISOString().split('T')[0]} onwards)`);
      }
      
      // Log all included matches for verification
      allMatches.forEach((match, i) => {
        const matchDate = new Date(match.commence_time);
        console.log(`  ${i + 1}. ${match.home_team} vs ${match.away_team} (${matchDate.toISOString().split('T')[0]})`);
      });
      
      // Add headers to response for debugging
      responseHeaders.set('X-Matchweek-Number', currentMatchweek.toString());
      if (dateRange) {
        responseHeaders.set('X-Matchweek-Start', dateRange.earliest.toISOString().split('T')[0]);
        responseHeaders.set('X-Matchweek-End', dateRange.latest.toISOString().split('T')[0]);
      } else {
        responseHeaders.set('X-Min-Date', today.toISOString().split('T')[0]);
      }
      responseHeaders.set('X-Matches-Count', allMatches.length.toString());
      responseHeaders.set('X-Filtered-From', data.length.toString());
      
      console.error(`\n✅ RETURNING ${allMatches.length} matches (filtered from ${data.length})`);
      console.error(`📅 Matchweek: ${currentMatchweek}`);
      if (dateRange) {
        console.error(`📅 Date range: ${dateRange.earliest.toISOString().split('T')[0]} to ${dateRange.latest.toISOString().split('T')[0]}\n`);
      } else {
        console.error(`📅 Showing matches from: ${today.toISOString().split('T')[0]} onwards\n`);
      }
      
      return NextResponse.json(allMatches, { headers: responseHeaders });
    }
  } catch (error) {
    console.error(`Error fetching ${PREMIER_LEAGUE_KEY}:`, error);
  }

  responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  return NextResponse.json(allMatches, { headers: responseHeaders });
}

