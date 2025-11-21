"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Toast } from "./Toast";
import { useBetslip } from "@/contexts/BetslipContext";
import { getTeamBadgeUrl, needsWhiteBackground } from "@/lib/teamBadges";

type MatchBreakdownProps = {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  leaguePosition?: {
    home: { position: number; points: number };
    away: { position: number; points: number };
  };
  recentForm?: {
    home: ("W" | "L" | "D")[];
    away: ("W" | "L" | "D")[];
  };
  injuries?: {
    home: { name: string; status: string }[];
    away: { name: string; status: string }[];
  };
  headToHead?: string;
  bettingAngles?: string[];
  defaultOpen?: boolean;
};

function TeamBadge({ teamName, size = 28 }: { teamName: string; size?: number }) {
  const badgeUrl = getTeamBadgeUrl(teamName);
  const needsWhiteBg = needsWhiteBackground(teamName);
  const isTottenham = teamName.toLowerCase().includes('tottenham') || teamName.toLowerCase().includes('spurs');
  
  if (needsWhiteBg || isTottenham) {
    // Tottenham needs smaller icon to fit in white circle
    const iconSize = isTottenham ? size * 0.4 : size * 0.8;
    const padding = isTottenham ? size * 0.3 : 0;
    
    return (
      <div
        className="rounded-full flex items-center justify-center"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: "#FFFFFF",
          padding: `${padding}px`
        }}
      >
        <img
          src={badgeUrl}
          alt={teamName}
          width={iconSize}
          height={iconSize}
          style={{ objectFit: "contain" }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/icons/default-team-badge.svg';
          }}
        />
      </div>
    );
  }
  
  return (
    <div style={{ width: size, height: size }}>
      <img
        src={badgeUrl}
        alt={teamName}
        width={size}
        height={size}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

function FormIndicator({ result }: { result: "W" | "L" | "D" }) {
  const colors = {
    W: "#10b981",
    L: "#ef4444",
    D: "#64748b",
  };
  return (
    <div
      className="rounded-full flex items-center justify-center text-white"
      style={{ 
        backgroundColor: colors[result], 
        width: "24px", 
        height: "24px",
        fontSize: "14px",
        fontWeight: 600 // Semi-bold instead of bold (700)
      }}
    >
      {result}
    </div>
  );
}

export function MatchBreakdown({
  homeTeam,
  awayTeam,
  date,
  time,
  leaguePosition,
  recentForm,
  injuries,
  headToHead,
  bettingAngles,
  defaultOpen = false,
}: MatchBreakdownProps) {
  const [open, setOpen] = useState(false); // Always start collapsed
  const [showToast, setShowToast] = useState(false);
  const { addBet } = useBetslip();

  const extractBetText = (angle: string): string => {
    // Extract just the bet type from "• Man Utd to Win - Strong home record"
    const match = angle.match(/^•\s*(.+?)(?:\s*-\s*|$)/);
    return match ? match[1].trim() : angle.replace(/^•\s*/, "").split(" - ")[0].trim();
  };

  const extractOdds = (angle: string): string => {
    // Try to extract odds from the angle string
    // Format might be "• Man Utd to Win (+100) - Strong home record"
    const oddsMatch = angle.match(/\(([+-]\d+)\)/);
    if (oddsMatch) {
      return oddsMatch[1];
    }
    // Default odds if not found
    return "+100";
  };

  const [toastMessage, setToastMessage] = useState("Added to Active Betslip ✓");
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");

  const handleBetClick = (angle: string) => {
    const betText = extractBetText(angle);
    const odds = extractOdds(angle);
    
    const wasAdded = addBet({
      id: `bet-${homeTeam}-${awayTeam}-${betText}-${Date.now()}`,
      label: betText,
      odds: odds,
    });

    if (wasAdded) {
      setToastMessage("Added to Active Betslip ✓");
      setToastVariant("success");
    } else {
      setToastMessage("Bet already in betslip");
      setToastVariant("error");
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const formatDate = (dateStr: string, timeStr: string) => {
    if (dateStr === "Today" || dateStr === "Tomorrow") {
      return `${dateStr}, ${timeStr}`;
    }
    return `${dateStr}, ${timeStr}`;
  };

  const shortenTeamName = (name: string): string => {
    if (name === "Manchester United") return "Man United";
    if (name === "Manchester City") return "Man City";
    return name;
  };

  const getOrdinalSuffix = (num: number): string => {
    // Special case for 11, 12, 13
    if (num % 100 >= 11 && num % 100 <= 13) {
      return num + 'th';
    }
    
    // Check last digit
    switch (num % 10) {
      case 1: return num + 'st';
      case 2: return num + 'nd';
      case 3: return num + 'rd';
      default: return num + 'th';
    }
  };

  const shortHomeTeam = shortenTeamName(homeTeam);
  const shortAwayTeam = shortenTeamName(awayTeam);

  return (
    <div
      className="rounded-[12px] border"
      style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
    >
      {/* Collapsed Header */}
      <button
        type="button"
        className="w-full px-4 py-4 flex items-center justify-between"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex-1 text-left">
          <div className="text-base font-semibold text-white mb-1">
            {shortHomeTeam} vs {shortAwayTeam}
          </div>
          <div className="text-sm" style={{ color: "#90A1B9" }}>
            {formatDate(date, time)}
          </div>
        </div>
        <span
          className="text-xl leading-none ml-4 transition-transform duration-300"
          style={{
            color: "#90A1B9",
            fontSize: "20px",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          ›
        </span>
      </button>

      {/* Expanded Content */}
      {open && (
        <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: "#334155" }}>
          {/* Section 1: League Position */}
          {leaguePosition && (
            <div className="space-y-2">
              <div className="flex items-center gap-2" style={{ paddingTop: "16px" }}>
                <Image
                  src="/assets/icons/key-stats.svg"
                  alt="League Position"
                  width={16}
                  height={16}
                  style={{ objectFit: "contain" }}
                />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "#64748b", letterSpacing: "0.5px", fontSize: "12px" }}
                >
                  LEAGUE POSITION
                </span>
              </div>
              <p className="text-sm" style={{ color: "#90A1B9", fontWeight: 400 }}>
                {shortHomeTeam} {getOrdinalSuffix(leaguePosition.home.position)} ({leaguePosition.home.points}pts) vs{" "}
                {shortAwayTeam} {getOrdinalSuffix(leaguePosition.away.position)} ({leaguePosition.away.points}pts)
              </p>
            </div>
          )}

          {/* Section 2: Recent Form */}
          {recentForm && (
            <div className="space-y-2">
              <div className="flex items-center gap-2" style={{ paddingTop: "16px" }}>
                <Image
                  src="/assets/icons/recent-form.svg"
                  alt="Recent Form"
                  width={16}
                  height={16}
                  style={{ objectFit: "contain" }}
                />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "#64748b", letterSpacing: "0.5px", fontSize: "12px" }}
                >
                  RECENT FORM
                </span>
              </div>
              <div style={{ gap: "12px", display: "flex", flexDirection: "column" }}>
                <div className="flex items-center">
                  <TeamBadge teamName={homeTeam} size={24} />
                  <span className="text-sm text-white flex-1" style={{ marginLeft: "8px", marginRight: "8px" }}>
                    {shortHomeTeam}:
                  </span>
                  <div className="flex items-center" style={{ gap: "6px" }}>
                    {recentForm.home.map((result, idx) => (
                      <FormIndicator key={idx} result={result} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  <TeamBadge teamName={awayTeam} size={24} />
                  <span className="text-sm text-white flex-1" style={{ marginLeft: "8px", marginRight: "8px" }}>
                    {shortAwayTeam}:
                  </span>
                  <div className="flex items-center" style={{ gap: "6px" }}>
                    {recentForm.away.map((result, idx) => (
                      <FormIndicator key={idx} result={result} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Injuries & Suspensions */}
          {injuries && (
            <div className="space-y-2">
              <div className="flex items-center gap-2" style={{ paddingTop: "16px" }}>
                <Image
                  src="/assets/icons/key-player-missing.svg"
                  alt="Injuries"
                  width={16}
                  height={16}
                  style={{ objectFit: "contain" }}
                />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "#64748b", letterSpacing: "0.5px", fontSize: "12px" }}
                >
                  INJURIES & SUSPENSIONS
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-white mb-2">{shortHomeTeam}:</div>
                  <div className="space-y-1">
                    {injuries.home.map((injury, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-white">{injury.name}</span>{" "}
                        <span style={{ color: "#90A1B9" }}>({injury.status})</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white mb-2">{shortAwayTeam}:</div>
                  <div className="space-y-1">
                    {injuries.away.map((injury, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-white">{injury.name}</span>{" "}
                        <span style={{ color: "#90A1B9" }}>({injury.status})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Head-to-Head */}
          {headToHead && (
            <div className="space-y-2">
              <div className="flex items-center gap-2" style={{ paddingTop: "16px" }}>
                <Image
                  src="/assets/icons/head-to-head.svg"
                  alt="Head-to-Head"
                  width={16}
                  height={16}
                  style={{ objectFit: "contain" }}
                />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "#64748b", letterSpacing: "0.5px", fontSize: "12px" }}
                >
                  HEAD-TO-HEAD
                </span>
              </div>
              <p className="text-sm" style={{ color: "#90A1B9", fontWeight: 400 }}>
                {headToHead}
              </p>
            </div>
          )}

          {/* Section 5: Betting Angles */}
          {bettingAngles && (
            <div className="space-y-2">
              <div className="flex items-center gap-2" style={{ paddingTop: "16px" }}>
                <Image
                  src="/assets/icons/strong-home-form.svg"
                  alt="Betting Angles"
                  width={16}
                  height={16}
                  style={{ objectFit: "contain" }}
                />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "#64748b", letterSpacing: "0.5px", fontSize: "12px" }}
                >
                  BETTING ANGLES
                </span>
              </div>
              <div 
                className="flex flex-wrap gap-2"
                style={{ gap: "8px" }}
              >
                {bettingAngles.map((angle, idx) => {
                  const betText = extractBetText(angle);
                  return (
                    <button
                      key={idx}
                      className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-white active:scale-95 transition-all duration-150"
                      style={{
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        border: "1px solid #3b82f6",
                        borderRadius: "20px",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.2)";
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
                      }}
                      onClick={() => handleBetClick(angle)}
                    >
                      {betText}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      {showToast && (
        <Toast
          message={toastMessage}
          duration={2000}
          variant={toastVariant}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
