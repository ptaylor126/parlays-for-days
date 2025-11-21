import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.FOOTBALL_API_KEY || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

const headers = {
  'x-rapidapi-key': API_KEY || '',
  'x-rapidapi-host': 'v3.football.api-sports.io'
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get('teamId');
  const leagueId = searchParams.get('leagueId');
  const season = searchParams.get('season') || new Date().getFullYear().toString();

  if (!teamId || !leagueId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${BASE_URL}/injuries?team=${teamId}&league=${leagueId}&season=${season}`,
      { headers }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch injuries' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=3600' } });
  } catch (error) {
    console.error('Error fetching injuries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

