import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.FOOTBALL_API_KEY || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

const headers = {
  'x-rapidapi-key': API_KEY || '',
  'x-rapidapi-host': 'v3.football.api-sports.io'
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const homeTeamId = searchParams.get('homeTeamId');
  const awayTeamId = searchParams.get('awayTeamId');

  if (!homeTeamId || !awayTeamId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${BASE_URL}/fixtures/headtohead?h2h=${homeTeamId}-${awayTeamId}`,
      { headers }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch head-to-head data' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=3600' } });
  } catch (error) {
    console.error('Error fetching head-to-head data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

