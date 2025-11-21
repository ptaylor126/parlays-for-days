'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { analyzeParlayMatches } from '@/lib/api/claude-api';
import { getTeamBadgeUrl } from '@/lib/teamBadges';
import { SkeletonCard, SkeletonMatchCard } from '@/components/SkeletonCard';
import { BottomNav } from '@/components/BottomNav';
import { useBetslip } from '@/contexts/BetslipContext';
import { getShortTeamName } from '@/lib/utils';

const loadingMessages = [
  '🔍 Checking fixtures...',
  '📊 Analyzing form...',
  '💰 Looking at odds...',
  '💎 Finding value bets...'
];

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
  const { addBet } = useBetslip();
  
  // State
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchAnalyses, setMatchAnalyses] = useState<any[]>([]);
  const [parlayRecommendations, setParlayRecommendations] = useState<any[]>([]);
  const [upsetAlerts, setUpsetAlerts] = useState<any[]>([]);
  const [individualBets, setIndividualBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedParlayId, setExpandedParlayId] = useState<string | null>(null);
  const [matchweek, setMatchweek] = useState<number | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Rotate loading messages (once through the loop)
  useEffect(() => {
    if (!loading) {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    // Different delays for each transition
    const delays = [2000, 2000, 2000, 4000]; // Slower transition to last message
    
    let currentIndex = 0;
    
    const scheduleNext = () => {
      if (currentIndex < loadingMessages.length - 1) {
        const delay = delays[currentIndex] || 2000;
        intervalRef.current = setTimeout(() => {
          currentIndex++;
          setLoadingMessageIndex(currentIndex);
          if (currentIndex < loadingMessages.length - 1) {
            scheduleNext();
          }
        }, delay);
      }
    };
    
    scheduleNext();
    
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [loading]);
  
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
            className="flex items-center gap-2 text-[#90A1B9] hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-base font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
              Back
            </span>
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
        
        <div className="px-4 pb-2 pt-2">
          <p className="text-sm font-normal text-[#90A1B9]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {loadingMessages[loadingMessageIndex]}
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
          className="flex items-center gap-2 text-[#90A1B9] hover:text-white transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-base font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
            Back
          </span>
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
        <p className="text-sm font-light text-[#90A1B9] mb-3 lowercase" style={{ fontFamily: 'Inter, sans-serif' }}>
          {matches.length} {matches.length === 1 ? 'match' : 'matches'} selected
        </p>
        <div className="space-y-3">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-[#1E2936] rounded-xl px-4 py-3 border border-gray-700"
            >
              <div className="flex items-center justify-center gap-3">
                {/* Home Team Name (left side) */}
                <span className="text-white text-sm font-normal text-right flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
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
                <span className="text-white text-sm font-normal text-left flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {getShortTeamName(match.awayTeam)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* AI Parlay Recommendations */}
      {parlayRecommendations.length > 0 && (
        <div className="px-4 pb-6 pt-6">
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
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-2" style={{ 
                          backgroundColor: `${oddsColor}15`,
                          border: `1px solid ${oddsColor}40`
                        }}>
                          <span className="text-base">{emoji}</span>
                          <h3 className="text-sm font-normal uppercase tracking-wide text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {headingText}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Odds and Confidence - Top Right */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-normal" style={{ color: oddsColor, fontFamily: 'Inter, sans-serif' }}>
                          {combinedOddsValue ? `${combinedOddsValue.toFixed(2)}x` : 'N/A'}
                        </div>
                        {parlay.confidence && (
                          <p className="text-xs text-[#90A1B9] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                            ~{parlay.confidence}%
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Parlay Legs */}
                    {displayLegs.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {displayLegs.map((leg: any, legIndex: number) => {
                          const legOdds = typeof leg.odds === 'string' 
                            ? parseFloat(leg.odds.replace(/[x@+-]/g, '')) * (leg.odds.startsWith('-') ? -1 : 1)
                            : leg.odds;
                          
                          return (
                            <div key={legIndex} className="flex items-center justify-between py-1">
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
                              <div className="text-[#90A1B9] text-sm font-normal ml-2 flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {legOdds ? (legOdds > 0 ? `+${legOdds.toFixed(0)}` : `${legOdds.toFixed(0)}`) : 'N/A'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Divider */}
                    <div className="border-t border-gray-700 my-3"></div>
                    
                    {/* Combined Odds */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[#90A1B9] text-sm font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Combined Odds
                      </div>
                      <div className="text-sm font-normal" style={{ color: oddsColor, fontFamily: 'Inter, sans-serif' }}>
                        {combinedOddsValue ? `${combinedOddsValue.toFixed(2)}x` : 'N/A'}
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
                        <h4 className="text-sm font-light text-white mb-2 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                          WHY THIS WORKS
                        </h4>
                        <div className="text-sm font-light text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {(() => {
                            // If why is an array, treat each item as a separate paragraph
                            if (Array.isArray(parlay.why)) {
                              return parlay.why.map((item: string, i: number) => (
                                <p key={i} className={i > 0 ? 'mt-3' : ''}>
                                  {item.trim()}
                                </p>
                              ));
                            }
                            
                            // If it's a string, split into sentences/paragraphs
                            const whyText = typeof parlay.why === 'string' ? parlay.why : String(parlay.why);
                            
                            // Split by sentences that start with team names or common patterns
                            // Look for sentences starting with team names, "Both", etc.
                            const sentences = whyText.split(/(?<=[.!?])\s+(?=[A-Z])/);
                            
                            // Group sentences that seem to be about different fixtures
                            const paragraphs: string[] = [];
                            let currentPara = '';
                            
                            sentences.forEach((sentence) => {
                              const trimmed = sentence.trim();
                              if (!trimmed) return;
                              
                              // Check if sentence starts with a team name or "Both"
                              const startsWithTeam = /^(Chelsea|Arsenal|Liverpool|Manchester|Tottenham|Brighton|Brentford|Newcastle|West Ham|Aston Villa|Crystal Palace|Fulham|Wolves|Everton|Burnley|Sheffield|Luton|Nottingham|Bournemouth|Man City|Man United|Spurs|Both)/i.test(trimmed);
                              
                              if (startsWithTeam && currentPara) {
                                paragraphs.push(currentPara.trim());
                                currentPara = trimmed;
                              } else {
                                currentPara += (currentPara ? ' ' : '') + trimmed;
                              }
                            });
                            
                            if (currentPara) {
                              paragraphs.push(currentPara.trim());
                            }
                            
                            // If we didn't get good splits, just split by periods
                            const finalParagraphs = paragraphs.length > 1 
                              ? paragraphs 
                              : whyText.split(/\.\s+(?=[A-Z])/).filter(p => p.trim().length > 0).map(p => p.trim() + (p.endsWith('.') ? '' : '.'));
                            
                            return finalParagraphs.map((para, i) => (
                              <p key={i} className={i > 0 ? 'mt-3' : ''}>
                                {para}
                              </p>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {/* Add to Slip Button */}
                    <button
                      className="w-full text-white font-normal py-3 px-6 transition-colors"
                      style={{
                        backgroundColor: '#314158',
                        borderRadius: '16px',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      onClick={() => {
                        const oddsString = combinedOddsValue ? `${combinedOddsValue.toFixed(2)}x` : 'N/A';
                        addBet({
                          id: `parlay-${index}-${Date.now()}`,
                          label: `${headingText} - ${displayLegs.length} Legs`,
                          odds: oddsString
                        });
                      }}
                    >
                      Add to Slip
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
            ⚠️ Upset Alerts
          </h2>
          <div className="space-y-3">
            {upsetAlerts.map((alert, idx) => {
              const alertOdds = typeof alert.odds === 'string' 
                ? parseFloat(alert.odds.replace(/[x@+-]/g, '')) * (alert.odds.startsWith('-') ? -1 : 1)
                : alert.odds;
              const oddsString = alertOdds ? (alertOdds > 0 ? `+${alertOdds.toFixed(0)}` : `${alertOdds.toFixed(0)}`) : 'N/A';
              
              // Determine icon and color based on risk (assuming 'risk' property exists)
              const isHighRisk = alert.risk === 'high'; // Assuming alert.risk can be 'high' or 'medium'
              const alertIcon = isHighRisk ? '🔴' : '🟡'; // Red circle for high, yellow for medium
              const alertOddsColor = '#00D492'; // Green for odds as per design
              
              return (
                <div 
                  key={idx}
                  className="bg-[#1E2936] rounded-xl border border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xl flex-shrink-0">{alertIcon}</span>
                      <div className="text-white font-bold uppercase text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {alert.prediction || alert.bet || 'Upset Prediction'}
                      </div>
                    </div>
                    <div className="text-2xl font-bold ml-4 flex-shrink-0" style={{ color: alertOddsColor, fontFamily: 'Inter, sans-serif' }}>
                      {oddsString}
                    </div>
                  </div>
                  
                  {alert.reasoning && (
                    <p className="text-sm font-normal text-[#90A1B9] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
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
                    Add to Slip
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
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-white font-normal text-lg mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {bet.prediction || bet.bet || 'Bet'}
                      </div>
                      {bet.match && (
                        <div className="text-gray-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {bet.match}
                        </div>
                      )}
                    </div>
                    {/* Odds - Top Right */}
                    <div className="text-[#00D492] font-bold text-base ml-2 flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif' }}>
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
                    Add to Slip
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}
