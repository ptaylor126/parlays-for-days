import { NextRequest, NextResponse } from 'next/server';
import { getEnrichedMatchesData } from '../../../lib/footballData';


const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Claude API key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { matches } = body;

    console.log('=== PARLAY ANALYSIS START ===');
    console.log('Matches requested:', matches.length);

    // Get enriched data from API-Football
    const enrichedMatches = await getEnrichedMatchesData(matches);

    // Build structured prompt with REAL data
const matchDetails = ((enrichedMatches || []) as any[]).map((m: any, i: number) => `
MATCH ${i + 1}: ${m.home_team} vs ${m.away_team}
League Position: ${m.home_team} ${m.homeStanding.position}th (${m.homeStanding.points}pts) vs ${m.away_team} ${m.awayStanding.position}th (${m.awayStanding.points}pts)
Recent Form: ${m.home_team} ${m.homeStanding.form} vs ${m.away_team} ${m.awayStanding.form}
Odds: Home ${m.odds.home} | Draw ${m.odds.draw} | Away ${m.odds.away}
Key Injuries: ${m.home_team}: ${m.homeInjuries.length > 0 ? m.homeInjuries.join(', ') : 'None'} | ${m.away_team}: ${m.awayInjuries.length > 0 ? m.awayInjuries.join(', ') : 'None'}
    `.trim()).join('\n\n');

    const prompt = `Create 3 parlay strategies for these Premier League matches. Today is November 18, 2025.

${matchDetails}

Generate 3 different parlays with varying risk levels:
1. SAFE PICKS - High confidence (70%+), lower odds
2. BALANCED RISK - Medium confidence (60%), medium odds  
3. HIGH RISK/REWARD - Upsets and value picks (40-50%), high odds

Focus on league position and recent form. Avoid using terms like "relegation battle" early in the season.

Respond ONLY with JSON (no markdown, no extra text):

{
  "parlays": [
    {
      "type": "Safe Picks",
      "selections": ["Arsenal Win", "Man City Win", "Chelsea Win"],
      "combinedOdds": 3.2,
      "confidence": 75,
      "reasoning": "Brief explanation based on standings and form above"
    },
    {
      "type": "Balanced Risk",
      "selections": ["Arsenal Win", "Tottenham Draw", "Villa Win"],
      "combinedOdds": 6.5,
      "confidence": 62,
      "reasoning": "Mix of favorites and value picks"
    },
    {
      "type": "High Risk/Reward",
      "selections": ["Upset picks based on form"],
      "combinedOdds": 12.8,
      "confidence": 45,
      "reasoning": "Value picks with upset potential"
    }
  ]
}`;

    console.log('Prompt length:', prompt.length);
    console.log('Calling Claude API...');

    const apiBody = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user' as const,
        content: prompt
      }]
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(apiBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to generate parlays' }, { status: response.status });
    }

    const data = await response.json();
    
    console.log('=== CLAUDE RESPONSE ===');
    console.log('Status:', response.status);
    
    const textBlocks = data.content?.filter((block: any) => block.type === 'text') || [];
    let analysisText = textBlocks.map((block: any) => block.text).join('\n').trim();

    console.log('Analysis text length:', analysisText.length);

    // Clean JSON
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonStart = analysisText.indexOf('{');
    const jsonEnd = analysisText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      analysisText = analysisText.substring(jsonStart, jsonEnd + 1);
    }

    console.log('Cleaned analysis preview:', analysisText.substring(0, 200));
    console.log('=== PARLAY ANALYSIS COMPLETE ===');

    return NextResponse.json({
      analysis: analysisText,
      timestamp: new Date().toISOString()
    }, {
      headers: { 
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error in parlay analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}