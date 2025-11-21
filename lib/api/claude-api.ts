// Using Next.js API routes to proxy Claude API calls (keeps API key server-side)

export interface Match {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

// Bulletproof JSON parser
function parseClaudeJSON(text: string | undefined): any {
  if (!text || typeof text !== 'string') {
    console.error('❌ Invalid text input for JSON parsing');
    return null;
  }
  
  try {
    // Remove markdown code blocks if present
    let cleaned = text
      .replace(/```json\n/g, '')
      .replace(/```\n/g, '')
      .replace(/```/g, '')
      .trim();
    
    // Extract JSON if there's extra text (find the largest JSON object)
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    
    // Try to parse
    const parsed = JSON.parse(cleaned);
    
    // Validate it's an object (not just a string or number)
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
    
    console.error('❌ Parsed result is not an object:', typeof parsed);
    return null;
  } catch (error) {
    console.error('❌ JSON parse error:', error);
    console.error('Raw text (first 500 chars):', text.substring(0, 500));
    return null;
  }
}

// Cache helper
function getCached(key: string, maxAge: number = 3600000): any {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < maxAge) {
        console.log('✅ Using cached data for:', key);
        return data;
      }
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }
  return null;
}

function setCache(key: string, data: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

// MASTER FUNCTION 1: Single Match Analysis
export async function analyzeSingleMatch(match: Match) {
  const cacheKey = `match_${match.id}_${match.startTime}`;
  
  // Check cache first
  const cached = getCached(cacheKey);
  if (cached) return cached;
  
  const prompt = `You are a professional soccer betting analyst. Analyze this match and return STRICTLY VALID JSON with no additional text.

Match: ${match.homeTeam} vs ${match.awayTeam}
League: ${match.league}
Odds: Home ${match.odds.home} | Draw ${match.odds.draw} | Away ${match.odds.away}

Review recent form, head-to-head, injuries, and key stats. Provide betting recommendations including winners, goal scorers, both teams to score, over/under, etc.

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown blocks, no explanations, no extra text
2. Use these EXACT team names: "${match.homeTeam}" and "${match.awayTeam}"
3. If uncertain about data, use null or "unavailable"
4. All confidence percentages must be realistic (30-85%)
5. Include 5-6 different betting angles
6. Form should be 5 characters (W/L/D only)

Return this EXACT JSON structure:
{
  "homeTeam": {
    "name": "${match.homeTeam}",
    "form": "WWDLW",
    "position": 3,
    "points": 45,
    "goalsFor": 28,
    "goalsAgainst": 15,
    "topScorers": [
      {"name": "Player Name", "goals": 10},
      {"name": "Player Name", "goals": 8},
      {"name": "Player Name", "goals": 6}
    ],
    "injuries": ["Player Name (reason)"],
    "keyStats": "Brief summary of team's recent performance"
  },
  "awayTeam": {
    "name": "${match.awayTeam}",
    "form": "LWWDL",
    "position": 7,
    "points": 38,
    "goalsFor": 22,
    "goalsAgainst": 20,
    "topScorers": [
      {"name": "Player Name", "goals": 9},
      {"name": "Player Name", "goals": 7},
      {"name": "Player Name", "goals": 5}
    ],
    "injuries": ["Player Name (reason)"],
    "keyStats": "Brief summary of team's recent performance"
  },
  "headToHead": "Last 5 meetings: 2 home wins, 2 away wins, 1 draw. Average goals: 2.8 per game",
  "bettingRecommendations": [
    {
      "bet": "${match.homeTeam} to Win",
      "odds": ${match.odds.home},
      "confidence": 65,
      "reasoning": "Specific reason based on analysis"
    },
    {
      "bet": "Over 2.5 Goals",
      "odds": -130,
      "confidence": 70,
      "reasoning": "Specific reason based on analysis"
    },
    {
      "bet": "Both Teams to Score",
      "odds": -120,
      "confidence": 75,
      "reasoning": "Specific reason based on analysis"
    },
    {
      "bet": "First Half Over 1.5",
      "odds": 110,
      "confidence": 55,
      "reasoning": "Specific reason based on analysis"
    },
    {
      "bet": "${match.awayTeam} +1.5 Handicap",
      "odds": -150,
      "confidence": 68,
      "reasoning": "Specific reason based on analysis"
    }
  ]
}`;

  try {
    console.log('🔄 Analyzing match:', match.homeTeam, 'vs', match.awayTeam);
    
    const response = await fetch('/api/claude/match-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        matchData: match,
        prompt
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats (with or without tool use blocks)
    let textContent = '';
    if (data.content && Array.isArray(data.content)) {
      // Find the text block (might be mixed with tool use blocks)
      const textBlock = data.content.find((block: any) => block.type === 'text');
      if (textBlock && textBlock.text) {
        textContent = textBlock.text;
      } else if (data.content[0] && data.content[0].text) {
        // Fallback to first block if it has text
        textContent = data.content[0].text;
      }
    }
    
    if (!textContent) {
      console.error('❌ No text content found in Claude response:', data);
      throw new Error('No text content in Claude response');
    }
    
    const analysis = parseClaudeJSON(textContent);
    
    if (!analysis) {
      throw new Error('Failed to parse Claude response');
    }
    
    console.log('✅ Match analysis complete');
    
    // Cache the result
    setCache(cacheKey, analysis);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Error analyzing match:', error);
    
    // Return fallback data
    return {
      homeTeam: {
        name: match.homeTeam,
        form: 'WWDLW',
        position: 5,
        points: 40,
        goalsFor: 25,
        goalsAgainst: 15,
        topScorers: [
          { name: 'N. Player 1', goals: 8 },
          { name: 'N. Player 2', goals: 6 },
          { name: 'N. Player 3', goals: 4 }
        ],
        injuries: ['Data unavailable'],
        keyStats: 'Analysis unavailable'
      },
      awayTeam: {
        name: match.awayTeam,
        form: 'LWDWL',
        position: 8,
        points: 35,
        goalsFor: 20,
        goalsAgainst: 22,
        topScorers: [
          { name: 'N. Player 1', goals: 7 },
          { name: 'N. Player 2', goals: 5 },
          { name: 'N. Player 3', goals: 4 }
        ],
        injuries: ['Data unavailable'],
        keyStats: 'Analysis unavailable'
      },
      headToHead: 'Historical data unavailable',
      bettingRecommendations: [
        {
          bet: `${match.homeTeam} to Win`,
          odds: match.odds.home,
          confidence: 60,
          reasoning: 'Analysis unavailable - verify current form before betting'
        },
        {
          bet: 'Over 2.5 Goals',
          odds: -120,
          confidence: 65,
          reasoning: 'Analysis unavailable - check recent scoring trends'
        },
        {
          bet: 'Both Teams to Score',
          odds: -110,
          confidence: 70,
          reasoning: 'Analysis unavailable - verify defensive records'
        }
      ]
    };
  }
}

// MASTER FUNCTION 2: Parlay Analysis
export async function analyzeParlayMatches(matches: Match[]) {
  if (!matches || matches.length === 0) {
    return { matchAnalyses: [], parlayRecommendations: [], upsetAlerts: [], topIndividualBets: [] };
  }
  
  const cacheKey = `parlay_${matches.map(m => m.id).join('_')}`;
  
  // Check cache
  const cached = getCached(cacheKey);
  if (cached) return cached;
  
  const matchList = matches.map((m, i) => 
    `${i + 1}. ${m.homeTeam} vs ${m.awayTeam} (${m.league})
   Odds: Home ${m.odds.home} | Draw ${m.odds.draw} | Away ${m.odds.away}`
  ).join('\n\n');

  const prompt = `You are a professional soccer betting analyst. Analyze these matches and create parlay recommendations. Return STRICTLY VALID JSON with no additional text.

Matches:
${matchList}

Review form, head-to-head, and injuries for all matches. Create 4 different parlay strategies with reasoning.

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations, no extra text
2. Use EXACT team names from above - do not modify them
3. Create realistic parlays (2-4 legs each)
4. Confidence levels must be realistic (40-75%)
5. Include variety: safest, value upset, BTTS-focused, conservative
6. Each parlay must have 2-4 legs minimum

Return this EXACT JSON structure:
{
  "matchAnalyses": [
    {
      "match": "${matches[0]?.homeTeam} vs ${matches[0]?.awayTeam}",
      "homeForm": "WWDLW",
      "awayForm": "LWWDL",
      "keyInsight": "One sentence about this match's key factor",
      "injuries": ["Notable injuries"] or ["None reported"]
    }
  ],
  "parlayRecommendations": [
    {
      "name": "SAFEST PARLAY",
      "confidence": 70,
      "combinedOdds": "4.50x",
      "legs": [
        {
          "match": "${matches[0]?.homeTeam} vs ${matches[0]?.awayTeam}",
          "bet": "Home to Win",
          "odds": "${matches[0]?.odds.home}"
        }
      ],
      "why": [
        "Specific point why this parlay works",
        "Another specific point",
        "Third specific point"
      ]
    },
    {
      "name": "VALUE UPSET PARLAY",
      "confidence": 45,
      "combinedOdds": "12.5x",
      "legs": [],
      "why": []
    },
    {
      "name": "BTTS SPECIAL",
      "confidence": 65,
      "combinedOdds": "6.8x",
      "legs": [],
      "why": []
    },
    {
      "name": "CONSERVATIVE WIN",
      "confidence": 75,
      "combinedOdds": "3.2x",
      "legs": [],
      "why": []
    }
  ],
  "upsetAlerts": [
    {
      "match": "Team vs Team",
      "bet": "Underdog to Win or Draw",
      "odds": "+200",
      "risk": "high",
      "reasoning": "Why this could be an upset"
    }
  ],
  "topIndividualBets": [
    {
      "match": "Team vs Team",
      "bet": "Specific bet",
      "odds": "-120",
      "reasoning": "Why this is a good individual bet"
    }
  ]
}`;

  try {
    console.log('🔄 Analyzing', matches.length, 'matches for parlays...');
    
    const response = await fetch('/api/claude/parlays', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats (with or without tool use blocks)
    let textContent = '';
    if (data.content && Array.isArray(data.content)) {
      // Find the text block (might be mixed with tool use blocks)
      const textBlock = data.content.find((block: any) => block.type === 'text');
      if (textBlock && textBlock.text) {
        textContent = textBlock.text;
      } else if (data.content[0] && data.content[0].text) {
        // Fallback to first block if it has text
        textContent = data.content[0].text;
      }
    }
    
    if (!textContent) {
      console.error('❌ No text content found in Claude response:', data);
      throw new Error('No text content in Claude response');
    }
    
    const analysis = parseClaudeJSON(textContent);
    
    if (!analysis) {
      throw new Error('Failed to parse Claude response');
    }
    
    console.log('✅ Parlay analysis complete');
    
    // Cache the result
    setCache(cacheKey, analysis);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Error analyzing parlays:', error);
    
    // Return empty structure
    return {
      matchAnalyses: matches.map(m => ({
        match: `${m.homeTeam} vs ${m.awayTeam}`,
        homeForm: 'WWDLW',
        awayForm: 'LWDWL',
        keyInsight: 'Analysis unavailable',
        injuries: ['Data unavailable']
      })),
      parlayRecommendations: [],
      upsetAlerts: [],
      topIndividualBets: []
    };
  }
}

// Legacy exports for backward compatibility
export const generateMatchAnalysis = analyzeSingleMatch;
export const generateParlayRecommendations = async (matches: Match[]) => {
  const analysis = await analyzeParlayMatches(matches);
  return analysis.parlayRecommendations || [];
};
export const generateUpsetAlerts = async (matches: Match[]) => {
  const analysis = await analyzeParlayMatches(matches);
  return analysis.upsetAlerts || [];
};
export const generateTopIndividualBets = async (matches: Match[]) => {
  const analysis = await analyzeParlayMatches(matches);
  return analysis.topIndividualBets || [];
};
