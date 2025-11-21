'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { analyzeParlayMatches } from '@/lib/api/claude-api';
import { getTeamBadgeUrl } from '@/lib/teamBadges';
import { SkeletonCard, SkeletonMatchCard } from '@/components/SkeletonCard';
import { BottomNav } from '@/components/BottomNav';
import { useBetslip } from '@/contexts/BetslipContext';

// Helper function for short team names
function getShortTeamName(fullName: string, maxLength: number = 15): string {
  const alwaysShorten = [
    'Manchester City', 'Manchester United', 'Tottenham Hotspur',
    'Wolverhampton Wanderers', 'Brighton and Hove Albion',
    'Nottingham Forest', 'West Ham United', 'Newcastle United'
  ];

  const shortNames: { [key: string]: string } = {
    'Brighton and Hove Albion': 'Brighton', 'Brighton & Hove Albion': 'Brighton',
    'Ipswich Town': 'Ipswich', 'Leicester City': 'Leicester',
    'Manchester City': 'Man City', 'Manchester United': 'Man United',
    'Newcastle United': 'Newcastle', 'Nottingham Forest': "Nott'm Forest",
    'Tottenham Hotspur': 'Spurs', 'West Ham United': 'West Ham',
    'Wolverhampton Wanderers': 'Wolves', 'Wolverhampton': 'Wolves',
  };

  if (alwaysShorten.includes(fullName)) {
    return shortNames[fullName] || fullName;
  }

  if (fullName.length > maxLength && shortNames[fullName]) {
    return shortNames[fullName];
  }

  return fullName;
}

interface Match {
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

export default function ParlayAnalysis() {
  const router = useRouter();
  const { addBet, addBets } = useBetslip();
  
  // State
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchAnalyses, setMatchAnalyses] = useState<any[]>([]);
  const [parlayRecommendations, setParlayRecommendations] = useState<any[]>([]);
  const [upsetAlerts, setUpsetAlerts] = useState<any[]>([]);
  const [individualBets, setIndividualBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [expandedParlayId, setExpandedParlayId] = useState<string | null>(null);
  const [matchweek, setMatchweek] = useState<number | null>(null);
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Get matches from localStorage
        const storedMatches = localStorage.getItem('selectedMatches');
        
        if (!storedMatches) {
          setError('No matches selected');
          setLoading(false);
          return;
        }
        
        const matchObjects: Match[] = JSON.parse(storedMatches);
        
        if (!matchObjects || matchObjects.length === 0) {
          setError('No valid matches found');
          setLoading(false);
          return;
        }
        
        console.log('✅ Loaded matches:', matchObjects);
        setMatches(matchObjects);
        
        // ONE API CALL FOR EVERYTHING
        const analysis = await analyzeParlayMatches(matchObjects);
        
        setMatchAnalyses(analysis.matchAnalyses || []);
        setParlayRecommendations(analysis.parlayRecommendations || []);
        setUpsetAlerts(analysis.upsetAlerts || []);
        setIndividualBets(analysis.topIndividualBets || []);
        setMatchweek(analysis.matchweek || null);
        
      } catch (err) {
        console.error('Error loading parlay analysis:', err);
        setError('Failed to load analysis');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  // Helper to safely render form indicators
  const renderForm = (form: string | undefined) => {
    if (!form || typeof form !== 'string') {
      return <span className="text-gray-500 text-sm">No data</span>;
    }
    
    // Clean the form string - only W, L, D characters
    const cleanForm = form.toUpperCase().replace(/[^WLD]/g, '').slice(0, 5);
    
    if (cleanForm.length === 0) {
      return <span className="text-gray-500 text-sm">No data</span>;
    }
    
    return (
      <div className="flex gap-1">
        {cleanForm.split('').map((result, i) => (
          <div
            key={i}
            className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${result === 'W' ? 'bg-green-500 text-white' : 
                result === 'L' ? 'bg-red-500 text-white' : 
                'bg-gray-500 text-white'}
            `}
          >
            {result}
          </div>
        ))}
      </div>
    );
  };
  
  // Helper to format odds
  const formatOdds = (odds: number) => {
    if (!odds) return 'N/A';
    return odds > 0 ? `+${odds}` : `${odds}`;
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020618] text-white pb-20">
        <div className="pt-6 pb-4 px-4">
          <button
            onClick={() => router.push('/')}
            className="text-sm active:scale-95"
            style={{ color: "#94a3b8" }}
          >
            ← Back
          </button>
        </div>
        
        <div className="px-4 pb-6">
          <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            Parlay Analysis
          </h1>
          <p className="text-[#90A1B9] text-xs font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
            Premier League - Matchweek {matchweek || '12'}
          </p>
        </div>
        
        <div className="p-4 space-y-6">
          <div>
            <h2 className="text-lg font-normal mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>🎯 AI Parlay Recommendations</h2>
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020618]">
        <h1 className="text-2xl mb-4 text-white">{error || 'No matches selected'}</h1>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }
  
  // Main render
  return (
    <div className="min-h-screen bg-[#020618] text-white pb-20">
      {/* Top Navigation */}
      <div className="pt-6 pb-4 px-4">
        <button
          onClick={() => router.push('/')}
          className="text-sm active:scale-95"
          style={{ color: "#94a3b8" }}
        >
          ← Back
        </button>
      </div>

      {/* Page Title and Matchweek */}
      <div className="px-4 pb-6">
        <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          Parlay Analysis
        </h1>
        <p className="text-[#90A1B9] text-xs font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
          Premier League - Matchweek {matchweek || '12'}
        </p>
      </div>
      
      {/* Selected Matches List */}
      <div className="px-4 pb-4">
        <p className="text-sm font-normal text-[#90A1B9] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
          {matches.length} {matches.length === 1 ? 'match' : 'matches'} selected
        </p>
        <div className="space-y-3">
          {matches.map((match, index) => (
            <div
              key={match.id}
              className="bg-[#1E2936] rounded-xl px-4 py-3 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Numbered Badge */}
                  <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  
                  {/* Home Team Name (left side) */}
                  <span className="text-white text-base font-normal text-right flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {getShortTeamName(match.homeTeam)}
                  </span>

                  {/* Home Team Badge */}
                  <img
                    src={getTeamBadgeUrl(match.homeTeam)}
                    alt={match.homeTeam}
                    className="w-5 h-5 object-contain flex-shrink-0"
                    onError={(e) => e.currentTarget.src = '/icons/default-team-badge.svg'}
                  />

                  {/* VS */}
                  <span className="text-[#90A1B9] text-sm font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                    vs
                  </span>

                  {/* Away Team Badge */}
                  <img
                    src={getTeamBadgeUrl(match.awayTeam)}
                    alt={match.awayTeam}
                    className="w-5 h-5 object-contain flex-shrink-0"
                    onError={(e) => e.currentTarget.src = '/icons/default-team-badge.svg'}
                  />

                  {/* Away Team Name (right side) */}
                  <span className="text-white text-base font-normal text-left flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {getShortTeamName(match.awayTeam)}
                  </span>
                </div>
                
                {/* Premier League Text */}
                <div className="text-xs text-[#90A1B9] ml-3 flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {match.league}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* AI Parlay Recommendations */}
      {parlayRecommendations.length > 0 && (
        <div className="px-4 pb-6">
          <h2 className="text-lg font-normal mb-4 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
            🎯 AI Parlay Recommendations
          </h2>
          <div className="space-y-4">
            {parlayRecommendations.map((parlay, index) => {
              const parlayName = parlay.name || '';
              const isSafest = parlayName.includes('SAFEST');
              const isValueUpset = parlayName.includes('VALUE UPSET') || parlayName.includes('UPSET');
              const isBTTS = parlayName.includes('BTTS');
              const isConservative = parlayName.includes('CONSERVATIVE');
              
              // Get emoji and colors based on parlay type
              let emoji = '🟢';
              let oddsColor = '#00D492';
              let whyWorksBg = 'rgba(0, 153, 102, 0.10)';
              let headingText = parlayName;
              
              if (isSafest) {
                emoji = '🟢';
                oddsColor = '#00D492';
                whyWorksBg = 'rgba(0, 153, 102, 0.10)';
              } else if (isValueUpset) {
                emoji = '🟡';
                oddsColor = '#F9B217';
                whyWorksBg = 'rgba(225, 113, 0, 0.10)';
              } else if (isBTTS) {
                emoji = '🔵';
                oddsColor = '#4F99FD';
                whyWorksBg = 'rgba(21, 93, 252, 0.10)';
              } else if (isConservative) {
                emoji = '🟣';
                oddsColor = '#B05FF8';
                whyWorksBg = 'rgba(138, 19, 242, 0.10)';
                headingText = 'CONSERVATIVE PARLAY';
              }
              
              // Parse combinedOdds
              const combinedOddsValue = typeof parlay.combinedOdds === 'string' 
                ? parseFloat(parlay.combinedOdds.replace('x', '')) 
                : parlay.combinedOdds;
              
              // Filter legs for BTTS Special
              const displayLegs = isBTTS 
                ? (parlay.legs || []).filter((leg: any) => 
                    (leg.prediction || leg.bet || '').toLowerCase().includes('btts') ||
                    (leg.prediction || leg.bet || '').toLowerCase().includes('both teams')
                  )
                : (parlay.legs || []);
              
              return (
                <div 
                  key={index}
                  className="rounded-xl border border-gray-700 overflow-hidden"
                  style={{ backgroundColor: 'rgba(30, 41, 54, 0.5)' }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{emoji}</span>
                          <h3 className="text-base font-normal uppercase tracking-wide text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {headingText}
                          </h3>
                        </div>
                        {parlay.confidence && (
                          <p className="text-xs text-[#90A1B9] ml-7" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Confidence: ~{parlay.confidence}%
                          </p>
                        )}
                      </div>
                      
                      {/* Odds - Top Right */}
                      <div className="text-right">
                        <div className="text-2xl font-normal" style={{ color: oddsColor, fontFamily: 'Inter, sans-serif' }}>
                          {combinedOddsValue ? `${combinedOddsValue.toFixed(2)}x` : 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Parlay Legs */}
                    {displayLegs.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {displayLegs.map((leg: any, legIndex: number) => {
                          const legOdds = typeof leg.odds === 'string' 
                            ? parseFloat(leg.odds.replace(/[x@+-]/g, '')) * (leg.odds.startsWith('-') ? -1 : 1)
                            : leg.odds;
                          
                          return (
                            <div key={legIndex} className="flex items-center py-1 ml-2">
                              <div className="flex-1">
                                <div className="text-white font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  {leg.prediction || leg.bet || 'Selection'}
                                </div>
                                {leg.match && (
                                  <div className="text-gray-400 text-xs font-normal mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {leg.match}
                                  </div>
                                )}
                              </div>
                              <div className="text-[#90A1B9] text-sm font-normal ml-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {legOdds ? (legOdds > 0 ? `+${legOdds.toFixed(0)}` : `${legOdds.toFixed(0)}`) : 'N/A'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Divider */}
                    <div className="border-t border-gray-700 my-2"></div>
                    
                    {/* Combined Odds */}
                    <div className="py-2">
                      <div className="text-[#90A1B9] text-sm font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Combined Odds: {combinedOddsValue ? `${combinedOddsValue.toFixed(2)}x` : 'N/A'}
                      </div>
                    </div>
                    
                    {/* Why This Works */}
                    {parlay.why && Array.isArray(parlay.why) && parlay.why.length > 0 && (
                      <div 
                        className="rounded-lg p-3 mb-4 border"
                        style={{ 
                          backgroundColor: whyWorksBg,
                          borderColor: 'rgba(49, 65, 88, 0.5)'
                        }}
                      >
                        <h4 className="text-sm font-normal text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Why This Works
                        </h4>
                        <p className="text-sm font-light" style={{ color: '#CAD5E2', fontFamily: 'Inter, sans-serif' }}>
                          {parlay.why.join(' ')}
                        </p>
                      </div>
                    )}
                    
                    {/* Add to Betslip Button */}
                    <button
                      className="w-full text-white font-normal py-3 px-6 transition-colors"
                      style={{
                        backgroundColor: '#314158',
                        borderRadius: '16px',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      onClick={() => {
                        const betsToAdd = displayLegs.map((leg: any, idx: number) => ({
                          id: `parlay-${index}-leg-${idx}-${Date.now()}`,
                          label: `${leg.prediction || leg.bet || 'Selection'} - ${leg.match || ''}`,
                          odds: typeof leg.odds === 'string' 
                            ? leg.odds 
                            : (leg.odds > 0 ? `+${leg.odds.toFixed(0)}` : `${leg.odds.toFixed(0)}`)
                        }));
                        addBets(betsToAdd);
                      }}
                    >
                      Add to Betslip
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Upset Alerts */}
      {upsetAlerts.length > 0 && (
        <div className="px-4 pb-6">
          <h2 className="text-lg font-normal mb-4 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
            🚨 Upset Alerts
          </h2>
          <div className="space-y-3">
            {upsetAlerts.map((alert, idx) => {
              const alertOdds = typeof alert.odds === 'string' 
                ? parseFloat(alert.odds.replace(/[x@+-]/g, '')) * (alert.odds.startsWith('-') ? -1 : 1)
                : alert.odds;
              const oddsString = alertOdds ? (alertOdds > 0 ? `+${alertOdds.toFixed(0)}` : `${alertOdds.toFixed(0)}`) : 'N/A';
              
              return (
                <div 
                  key={idx}
                  className="bg-[#1E2936] rounded-xl border border-gray-700 p-4"
                >
                  <div className="mb-3">
                    <div className="text-white font-normal text-lg mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {alert.prediction || alert.bet || 'Upset Prediction'}
                    </div>
                    <div className="text-[#90A1B9] text-2xl font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {oddsString}
                    </div>
                  </div>
                  
                  {alert.reasoning && (
                    <p className="text-sm font-light text-[#90A1B9] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {alert.reasoning}
                    </p>
                  )}
                  
                  <button
                    className="w-full text-white font-normal py-3 px-6 transition-colors"
                    style={{
                      backgroundColor: '#314158',
                      borderRadius: '16px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    onClick={() => {
                      addBet({
                        id: `upset-${idx}-${Date.now()}`,
                        label: alert.prediction || alert.bet || 'Upset Prediction',
                        odds: oddsString
                      });
                    }}
                  >
                    Add to Betslip
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Top Individual Bets */}
      {individualBets.length > 0 && (
        <div className="px-4 pb-6">
          <h2 className="text-lg font-normal mb-4 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
            ⭐ Top Individual Bets
          </h2>
          <div className="space-y-3">
            {individualBets.map((bet, idx) => {
              const betOdds = typeof bet.odds === 'string' 
                ? parseFloat(bet.odds.replace(/[x@+-]/g, '')) * (bet.odds.startsWith('-') ? -1 : 1)
                : bet.odds;
              const oddsString = betOdds ? (betOdds > 0 ? `+${betOdds.toFixed(0)}` : `${betOdds.toFixed(0)}`) : 'N/A';
              
              return (
                <div 
                  key={idx}
                  className="bg-[#1E2936] rounded-xl border border-gray-700 p-4"
                >
                  <div className="mb-3">
                    <div className="text-white font-normal text-lg mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {bet.prediction || bet.bet || 'Bet'}
                    </div>
                    {bet.match && (
                      <div className="text-gray-400 text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {bet.match}
                      </div>
                    )}
                    <div className="text-[#90A1B9] text-2xl font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {oddsString}
                    </div>
                  </div>
                  
                  {bet.reasoning && (
                    <p className="text-sm font-light text-[#90A1B9] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {bet.reasoning}
                    </p>
                  )}
                  
                  <button
                    className="w-full text-white font-normal py-3 px-6 transition-colors"
                    style={{
                      backgroundColor: '#314158',
                      borderRadius: '16px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    onClick={() => {
                      addBet({
                        id: `individual-${idx}-${Date.now()}`,
                        label: bet.prediction || bet.bet || 'Bet',
                        odds: oddsString
                      });
                    }}
                  >
                    Add to Betslip
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Match-by-Match Analysis */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-normal mb-4 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          📊 Match-by-Match Analysis
        </h2>
        <div className="space-y-4">
          {matches.map((match, index) => {
            const matchAnalysis = matchAnalyses[index];
            const isExpanded = expandedMatchId === match.id;
            
            return (
              <div 
                key={match.id}
                className="bg-[#1E2936] rounded-lg border border-gray-700 overflow-hidden"
              >
                {/* Match Header */}
                <div className="p-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {getShortTeamName(match.homeTeam)}
                      </span>
                      <img 
                        src={getTeamBadgeUrl(match.homeTeam)}
                        alt={match.homeTeam}
                        className="w-5 h-5"
                        onError={(e) => {
                          e.currentTarget.src = '/icons/default-team-badge.svg';
                        }}
                      />
                    </div>
                    <span className="text-[#90A1B9] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>vs</span>
                    <div className="flex items-center gap-2">
                      <img 
                        src={getTeamBadgeUrl(match.awayTeam)}
                        alt={match.awayTeam}
                        className="w-5 h-5"
                        onError={(e) => {
                          e.currentTarget.src = '/icons/default-team-badge.svg';
                        }}
                      />
                      <span className="text-white font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {getShortTeamName(match.awayTeam)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-[#90A1B9] text-center mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {match.league}
                  </div>
                  
                  <button
                    onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                    className="w-full text-[#90A1B9] text-sm font-normal hover:text-white transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {isExpanded ? '▼ Hide Analysis' : '▶ Show Analysis'}
                  </button>
                </div>
                
                {/* Expanded Analysis */}
                {isExpanded && matchAnalysis && (
                  <div className="px-4 pb-4 border-t border-gray-700 space-y-4">
                    {/* Key Insight */}
                    {matchAnalysis.keyInsight && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-[#90A1B9] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Key Insight</h4>
                        <p className="text-sm text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>{matchAnalysis.keyInsight}</p>
                      </div>
                    )}
                    
                    {/* Recent Form */}
                    {(matchAnalysis.homeForm || matchAnalysis.awayForm) && (
                      <div>
                        <h4 className="text-sm font-medium text-[#90A1B9] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Recent Form</h4>
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{match.homeTeam}</div>
                            {renderForm(matchAnalysis.homeForm)}
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{match.awayTeam}</div>
                            {renderForm(matchAnalysis.awayForm)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Injuries */}
                    {matchAnalysis.injuries && matchAnalysis.injuries.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-[#90A1B9] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Injuries & Suspensions</h4>
                        <div className="space-y-1">
                          {matchAnalysis.injuries.map((injury: any, i: number) => (
                            <div key={i} className="text-xs text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {typeof injury === 'string' ? injury : injury?.name || 'Unknown'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
