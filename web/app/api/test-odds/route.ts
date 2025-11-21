import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_ODDS_API_KEY;

  console.log('=== TEST ODDS API ===');
  console.log('API Key exists:', !!apiKey);
  console.log('API Key (first 10 chars):', apiKey?.substring(0, 10));

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Test with a simple sports list call
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`
    );

    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Remaining requests:', response.headers.get('x-requests-remaining'));
    console.log('Used requests:', response.headers.get('x-requests-used'));

    return NextResponse.json({
      status: response.status,
      apiKeyValid: response.ok,
      availableSports: data,
      remainingRequests: response.headers.get('x-requests-remaining'),
      usedRequests: response.headers.get('x-requests-used'),
      requestLimit: response.headers.get('x-request-limit'),
    });
  } catch (error: any) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

