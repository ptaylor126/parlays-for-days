import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Get current season year (Premier League season runs Aug-May)
// Season 2025-2026 uses year 2025
function getCurrentSeason(): number {
  return 2025; // 2025-2026 season
}

const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY;
const FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';

// Cache for 30 minutes (reduced from 1 hour for faster updates)
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
let cachedPick: any = null;
let cacheTime = 0;

// Get the active matchweek (current if it has unfinished matches, otherwise next)
async function getUpcomingMatchweek(): Promise<number> {
  if (!FOOTBALL_API_KEY) {
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
              return currentMatchweek;
            }
          }
        }
      }
    }
    
    // If current matchweek is finished or no fixtures today, get the next matchweek
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
      // Find the earliest upcoming matchweek
      const matchweeks = new Set<number>();
      futureData.response.forEach((fixture: any) => {
        const roundString = fixture.league?.round;
        if (roundString) {
          const matchweek = parseInt(roundString.split(' - ')[1]);
          if (matchweek) matchweeks.add(matchweek);
        }
      });
      
      if (matchweeks.size > 0) {
        return Math.min(...Array.from(matchweeks));
      }
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting matchweek:', error);
    return 0;
  }
}

// Check if a match has finished
async function isMatchFinished(fixtureId: number): Promise<boolean> {
  if (!FOOTBALL_API_KEY || !fixtureId) {
    return false;
  }

  try {
    const response = await fetch(
      `${FOOTBALL_BASE_URL}/fixtures?id=${fixtureId}`,
      {
        headers: {
          'x-rapidapi-key': FOOTBALL_API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      }
    );

    const data = await response.json();
    
    if (data.response && data.response.length > 0) {
      const fixture = data.response[0];
      const status = fixture.fixture?.status?.short;
      // Match is finished if status is FT (Full Time), AET (After Extra Time), or PEN (Penalties)
      return status === 'FT' || status === 'AET' || status === 'PEN' || status === 'CANC' || status === 'SUSP' || status === 'ABAN';
    }
    
    return false;
  } catch (error) {
    console.error('Error checking match status:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  const now = Date.now();
  
  // Check cache first, but verify the match hasn't finished
  if (cachedPick && (now - cacheTime) < CACHE_DURATION) {
    // Check if the cached match has finished
    if (cachedPick.fixtureId) {
      const matchFinished = await isMatchFinished(cachedPick.fixtureId);
      if (!matchFinished) {
        // Match is still upcoming, return cached pick
        return NextResponse.json({
          success: true,
          pick: cachedPick,
          cached: true
        });
      } else {
        // Match has finished, clear cache and fetch new pick
        console.log('[AI Pick] Cached match has finished, fetching new pick');
        cachedPick = null;
        cacheTime = 0;
      }
    } else {
      // No fixture ID in cache, return it anyway (backward compatibility)
      return NextResponse.json({
        success: true,
        pick: cachedPick,
        cached: true
      });
    }
  }

  try {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const season = getCurrentSeason();
    
    if (!FOOTBALL_API_KEY) {
      return NextResponse.json({
        success: false,
        message: 'Football API key not configured'
      }, { status: 500 });
    }
    
    // Get the active matchweek (current if unfinished, otherwise next)
    const matchweek = await getUpcomingMatchweek();
    
    let matchesData;
    
    if (matchweek > 0) {
      // Filter by matchweek - get all matches from the active matchweek
      const round = `Regular Season - ${matchweek}`;
      const matchweekResponse = await fetch(
        `${FOOTBALL_BASE_URL}/fixtures?league=39&season=${season}&round=${encodeURIComponent(round)}`,
        {
          headers: {
            'x-rapidapi-key': FOOTBALL_API_KEY,
            'x-rapidapi-host': 'v3.football.api-sports.io'
          }
        }
      );
      
      matchesData = await matchweekResponse.json();
      
      // Filter to only upcoming matches (not started)
      if (matchesData.response && matchesData.response.length > 0) {
        matchesData.response = matchesData.response.filter((fixture: any) => {
          const status = fixture.fixture?.status?.short;
          return !status || status === 'NS' || status === 'TBD';
        });
      }
    } else {
      // Fallback: if we can't determine matchweek, use date range (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      const nextWeekString = nextWeek.toISOString().split('T')[0];
      
      const matchesResponse = await fetch(
        `${FOOTBALL_BASE_URL}/fixtures?league=39&season=${season}&from=${todayString}&to=${nextWeekString}&status=NS`,
        {
          headers: {
            'x-rapidapi-key': FOOTBALL_API_KEY,
            'x-rapidapi-host': 'v3.football.api-sports.io'
          }
        }
      );
      
      matchesData = await matchesResponse.json();
    }
    
    if (!matchesData.response || matchesData.response.length === 0) {
      return NextResponse.json({
        success: false,
        message: matchweek > 0 
          ? `No upcoming matches in matchweek ${matchweek}` 
          : 'No upcoming matches in next 7 days'
      });
    }
    
    // Sort by date and get the earliest upcoming match
    const upcomingMatches = matchesData.response
      .filter((fixture: any) => {
        const matchDate = new Date(fixture.fixture.date);
        return matchDate >= today;
      })
      .sort((a: any, b: any) => {
        return new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
      });
    
    if (upcomingMatches.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No upcoming matches found'
      });
    }
    
    // Get the first match (earliest upcoming)
    const nextMatch = upcomingMatches[0];
    const matchDate = nextMatch.fixture.date;
    const isToday = matchDate.split('T')[0] === todayString;
    
    // Format match info for Claude
    const matchInfo = `${nextMatch.teams.home.name} vs ${nextMatch.teams.away.name}
Home odds: ${nextMatch.odds?.values?.find((o: any) => o.value === 'Home')?.odd || 'N/A'}
Draw odds: ${nextMatch.odds?.values?.find((o: any) => o.value === 'Draw')?.odd || 'N/A'}
Away odds: ${nextMatch.odds?.values?.find((o: any) => o.value === 'Away')?.odd || 'N/A'}`;
    
    const prompt = `You are a professional soccer betting analyst. Here is an upcoming Premier League match:

${matchInfo}

Provide ONE best bet for this match. Consider value, form, and recent team news.

Return ONLY valid JSON:
{
  "match": "Team A vs Team B",
  "homeTeam": "Team A",
  "awayTeam": "Team B",
  "prediction": "Team A Win" or "Over 2.5 Goals" or "Both Teams to Score",
  "odds": "2.10",
  "confidence": "72",
  "reasoning": "Brief 1-2 sentence explanation"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });
    
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';
    
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const pick = JSON.parse(cleanedResponse);
    
    // Add match date and timing info
    const enrichedPick = {
      ...pick,
      matchDate: matchDate,
      isToday: isToday,
      fixtureId: nextMatch.fixture.id, // Store fixture ID to check if match has finished
      matchweek: matchweek, // Store matchweek for reference
      formattedDate: new Date(matchDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    };
    
    // Cache it
    cachedPick = enrichedPick;
    cacheTime = now;
    
    return NextResponse.json({
      success: true,
      pick: enrichedPick,
      cached: false
    });
    
  } catch (error) {
    console.error('Error generating AI pick:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate pick'
    }, { status: 500 });
  }
}

