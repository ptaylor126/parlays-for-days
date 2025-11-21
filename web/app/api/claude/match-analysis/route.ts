import { NextRequest, NextResponse } from 'next/server';
import { getEnrichedMatchesData, lookupFixtureId } from '../../../../lib/footballData';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Claude API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { matchData, fixtureId, matchStartTime } = body;

    if (!matchData) {
      return NextResponse.json(
        { error: 'matchData is required' },
        { status: 400 }
      );
    }

    console.log('=== SENDING REQUEST TO API ===');
    console.log('Match ID:', matchData.id);
    console.log('Fixture ID:', fixtureId);
    console.log('Match Data:', matchData);

    // Determine fixture ID
    let resolvedFixtureId: number | null = null;
    
    // Priority 1: Use provided fixtureId
    if (fixtureId) {
      resolvedFixtureId = fixtureId;
      console.log('Using provided fixtureId:', resolvedFixtureId);
        } else {
      // Priority 2: Try to lookup fixture ID
      console.log('Fixture ID not found in match ID, would need to look up');
      try {
        const lookedUpId = await lookupFixtureId(
          matchData.homeTeam,
          matchData.awayTeam,
          matchData.league,
          matchStartTime || matchData.startTime
        );
        if (lookedUpId) {
          resolvedFixtureId = lookedUpId;
          console.log('Looked up fixture ID:', resolvedFixtureId);
        }
      } catch (error) {
        console.error('Error looking up fixture ID:', error);
      }

      // Priority 3: Try to parse matchData.id as fixture ID (if it's a numeric ID)
      if (!resolvedFixtureId && matchData.id) {
        const numericId = parseInt(matchData.id);
        if (!isNaN(numericId) && numericId.toString().length >= 6) {
          resolvedFixtureId = numericId;
          console.log('Parsed fixture ID from matchData.id:', resolvedFixtureId);
        }
      }
    }

    if (!resolvedFixtureId) {
      return NextResponse.json(
        { 
          error: 'Could not determine fixture ID',
          details: 'Please provide fixtureId in the request, or ensure matchData contains a valid fixture ID'
        },
        { status: 400 }
      );
    }

    // Fetch enriched match data
    console.log('Fetching enriched match data for fixture:', resolvedFixtureId);
    const enrichedMatches = await getEnrichedMatchesData([resolvedFixtureId]);
    
    if (!enrichedMatches || enrichedMatches.length === 0) {
      return NextResponse.json(
        { error: 'Could not fetch enriched match data' },
        { status: 404 }
      );
    }
    
    const enrichedMatchData = enrichedMatches[0];

    console.log('=== RETURNING MATCH DATA (NO CLAUDE) ===');
    console.log('Home Team:', enrichedMatchData.homeTeam);
    console.log('Away Team:', enrichedMatchData.awayTeam);
    console.log('Home Position:', enrichedMatchData.homeTeamStats.position);
    console.log('Home Form:', enrichedMatchData.homeTeamStats.form);
    console.log('Home Points:', enrichedMatchData.homeTeamStats.points);
    console.log('Home Goals For:', enrichedMatchData.homeTeamStats.goalsFor);
    console.log('Home Goals Against:', enrichedMatchData.homeTeamStats.goalsAgainst);
    console.log('Away Position:', enrichedMatchData.awayTeamStats.position);
    console.log('Away Form:', enrichedMatchData.awayTeamStats.form);
    console.log('Away Points:', enrichedMatchData.awayTeamStats.points);
    console.log('Away Goals For:', enrichedMatchData.awayTeamStats.goalsFor);
    console.log('Away Goals Against:', enrichedMatchData.awayTeamStats.goalsAgainst);
    console.log('H2H Record:', `${enrichedMatchData.h2hRecord.homeWins}W-${enrichedMatchData.h2hRecord.draws}D-${enrichedMatchData.h2hRecord.awayWins}L`);
    console.log('Home Injuries:', enrichedMatchData.homeTeamInjuries?.length || 0);
    console.log('Away Injuries:', enrichedMatchData.awayTeamInjuries?.length || 0);
    console.log('Home Top Scorers:', enrichedMatchData.homeTeamStats.topScorers?.length || 0);
    console.log('Away Top Scorers:', enrichedMatchData.awayTeamStats.topScorers?.length || 0);

    // Return enriched match data directly (bypassing Claude for now)
    return NextResponse.json(enrichedMatchData, {
      headers: { 'Cache-Control': 'public, s-maxage=3600' }
    });

  } catch (error) {
    console.error('Error in match-analysis route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
