"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useBetslip } from "@/contexts/BetslipContext";
import { getTeamBadgeUrl, needsWhiteBackground } from "@/lib/teamBadges";
import { getPredictionEmoji, getShortTeamName } from "@/lib/utils";
import { formatOdds } from "@/lib/odds";

type AIPickCardProps = {
  oddsFormat?: "American" | "Decimal";
};

type AIPick = {
  match: string;
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  odds: string;
  confidence: string;
  reasoning: string;
  matchDate?: string;
  isToday?: boolean;
  formattedDate?: string;
};

export function AIPickCard({ oddsFormat = "American" }: AIPickCardProps) {
  const { addBet } = useBetslip();
  const [aiPick, setAiPick] = useState<AIPick | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAiPick() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/ai-pick-of-day');
        const data = await response.json();

        console.log('[AIPickCard] API response:', data);

        if (data.success && data.pick) {
          console.log('[AIPickCard] Setting pick:', data.pick);
          setAiPick(data.pick);
        } else {
          console.warn('[AIPickCard] No pick available:', data.message);
          setError(data.message || 'No pick available');
        }
      } catch (err) {
        console.error('[AIPickCard] Error fetching AI pick:', err);
        setError('Failed to load AI pick');
      } finally {
        setLoading(false);
      }
    }

    fetchAiPick();
  }, []);

  const handleAddToSlip = () => {
    if (!aiPick) return;
    
    addBet({
      id: `ai-pick-${Date.now()}`,
      label: `${aiPick.match} - ${aiPick.prediction}`,
      odds: aiPick.odds,
    });
  };

  // Show nothing if loading or error (or no pick)
  if (loading || error || !aiPick) {
    return null;
  }

  return (
    <div className="relative">
      {/* AI PICK OF THE DAY Badge - overlapping at top */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 rounded-lg px-4 py-0.5"
        style={{
          backgroundColor: "#84A3BC",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        <div className="text-[10px] uppercase text-white" style={{ fontWeight: 400 }}>
          PICK OF THE DAY
        </div>
      </div>

      {/* Main Card */}
      <div
        className="rounded-[12px] p-4 pt-6 pb-3 text-white shadow-[--shadow-medium] relative overflow-hidden"
        style={{
          background: "linear-gradient(90deg, #60A5FA 0%, #1e3a8a 100%)",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        {/* Right Section: Date - positioned in top right */}
        <div className="absolute top-4 right-4 flex flex-col items-end" style={{ right: "16px", top: "16px" }}>
          {/* Show match date */}
          {aiPick.formattedDate && (() => {
            // If match is today, show "TODAY" instead of date
            if (aiPick.isToday) {
              const parts = aiPick.formattedDate.split(', ');
              const timePart = parts[parts.length - 1]; // "2:30 PM"
              
              return (
                <div 
                  className="rounded-lg px-3 py-2 flex flex-col items-end gap-0.5"
                  style={{
                    backgroundColor: "#0f172a",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  <div className="text-[10px] text-white opacity-80" style={{ fontWeight: 500 }}>
                    TODAY
                  </div>
                  <div className="text-[10px] text-white opacity-80" style={{ fontWeight: 200 }}>
                    {timePart}
                  </div>
                </div>
              );
            }
            
            // Parse formattedDate to separate date and time
            // Format is typically "Mon, Jan 15, 2:30 PM"
            const parts = aiPick.formattedDate.split(', ');
            // Remove month: "Mon, Jan 15" -> "Mon 15"
            const dateWithMonth = parts.slice(0, -1).join(', '); // "Mon, Jan 15"
            const dateWords = dateWithMonth.split(' ');
            const dayName = dateWords[0]; // "Mon"
            const dayNumber = parseInt(dateWords[dateWords.length - 1]); // 15
            
            // Add ordinal suffix
            const getOrdinalSuffix = (n: number) => {
              const j = n % 10;
              const k = n % 100;
              if (j === 1 && k !== 11) return 'st';
              if (j === 2 && k !== 12) return 'nd';
              if (j === 3 && k !== 13) return 'rd';
              return 'th';
            };
            
            const ordinalSuffix = getOrdinalSuffix(dayNumber);
            const timePart = parts[parts.length - 1]; // "2:30 PM"
            
            return (
              <div 
                className="rounded-lg px-3 py-2 flex flex-col items-end gap-0.5"
                style={{
                  backgroundColor: "#0f172a",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                <div className="text-[10px] text-white opacity-80" style={{ fontWeight: 500 }}>
                  {dayName} {dayNumber}<sup style={{ fontSize: '0.7em' }}>{ordinalSuffix}</sup>
                </div>
                <div className="text-[10px] text-white opacity-80" style={{ fontWeight: 200 }}>
                  {timePart}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Bottom Section: Confidence and Odds - positioned at bottom right, same row as button */}
        <div className="absolute bottom-3 right-4 flex items-center gap-2" style={{ right: "16px", bottom: "12px" }}>
          {/* Confidence in rounded rectangle - matching odds style with slightly different shade */}
          <div
            className="rounded-[8px] px-2 py-1 flex items-center justify-center"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              fontFamily: "var(--font-inter), sans-serif",
              minWidth: "50px",
              height: "28px",
            }}
          >
            <div className="text-[14px] text-white" style={{ fontWeight: 400 }}>~{aiPick.confidence}%</div>
          </div>

          {/* Odds in rounded rectangle - matching home page style */}
          <div
            className="rounded-[8px] px-2 py-1 flex items-center justify-center"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              fontFamily: "var(--font-inter), sans-serif",
              minWidth: "50px",
              height: "28px",
            }}
          >
            <div className="text-[14px] text-white" style={{ fontWeight: 400 }}>
              {formatOdds(aiPick.odds, oddsFormat)}
            </div>
          </div>
        </div>

        <div className="flex items-start" style={{ paddingTop: "0px", paddingRight: "120px" }}>
          {/* Left Section: Match Details */}
          <div className="flex-1">
            {/* Match Line: Team [badge] vs [badge] Team - in a pill */}
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[14px] text-white"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.28)",
                backdropFilter: "blur(4px)",
              }}
            >
              <span style={{ fontWeight: 600 }}>{getShortTeamName(aiPick.homeTeam)}</span>
              {(() => {
                const isBurnley = aiPick.homeTeam.toLowerCase().includes('burnley');
                const badgeSize = isBurnley ? 16 : 20;
                const homeNeedsWhiteBg = needsWhiteBackground(aiPick.homeTeam);
                return (
                  <div 
                    className={`flex items-center justify-center ${homeNeedsWhiteBg ? 'rounded-full' : ''}`}
                    style={{ 
                      width: "20px", 
                      height: "20px",
                      backgroundColor: homeNeedsWhiteBg ? "rgba(255, 255, 255, 0.9)" : "transparent",
                      padding: homeNeedsWhiteBg ? "2px" : "0px"
                    }}
                  >
                    <Image
                      src={getTeamBadgeUrl(aiPick.homeTeam)}
                      alt={aiPick.homeTeam}
                      width={badgeSize}
                      height={badgeSize}
                      style={{ objectFit: "contain", mixBlendMode: "normal" }}
                    />
                  </div>
                );
              })()}
              <span className="opacity-90 text-[10px]" style={{ fontWeight: 300 }}>vs</span>
              {(() => {
                const isBurnley = aiPick.awayTeam.toLowerCase().includes('burnley');
                const badgeSize = isBurnley ? 16 : 20;
                const awayNeedsWhiteBg = needsWhiteBackground(aiPick.awayTeam);
                return (
                  <div 
                    className={`flex items-center justify-center ${awayNeedsWhiteBg ? 'rounded-full' : ''}`}
                    style={{ 
                      width: "20px", 
                      height: "20px",
                      backgroundColor: awayNeedsWhiteBg ? "rgba(255, 255, 255, 0.9)" : "transparent",
                      padding: awayNeedsWhiteBg ? "2px" : "0px"
                    }}
                  >
                    <Image
                      src={getTeamBadgeUrl(aiPick.awayTeam)}
                      alt={aiPick.awayTeam}
                      width={badgeSize}
                      height={badgeSize}
                      style={{ objectFit: "contain", mixBlendMode: "normal" }}
                    />
                  </div>
                );
              })()}
              <span style={{ fontWeight: 600 }}>{getShortTeamName(aiPick.awayTeam)}</span>
            </div>

            {/* Prediction Line: Dynamic emoji + prediction - in a pill */}
            <div 
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[14px] text-white"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(4px)",
              }}
            >
              <div className="flex h-5 w-5 items-center justify-center">
                <span className="text-sm">{getPredictionEmoji(aiPick.prediction)}</span>
              </div>
              <span style={{ fontWeight: 600 }}>{aiPick.prediction}</span>
            </div>

            {/* Add to Slip Button */}
            <button
              onClick={handleAddToSlip}
              className="mt-4 rounded-[6px] px-4 py-0.5 text-white active:scale-95 transition-transform duration-100"
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                height: "26px",
                minWidth: "44px",
              }}
            >
              Add to Slip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIPickCard;
