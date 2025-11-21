"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatOdds } from "@/lib/odds";
import { getTeamBadgeUrl, needsWhiteBackground } from "@/lib/teamBadges";
import { getLeagueLogo } from "@/lib/utils/league-logos";

type MatchCardProps = {
  id?: string;
  league: string;
  time: string;
  homeTeam: { name: string; logo?: string };
  awayTeam: { name: string; logo?: string };
  oddsHome: string;
  oddsAway: string;
  oddsDraw?: string;
  selected?: boolean;
  onToggle?: () => void;
  oddsFormat?: "American" | "Decimal";
};

function TeamLogo({ teamName, logo, needsWhiteBg }: { teamName: string; logo: string; needsWhiteBg: boolean }) {
  const [showFallback, setShowFallback] = React.useState(false);

  const handleError = () => {
    setShowFallback(true);
  };

  if (showFallback) {
    // Fallback: colored circle with initials
    const isLiverpool = teamName === "Liverpool";
    const isTottenham = teamName === "Tottenham" || teamName === "Tottenham Hotspur" || teamName === "Spurs";
    
    if (isLiverpool) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600">
          <span className="text-[10px] font-bold text-white">LFC</span>
        </div>
      );
    }
    
    if (isTottenham) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
          <span className="text-[10px] font-bold text-white">THFC</span>
        </div>
      );
    }
    
    // Generic fallback
    const initials = teamName.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
        <span className="text-[10px] font-bold text-white">{initials}</span>
      </div>
    );
  }

  // Teams that need white background container
  if (needsWhiteBg) {
    const isTottenham = teamName.toLowerCase().includes('tottenham') || teamName.toLowerCase().includes('spurs');
    const containerSize = 32;
    // Tottenham needs smaller icon to fit in white circle
    const iconSize = isTottenham ? containerSize * 0.4 : containerSize * 0.8125; // 26/32 = 0.8125
    const padding = isTottenham ? containerSize * 0.3 : 3;
    
    return (
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: containerSize,
          height: containerSize,
          backgroundColor: "#FFFFFF",
          padding: `${padding}px`,
        }}
      >
        <img
          src={logo}
          alt={teamName}
          width={iconSize}
          height={iconSize}
          style={{ objectFit: "contain" }}
          onError={handleError}
        />
      </div>
    );
  }

  // Sunderland needs special handling for aspect ratio
  const isSunderland = teamName === "Sunderland" || teamName === "Sunderland AFC";
  if (isSunderland) {
    return (
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{
          width: 32,
          height: 32,
        }}
      >
        <img
          src={logo}
          alt={teamName}
          style={{ 
            objectFit: "contain", 
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            display: "block",
          }}
          onError={handleError}
        />
      </div>
    );
  }

  // Use regular img tag for better error handling
  return (
    <img
      src={logo}
      alt={teamName}
      width={32}
      height={32}
      style={{ objectFit: "contain", mixBlendMode: "normal", width: 32, height: 32 }}
      onError={handleError}
      className="h-8 w-8"
    />
  );
}

export function MatchCard(props: MatchCardProps) {
  const { id, league, time, homeTeam, awayTeam, oddsHome, oddsAway, oddsDraw = "+250", selected = false, onToggle, oddsFormat = "American" } = props;
  const router = useRouter();

  // Get team badges using API-Football badge URLs
  const homeBadgeUrl = homeTeam.logo || getTeamBadgeUrl(homeTeam.name);
  const awayBadgeUrl = awayTeam.logo || getTeamBadgeUrl(awayTeam.name);
  const leagueLogo = getLeagueLogo(league);
  const homeNeedsWhiteBg = needsWhiteBackground(homeTeam.name);
  const awayNeedsWhiteBg = needsWhiteBackground(awayTeam.name);

  return (
    <div
      className="rounded-[16px] px-6 py-4 border"
      style={{
        backgroundColor: "#1e293b",
        borderColor: selected ? "#0EA5E9" : "#334155",
        borderWidth: selected ? "1px" : "1px",
        boxShadow: selected ? "0 0 0 1px #0EA5E9" : "none",
        minHeight: 120,
      }}
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle?.();
        }
      }}
    >
      {/* Top row: league icon, time pill (centered), analyze button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Image src={leagueLogo} alt="League" width={24} height={24} style={{ filter: "brightness(0) saturate(100%) invert(59%) sepia(8%) saturate(1423%) hue-rotate(180deg) brightness(93%) contrast(88%)" }} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="rounded-[8px] px-3 py-1 text-xs font-medium text-white text-center" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
            {time}
          </span>
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full cursor-pointer"
          aria-label="Analyze match"
          style={{ background: "rgba(255, 255, 255, 0.05)", zIndex: 10, position: "relative" }}
          onClick={(e) => {
            try {
              e.preventDefault();
            e.stopPropagation();
              console.log('🔵 Analyze button clicked, match ID:', id);
            if (id) {
                console.log('🔵 Navigating to:', `/match-analysis/${id}`);
              router.push(`/match-analysis/${id}`);
              } else {
                console.error('❌ No match ID provided to analyze button');
              }
            } catch (error) {
              console.error('❌ Error in analyze button click:', error);
            }
          }}
        >
          <Image src="/assets/logos/parlays-for-days.png" alt="Analyze" width={20} height={16} />
        </button>
      </div>

      {/* Betting options: Home, Away, Draw */}
      <div className="space-y-2.5">
        {/* Home team */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center" style={{ background: "transparent" }}>
            <TeamLogo 
              teamName={homeTeam.name} 
              logo={homeBadgeUrl}
              needsWhiteBg={homeNeedsWhiteBg}
            />
          </div>
            <span className="text-sm font-medium text-text-primary" style={{ fontWeight: 500, fontSize: "14px" }}>{homeTeam.name}</span>
          </div>
          <span className="rounded-[8px] px-2 py-1 text-sm font-normal" style={{ background: "rgba(255, 255, 255, 0.05)", color: "#ffffff", fontSize: "14px" }}>
            {formatOdds(oddsHome, oddsFormat)}
          </span>
        </div>

        {/* Away team */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center" style={{ background: "transparent" }}>
            <TeamLogo 
              teamName={awayTeam.name} 
              logo={awayBadgeUrl}
              needsWhiteBg={awayNeedsWhiteBg}
            />
          </div>
            <span className="text-sm font-medium text-text-primary" style={{ fontWeight: 500, fontSize: "14px" }}>{awayTeam.name}</span>
          </div>
          <span className="rounded-[8px] px-2 py-1 text-sm font-normal" style={{ background: "rgba(255, 255, 255, 0.05)", color: "#ffffff", fontSize: "14px" }}>
            {formatOdds(oddsAway, oddsFormat)}
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="my-2.5 h-px w-full" style={{ background: "#334155" }} />

      {/* Draw */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium text-text-primary" style={{ fontWeight: 500, fontSize: "14px" }}>Draw</span>
        </div>
        <span className="rounded-[8px] px-2 py-1 text-sm font-normal" style={{ background: "rgba(255, 255, 255, 0.05)", color: "#ffffff", fontSize: "14px" }}>
          {formatOdds(oddsDraw, oddsFormat)}
        </span>
      </div>
    </div>
  );
}


