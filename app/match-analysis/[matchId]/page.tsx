"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { BottomNav } from "@/components/BottomNav";
import { formatAmericanOdds } from "@/lib/utils/time";
import { useMatches } from "@/contexts/MatchContext";
import { useBetslip } from "@/contexts/BetslipContext";
import { generateMatchAnalysis } from "@/lib/api/claude-api";
import type { TeamAnalysis, MatchAnalysis } from "@/lib/api/claude-api";
import { getTeamBadgeUrl } from "@/lib/teamBadges";

type SectionProps = {
  title: string;
  icon: string;
  children: React.ReactNode;
};

function Section({ title, icon, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2" style={{ paddingTop: "4px" }}>
        <Image src={icon} alt={title} width={24} height={24} style={{ objectFit: "contain" }} />
        <span className="text-base text-text-primary" style={{ fontWeight: 500 }}>{title}</span>
      </div>
      <div
        className="rounded-[12px] border px-4 py-4"
        style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
      >
        {children}
      </div>
    </section>
  );
}

type InsightCardProps = {
  icon: string;
  title: string;
  percentage: number;
  description: string;
};

function InsightCard({ icon, title, percentage, description }: InsightCardProps) {
  return (
    <div
      className="rounded-[12px] border mb-2"
      style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src={icon} alt={title} width={20} height={20} style={{ objectFit: "contain" }} />
          <span className="text-sm font-medium text-text-primary">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2 py-1 rounded-[6px]"
            style={{ backgroundColor: "rgba(14, 165, 233, 0.2)", color: "#0EA5E9" }}
          >
            ~{percentage}%
          </span>
        </div>
      </div>
      <div className="px-4 pb-3 text-sm" style={{ color: "#90A1B9", fontWeight: 400 }}>
        {description}
      </div>
    </div>
  );
}

type FormIndicatorProps = {
  result: "W" | "L" | "D";
};

function FormIndicator({ result }: FormIndicatorProps) {
  const colors = {
    W: "#00BC7D",
    L: "#ef4444",
    D: "#94a3b8",
  };
  return (
    <div
      className="w-12 h-12 rounded-[12px] flex items-center justify-center text-base text-white"
      style={{ backgroundColor: colors[result], fontWeight: 500 }}
    >
      {result}
    </div>
  );
}

type ComparisonRowProps = {
  left: string | number;
  label: string;
  right: string | number;
  showDividers?: boolean;
};

function ComparisonRow({ left, label, right, showDividers = false }: ComparisonRowProps) {
  return (
    <div className="flex items-baseline justify-center py-2 gap-4" style={{ minHeight: "24px" }}>
      <div className="text-sm font-bold" style={{ color: "#319AE0", minWidth: "40px", textAlign: "right" }}>{left}</div>
      <div className="text-sm" style={{ color: "#62748E", minWidth: "120px", textAlign: "center" }}>{label}</div>
      <div className="text-sm font-bold" style={{ color: "#90A1B9", minWidth: "40px", textAlign: "left" }}>{right}</div>
    </div>
  );
}

const MOCK_MATCH_DATA: Record<string, {
  homeTeam: string;
  awayTeam: string;
  time: string;
  date: string;
  league: string;
  oddsHome: string;
  oddsAway: string;
  oddsDraw: string;
  homeForm: ("W" | "L" | "D")[];
  awayForm: ("W" | "L" | "D")[];
  aiConfidence: number;
  aiPrediction: string;
}> = {
  // Premier League
  "mun-liv-1": {
    homeTeam: "Man United",
    awayTeam: "Liverpool",
    time: "15:00",
    date: "Today",
    league: "Premier League",
    oddsHome: "+140",
    oddsAway: "+180",
    oddsDraw: "+230",
    homeForm: ["W", "W", "D", "W", "W"],
    awayForm: ["W", "L", "W", "W", "W"],
    aiConfidence: 72,
    aiPrediction: "Man United to Win",
  },
  "che-ars-2": {
    homeTeam: "Chelsea",
    awayTeam: "Arsenal",
    time: "18:30",
    date: "Today",
    league: "Premier League",
    oddsHome: "-120",
    oddsAway: "+300",
    oddsDraw: "+260",
    homeForm: ["W", "W", "W", "D", "W"],
    awayForm: ["L", "W", "D", "W", "L"],
    aiConfidence: 68,
    aiPrediction: "Chelsea to Win",
  },
  "mci-tot-3": {
    homeTeam: "Manchester City",
    awayTeam: "Tottenham",
    time: "20:00",
    date: "Today",
    league: "Premier League",
    oddsHome: "-150",
    oddsAway: "+220",
    oddsDraw: "+250",
    homeForm: ["W", "W", "D", "W", "W"],
    awayForm: ["W", "L", "W", "W", "D"],
    aiConfidence: 75,
    aiPrediction: "Man City to Win",
  },
  "new-bha-4": {
    homeTeam: "Newcastle",
    awayTeam: "Brighton",
    time: "15:00",
    date: "Tomorrow",
    league: "Premier League",
    oddsHome: "-110",
    oddsAway: "+260",
    oddsDraw: "+240",
    homeForm: ["W", "W", "D", "W", "W"],
    awayForm: ["W", "L", "W", "W", "W"],
    aiConfidence: 70,
    aiPrediction: "Newcastle to Win",
  },
  "avl-whu-5": {
    homeTeam: "Aston Villa",
    awayTeam: "West Ham",
    time: "17:30",
    date: "Tomorrow",
    league: "Premier League",
    oddsHome: "+100",
    oddsAway: "+240",
    oddsDraw: "+250",
    homeForm: ["W", "W", "D", "L", "W"],
    awayForm: ["L", "W", "D", "W", "L"],
    aiConfidence: 65,
    aiPrediction: "Aston Villa to Win",
  },
  "eve-nfo-6": {
    homeTeam: "Everton",
    awayTeam: "Nottingham Forest",
    time: "20:00",
    date: "Tomorrow",
    league: "Premier League",
    oddsHome: "+120",
    oddsAway: "+200",
    oddsDraw: "+240",
    homeForm: ["W", "L", "D", "W", "L"],
    awayForm: ["L", "D", "W", "L", "D"],
    aiConfidence: 62,
    aiPrediction: "Everton to Win",
  },
  // Bundesliga
  "bay-dor-7": {
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    time: "14:30",
    date: "Today",
    league: "Bundesliga",
    oddsHome: "-140",
    oddsAway: "+280",
    oddsDraw: "+300",
    homeForm: ["W", "W", "W", "W", "W"],
    awayForm: ["W", "L", "W", "W", "D"],
    aiConfidence: 80,
    aiPrediction: "Bayern Munich to Win",
  },
  "rbl-lev-8": {
    homeTeam: "RB Leipzig",
    awayTeam: "Bayer Leverkusen",
    time: "17:00",
    date: "Today",
    league: "Bundesliga",
    oddsHome: "+110",
    oddsAway: "+220",
    oddsDraw: "+260",
    homeForm: ["W", "W", "D", "W", "L"],
    awayForm: ["W", "W", "W", "D", "W"],
    aiConfidence: 68,
    aiPrediction: "RB Leipzig to Win",
  },
  "uni-fra-9": {
    homeTeam: "Union Berlin",
    awayTeam: "Eintracht Frankfurt",
    time: "14:30",
    date: "Tomorrow",
    league: "Bundesliga",
    oddsHome: "+130",
    oddsAway: "+200",
    oddsDraw: "+240",
    homeForm: ["W", "D", "L", "W", "D"],
    awayForm: ["L", "W", "D", "L", "W"],
    aiConfidence: 60,
    aiPrediction: "Union Berlin to Win",
  },
  "wol-fre-10": {
    homeTeam: "Wolfsburg",
    awayTeam: "Freiburg",
    time: "17:00",
    date: "Tomorrow",
    league: "Bundesliga",
    oddsHome: "+140",
    oddsAway: "+180",
    oddsDraw: "+230",
    homeForm: ["W", "L", "W", "D", "W"],
    awayForm: ["D", "W", "L", "W", "D"],
    aiConfidence: 63,
    aiPrediction: "Wolfsburg to Win",
  },
  "mgl-stu-11": {
    homeTeam: "Borussia M'gladbach",
    awayTeam: "Stuttgart",
    time: "19:30",
    date: "Tomorrow",
    league: "Bundesliga",
    oddsHome: "+150",
    oddsAway: "+170",
    oddsDraw: "+240",
    homeForm: ["D", "W", "L", "W", "D"],
    awayForm: ["W", "W", "L", "D", "W"],
    aiConfidence: 58,
    aiPrediction: "Stuttgart to Win",
  },
  // La Liga
  "rm-barca-12": {
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    time: "16:00",
    date: "Today",
    league: "La Liga",
    oddsHome: "+120",
    oddsAway: "+200",
    oddsDraw: "+240",
    homeForm: ["W", "W", "W", "D", "W"],
    awayForm: ["W", "W", "D", "W", "W"],
    aiConfidence: 70,
    aiPrediction: "Real Madrid to Win",
  },
  "atm-sev-13": {
    homeTeam: "Atletico Madrid",
    awayTeam: "Sevilla",
    time: "18:45",
    date: "Today",
    league: "La Liga",
    oddsHome: "-110",
    oddsAway: "+260",
    oddsDraw: "+250",
    homeForm: ["W", "W", "D", "W", "L"],
    awayForm: ["L", "D", "W", "L", "D"],
    aiConfidence: 72,
    aiPrediction: "Atletico Madrid to Win",
  },
  "rsoc-val-14": {
    homeTeam: "Real Sociedad",
    awayTeam: "Valencia",
    time: "13:00",
    date: "Tomorrow",
    league: "La Liga",
    oddsHome: "-130",
    oddsAway: "+300",
    oddsDraw: "+280",
    homeForm: ["W", "D", "W", "W", "D"],
    awayForm: ["L", "L", "D", "W", "L"],
    aiConfidence: 75,
    aiPrediction: "Real Sociedad to Win",
  },
  "vil-ath-15": {
    homeTeam: "Villareal",
    awayTeam: "Athletic Bilbao",
    time: "16:00",
    date: "Tomorrow",
    league: "La Liga",
    oddsHome: "+100",
    oddsAway: "+240",
    oddsDraw: "+250",
    homeForm: ["W", "L", "W", "D", "W"],
    awayForm: ["D", "W", "D", "L", "W"],
    aiConfidence: 65,
    aiPrediction: "Villareal to Win",
  },
  "bet-get-16": {
    homeTeam: "Real Betis",
    awayTeam: "Getafe",
    time: "18:30",
    date: "Tomorrow",
    league: "La Liga",
    oddsHome: "-120",
    oddsAway: "+300",
    oddsDraw: "+260",
    homeForm: ["W", "W", "D", "L", "W"],
    awayForm: ["L", "D", "L", "W", "L"],
    aiConfidence: 70,
    aiPrediction: "Real Betis to Win",
  },
  // Serie A
  "inter-milan-17": {
    homeTeam: "Inter Milan",
    awayTeam: "AC Milan",
    time: "15:00",
    date: "Today",
    league: "Serie A",
    oddsHome: "+110",
    oddsAway: "+220",
    oddsDraw: "+260",
    homeForm: ["W", "W", "W", "D", "W"],
    awayForm: ["W", "L", "W", "W", "D"],
    aiConfidence: 68,
    aiPrediction: "Inter Milan to Win",
  },
  "juv-nap-18": {
    homeTeam: "Juventus",
    awayTeam: "Napoli",
    time: "20:45",
    date: "Today",
    league: "Serie A",
    oddsHome: "+140",
    oddsAway: "+180",
    oddsDraw: "+230",
    homeForm: ["W", "W", "D", "W", "W"],
    awayForm: ["W", "W", "L", "W", "W"],
    aiConfidence: 65,
    aiPrediction: "Napoli to Win",
  },
  "rom-laz-19": {
    homeTeam: "Roma",
    awayTeam: "Lazio",
    time: "15:00",
    date: "Tomorrow",
    league: "Serie A",
    oddsHome: "+120",
    oddsAway: "+200",
    oddsDraw: "+240",
    homeForm: ["W", "D", "W", "L", "W"],
    awayForm: ["W", "W", "D", "W", "L"],
    aiConfidence: 62,
    aiPrediction: "Roma to Win",
  },
  "ata-fio-20": {
    homeTeam: "Atalanta",
    awayTeam: "Fiorentina",
    time: "18:00",
    date: "Tomorrow",
    league: "Serie A",
    oddsHome: "-110",
    oddsAway: "+260",
    oddsDraw: "+250",
    homeForm: ["W", "W", "W", "D", "L"],
    awayForm: ["L", "D", "W", "L", "D"],
    aiConfidence: 70,
    aiPrediction: "Atalanta to Win",
  },
  // Ligue 1
  "psg-mar-21": {
    homeTeam: "PSG",
    awayTeam: "Marseille",
    time: "20:00",
    date: "Today",
    league: "Ligue 1",
    oddsHome: "-160",
    oddsAway: "+350",
    oddsDraw: "+300",
    homeForm: ["W", "W", "W", "W", "W"],
    awayForm: ["W", "L", "D", "W", "L"],
    aiConfidence: 82,
    aiPrediction: "PSG to Win",
  },
  "mon-lyon-22": {
    homeTeam: "Monaco",
    awayTeam: "Lyon",
    time: "16:00",
    date: "Tomorrow",
    league: "Ligue 1",
    oddsHome: "+110",
    oddsAway: "+220",
    oddsDraw: "+260",
    homeForm: ["W", "W", "D", "W", "L"],
    awayForm: ["L", "W", "D", "L", "W"],
    aiConfidence: 68,
    aiPrediction: "Monaco to Win",
  },
  "lil-ren-23": {
    homeTeam: "Lille",
    awayTeam: "Rennes",
    time: "18:00",
    date: "Tomorrow",
    league: "Ligue 1",
    oddsHome: "+100",
    oddsAway: "+240",
    oddsDraw: "+250",
    homeForm: ["W", "D", "W", "W", "D"],
    awayForm: ["D", "L", "W", "D", "W"],
    aiConfidence: 65,
    aiPrediction: "Lille to Win",
  },
  "nice-lens-24": {
    homeTeam: "Nice",
    awayTeam: "Lens",
    time: "20:00",
    date: "Tomorrow",
    league: "Ligue 1",
    oddsHome: "+130",
    oddsAway: "+200",
    oddsDraw: "+240",
    homeForm: ["W", "W", "L", "D", "W"],
    awayForm: ["W", "D", "W", "L", "D"],
    aiConfidence: 63,
    aiPrediction: "Nice to Win",
  },
};

const teamLogoByName: Record<string, string> = {
  // Premier League
  "Manchester City": "https://media.api-sports.io/football/teams/50.png",
  "Man United": "https://media.api-sports.io/football/teams/33.png",
  "Liverpool": "https://media.api-sports.io/football/teams/40.png",
  "Chelsea": "https://media.api-sports.io/football/teams/49.png",
  "Arsenal": "https://media.api-sports.io/football/teams/42.png",
  "Tottenham": "https://media.api-sports.io/football/teams/47.png",
  "Newcastle": "https://media.api-sports.io/football/teams/34.png",
  "Brighton": "https://media.api-sports.io/football/teams/51.png",
  "Aston Villa": "https://media.api-sports.io/football/teams/66.png",
  "West Ham": "https://media.api-sports.io/football/teams/48.png",
  "West Ham United": "https://media.api-sports.io/football/teams/48.png",
  "Everton": "https://media.api-sports.io/football/teams/45.png",
  "Nottingham Forest": "https://media.api-sports.io/football/teams/65.png",
  "Sunderland": "/icons/Sunderland-AFC.png",
  "Sunderland AFC": "/icons/Sunderland-AFC.png",
  // Bundesliga
  "Bayern Munich": "https://media.api-sports.io/football/teams/157.png",
  "Borussia Dortmund": "https://media.api-sports.io/football/teams/165.png",
  "RB Leipzig": "https://media.api-sports.io/football/teams/173.png",
  "Bayer Leverkusen": "https://media.api-sports.io/football/teams/168.png",
  "Union Berlin": "https://media.api-sports.io/football/teams/182.png",
  "Eintracht Frankfurt": "https://media.api-sports.io/football/teams/169.png",
  "Wolfsburg": "https://media.api-sports.io/football/teams/161.png",
  "Freiburg": "https://media.api-sports.io/football/teams/160.png",
  "Borussia M'gladbach": "https://media.api-sports.io/football/teams/163.png",
  "Stuttgart": "https://media.api-sports.io/football/teams/172.png",
  // La Liga
  "Real Madrid": "https://media.api-sports.io/football/teams/541.png",
  "Barcelona": "https://media.api-sports.io/football/teams/529.png",
  "Atletico Madrid": "https://media.api-sports.io/football/teams/530.png",
  "Sevilla": "https://media.api-sports.io/football/teams/536.png",
  "Real Sociedad": "https://media.api-sports.io/football/teams/548.png",
  "Valencia": "https://media.api-sports.io/football/teams/532.png",
  "Villareal": "https://media.api-sports.io/football/teams/533.png",
  "Athletic Bilbao": "https://media.api-sports.io/football/teams/531.png",
  "Real Betis": "https://media.api-sports.io/football/teams/543.png",
  "Getafe": "https://media.api-sports.io/football/teams/546.png",
  // Serie A
  "Inter Milan": "https://media.api-sports.io/football/teams/108.png",
  "AC Milan": "https://media.api-sports.io/football/teams/98.png",
  "Juventus": "https://media.api-sports.io/football/teams/109.png",
  "Napoli": "https://media.api-sports.io/football/teams/113.png",
  "Roma": "https://media.api-sports.io/football/teams/100.png",
  "Lazio": "https://media.api-sports.io/football/teams/99.png",
  "Atalanta": "https://media.api-sports.io/football/teams/102.png",
  "Fiorentina": "https://media.api-sports.io/football/teams/99.png",
  // Ligue 1
  "PSG": "https://media.api-sports.io/football/teams/85.png",
  "Marseille": "https://media.api-sports.io/football/teams/81.png",
  "Monaco": "https://media.api-sports.io/football/teams/91.png",
  "Lyon": "https://media.api-sports.io/football/teams/80.png",
  "Lille": "https://media.api-sports.io/football/teams/79.png",
  "Rennes": "https://media.api-sports.io/football/teams/94.png",
  "Nice": "https://media.api-sports.io/football/teams/84.png",
  "Lens": "https://media.api-sports.io/football/teams/116.png",
};

function formatTeamName(name: string) {
  // Handle "Manchester City" -> "Man City" (keep on one line)
  if (name === "Manchester City") {
    return <div>Man City</div>;
  }
  if (name.length > 12) {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (
        <>
          <div>{parts[0]}</div>
          <div>{parts.slice(1).join(" ")}</div>
        </>
      );
    }
  }
  return <div>{name}</div>;
}

function SectionIcon({ name }: { name: string }) {
  return (
    <Image
      src={`/assets/icons/${name}.svg`}
      alt={name}
      width={24}
      height={24}
      style={{ objectFit: "contain" }}
    />
  );
}

function TeamBadge({ teamName, size = 32 }: { teamName: string; size?: number }) {
  const isTottenham = teamName === "Tottenham" || teamName === "Tottenham Hotspur" || teamName === "Spurs";
  const badgeUrl = getTeamBadgeUrl(teamName);
  
  // Use higher resolution for better quality (2x for retina displays)
  const displaySize = size;
  const imageSize = size * 2; // Load 2x resolution for better quality
  
  const imageStyle: React.CSSProperties = {
    objectFit: "contain",
    imageRendering: "crisp-edges" as const,
    WebkitImageRendering: "crisp-edges" as any,
    msInterpolationMode: "nearest-neighbor" as any,
  };
  
  if (isTottenham) {
    return (
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: size, height: size, backgroundColor: "#FFFFFF", padding: `${size * 0.3}px` }}
      >
        <Image
          src={badgeUrl}
          alt={teamName}
          width={imageSize}
          height={imageSize}
          style={{
            ...imageStyle,
            width: `${size * 0.4}px`,
            height: `${size * 0.4}px`,
          }}
          quality={100}
          unoptimized={badgeUrl.startsWith('http')}
        />
      </div>
    );
  }
  
  // Log badge URL for debugging (especially for Sunderland)
  if (typeof window !== 'undefined' && teamName.toLowerCase().includes('sunderland')) {
    console.log(`[TeamBadge Component] Rendering badge for "${teamName}":`, badgeUrl);
  }

  return (
    <div className="rounded-full overflow-hidden flex items-center justify-center" style={{ width: size, height: size }}>
      <Image
        src={badgeUrl}
        alt={teamName}
        width={imageSize}
        height={imageSize}
        style={imageStyle}
        quality={100}
        unoptimized={badgeUrl.startsWith('http') || badgeUrl.includes('Sunderland')}
        className="w-full h-full"
        onError={(e) => {
          console.error(`[TeamBadge] ❌ FAILED to load badge for "${teamName}" from:`, badgeUrl);
          console.error('[TeamBadge] Error event:', e);
          // Try fallback for Sunderland
          if (teamName.toLowerCase().includes('sunderland')) {
            console.error('[TeamBadge] Attempting direct img tag fallback for Sunderland');
          }
        }}
        onLoad={() => {
          if (typeof window !== 'undefined' && teamName.toLowerCase().includes('sunderland')) {
            console.log(`[TeamBadge] ✅ Successfully loaded badge for "${teamName}" from:`, badgeUrl);
          }
        }}
      />
    </div>
  );
}

export default function MatchAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params?.matchId as string;
  const [match, setMatch] = useState<typeof MOCK_MATCH_DATA[string] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const { getMatchById } = useMatches();
  const { addCustomPick } = useBetslip();
  
  // Store original match data with id and startTime for analysis
  const [originalMatchData, setOriginalMatchData] = useState<{ id: string; startTime: string } | null>(null);
  
  // Claude API data states
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) {
        setLoading(false);
        return;
      }

      // First try mock data
      if (MOCK_MATCH_DATA[matchId]) {
        // For mock data, use matchId and current time
        setOriginalMatchData({
          id: matchId,
          startTime: new Date().toISOString(),
        });
        setMatch(MOCK_MATCH_DATA[matchId]);
        setLoading(false);
        return;
      }

      // Try to get from context (matches loaded on home page)
      const contextMatch = getMatchById(matchId);
      if (contextMatch) {
        const date = new Date(contextMatch.startTime);
        const timeStr = date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        let dateStr: string;
        if (date.toDateString() === today.toDateString()) {
          dateStr = 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
          dateStr = 'Tomorrow';
        } else {
          dateStr = date.toLocaleDateString('en-US', { weekday: 'long' });
        }
        
        // Store original match data for analysis
        setOriginalMatchData({
          id: contextMatch.id,
          startTime: contextMatch.startTime,
        });
        
        setMatch({
          homeTeam: contextMatch.homeTeam,
          awayTeam: contextMatch.awayTeam,
          time: timeStr,
          date: dateStr,
          league: contextMatch.league,
          oddsHome: formatAmericanOdds(contextMatch.odds.home),
          oddsAway: formatAmericanOdds(contextMatch.odds.away),
          oddsDraw: formatAmericanOdds(contextMatch.odds.draw),
          // Mock data for now - these would come from other APIs (form, predictions)
          homeForm: ["W", "W", "D", "W", "W"] as ("W" | "L" | "D")[],
          awayForm: ["W", "L", "W", "W", "W"] as ("W" | "L" | "D")[],
          aiConfidence: 70,
          aiPrediction: `${contextMatch.homeTeam} to Win`,
        });
        setLoading(false);
        return;
      }

      // Try to fetch from API as last resort (fallback only if context doesn't have it)
      try {
        const response = await fetch(`/api/matches/${matchId}`, {
          cache: 'no-store',
        }).catch(() => null);
        
        if (response && response.ok) {
          const apiMatch = await response.json();
          
          // Convert API match to match analysis format
          const date = new Date(apiMatch.startTime);
          const timeStr = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
          
          // Determine date string (Today, Tomorrow, or day name)
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          let dateStr: string;
          if (date.toDateString() === today.toDateString()) {
            dateStr = 'Today';
          } else if (date.toDateString() === tomorrow.toDateString()) {
            dateStr = 'Tomorrow';
          } else {
            dateStr = date.toLocaleDateString('en-US', { weekday: 'long' });
          }
          
          // Store original match data for analysis
          setOriginalMatchData({
            id: apiMatch.id || matchId,
            startTime: apiMatch.startTime,
          });
          
          setMatch({
            homeTeam: apiMatch.homeTeam,
            awayTeam: apiMatch.awayTeam,
            time: timeStr,
            date: dateStr,
            league: apiMatch.league,
            oddsHome: formatAmericanOdds(apiMatch.odds.home),
            oddsAway: formatAmericanOdds(apiMatch.odds.away),
            oddsDraw: formatAmericanOdds(apiMatch.odds.draw),
            // Mock data for now - these would come from other APIs (form, predictions)
            homeForm: ["W", "W", "D", "W", "W"] as ("W" | "L" | "D")[],
            awayForm: ["W", "L", "W", "W", "W"] as ("W" | "L" | "D")[],
            aiConfidence: 70,
            aiPrediction: `${apiMatch.homeTeam} to Win`,
          });
        } else {
          setMatch(null);
          setOriginalMatchData(null);
        }
      } catch (error) {
        console.error('Error fetching match:', error);
        setMatch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId, getMatchById]);

  // Fetch Claude analysis when match is loaded
  useEffect(() => {
    if (!match || !originalMatchData) return;

    async function fetchAnalysis() {
      try {
        setLoadingStats(true);
        
        // Convert match to Claude API format
        const matchData = {
          id: originalMatchData.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          league: match.league,
          odds: {
            home: match.oddsHome.startsWith('-') 
              ? -parseFloat(match.oddsHome.replace(/[+-]/g, '')) 
              : parseFloat(match.oddsHome.replace(/[+-]/g, '')) || 0,
            draw: match.oddsDraw.startsWith('-') 
              ? -parseFloat(match.oddsDraw.replace(/[+-]/g, '')) 
              : parseFloat(match.oddsDraw.replace(/[+-]/g, '')) || 0,
            away: match.oddsAway.startsWith('-') 
              ? -parseFloat(match.oddsAway.replace(/[+-]/g, '')) 
              : parseFloat(match.oddsAway.replace(/[+-]/g, '')) || 0,
          },
          startTime: originalMatchData.startTime,
        };
        
        console.log('🔄 Fetching analysis for match:', matchData);
        const analysisData = await generateMatchAnalysis(matchData);
        
        if (analysisData) {
          setAnalysis(analysisData);
          console.log('✅ Claude analysis loaded:', analysisData);
        }
      } catch (error) {
        console.error('❌ Error fetching Claude analysis:', error);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchAnalysis();
  }, [match, originalMatchData]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading match...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Match not found</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto min-h-screen w-full max-w-[480px] pb-24">
        {/* Sticky Header */}
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
          style={{
            height: "60px",
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(8px)",
            transform: showStickyHeader ? "translateY(0)" : "translateY(-100%)",
            opacity: showStickyHeader ? 1 : 0,
            pointerEvents: showStickyHeader ? "auto" : "none",
            transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
            <button
              className="text-sm active:scale-95"
              style={{ color: "#94a3b8" }}
              onClick={() => router.back()}
            >
              ←
            </button>
            <div className="flex items-center gap-3 flex-1 justify-center">
              <Image
                src={getTeamBadgeUrl(match.homeTeam)}
                alt={match.homeTeam}
                width={48}
                height={48}
                style={{ 
                  objectFit: "contain",
                  imageRendering: "crisp-edges" as const,
                  WebkitImageRendering: "crisp-edges" as any,
                }}
                quality={100}
                unoptimized={getTeamBadgeUrl(match.homeTeam).startsWith('http')}
                className="w-6 h-6"
              />
              <span className="text-sm font-medium text-white" style={{ fontSize: "14px" }}>
                {match.time}
              </span>
              <Image
                src={getTeamBadgeUrl(match.awayTeam)}
                alt={match.awayTeam}
                width={48}
                height={48}
                style={{ 
                  objectFit: "contain",
                  imageRendering: "crisp-edges" as const,
                  WebkitImageRendering: "crisp-edges" as any,
                }}
                quality={100}
                unoptimized={getTeamBadgeUrl(match.awayTeam).startsWith('http')}
                className="w-6 h-6"
              />
            </div>
            <div style={{ width: "24px" }} />
          </div>

        {/* Header */}
        <header className="h-14 flex items-center px-4 relative" style={{ background: "transparent" }}>
          <button
            className="absolute left-4 text-sm text-[--text-secondary] active:scale-95"
            style={{ color: "#94a3b8" }}
            onClick={() => router.back()}
          >
            ← Back
          </button>
        </header>

        <main className="px-4 pb-6 space-y-4">
          {/* Teams Section */}
          <section className="pt-2 pb-6">
            <div className="text-center mb-4">
              <div className="text-sm" style={{ color: "#94a3b8", fontWeight: 400 }}>{match.date} • {match.time}</div>
            </div>
            <div className="flex items-start justify-center gap-6">
              <div className="text-center flex-1 flex flex-col items-center">
                <div className="mb-3 flex items-center justify-center mx-auto flex-shrink-0">
                  {match.homeTeam === "Tottenham" || match.homeTeam === "Tottenham Hotspur" || match.homeTeam === "Spurs" ? (
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{ width: 100, height: 100, backgroundColor: "#FFFFFF", padding: "20px" }}
                    >
                      <Image
                        src={getTeamBadgeUrl(match.homeTeam)}
                        alt={match.homeTeam}
                        width={160}
                        height={160}
                        style={{ 
                          objectFit: "contain",
                          imageRendering: "crisp-edges" as const,
                          WebkitImageRendering: "crisp-edges" as any,
                          width: "40px",
                          height: "40px",
                        }}
                        quality={100}
                        unoptimized={getTeamBadgeUrl(match.homeTeam).startsWith('http')}
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center" style={{ background: "transparent" }}>
                      <Image
                        src={getTeamBadgeUrl(match.homeTeam)}
                        alt={match.homeTeam}
                        width={160}
                        height={160}
                        style={{ 
                          objectFit: "contain",
                          imageRendering: "crisp-edges" as const,
                          WebkitImageRendering: "crisp-edges" as any,
                        }}
                        quality={100}
                        unoptimized={getTeamBadgeUrl(match.homeTeam).startsWith('http')}
                        className="w-20 h-20"
                      />
                    </div>
                  )}
                </div>
                <div className="text-base font-bold text-white text-center flex items-center justify-center w-full" style={{ lineHeight: 1.2, wordBreak: "break-word", minHeight: "2.4em" }}>
                  {formatTeamName(match.homeTeam)}
                </div>
              </div>
              <div className="text-base flex items-start" style={{ color: "#64748b", paddingTop: "48px" }}>vs</div>
              <div className="text-center flex-1 flex flex-col items-center">
                <div className="mb-3 flex items-center justify-center mx-auto flex-shrink-0">
                  {match.awayTeam === "Tottenham" || match.awayTeam === "Tottenham Hotspur" || match.awayTeam === "Spurs" ? (
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{ width: 100, height: 100, backgroundColor: "#FFFFFF", padding: "20px" }}
                    >
                      <Image
                        src={getTeamBadgeUrl(match.awayTeam)}
                        alt={match.awayTeam}
                        width={160}
                        height={160}
                        style={{ 
                          objectFit: "contain",
                          imageRendering: "crisp-edges" as const,
                          WebkitImageRendering: "crisp-edges" as any,
                          width: "40px",
                          height: "40px",
                        }}
                        quality={100}
                        unoptimized={getTeamBadgeUrl(match.awayTeam).startsWith('http')}
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center" style={{ background: "transparent" }}>
                      <Image
                        src={getTeamBadgeUrl(match.awayTeam)}
                        alt={match.awayTeam}
                        width={160}
                        height={160}
                        style={{ 
                          objectFit: "contain",
                          imageRendering: "crisp-edges" as const,
                          WebkitImageRendering: "crisp-edges" as any,
                        }}
                        quality={100}
                        unoptimized={getTeamBadgeUrl(match.awayTeam).startsWith('http')}
                        className="w-20 h-20"
                      />
                    </div>
                  )}
                </div>
                <div className="text-base font-bold text-white text-center flex items-center justify-center w-full" style={{ lineHeight: 1.2, wordBreak: "break-word", minHeight: "2.4em" }}>
                  {formatTeamName(match.awayTeam)}
                </div>
              </div>
            </div>
          </section>

          {/* AI Confidence Card */}
          <section style={{ marginTop: "20px", marginBottom: "20px" }}>
            <div
              className="rounded-[12px] text-white text-center relative"
              style={{
                background: "linear-gradient(135deg, #0EA5E9 0%, #1e3a8a 100%)",
                padding: "20px 16px 24px 16px",
              }}
            >
              <div className="text-sm font-medium opacity-90 mb-2">AI Confidence</div>
              <div className="text-4xl font-bold mb-2">{match.aiConfidence}%</div>
              <div className="text-base font-semibold mb-3">{match.aiPrediction}</div>
              <div className="text-xs opacity-75 mb-4" style={{ color: "#94a3b8" }}>
                AI-generated analysis • Data accuracy may vary
              </div>
              <button
                onClick={() => {
                  // Determine which odds to use based on prediction
                  let odds = match.oddsDraw;
                  if (match.aiPrediction.includes(match.homeTeam)) {
                    odds = match.oddsHome;
                  } else if (match.aiPrediction.includes(match.awayTeam)) {
                    odds = match.oddsAway;
                  } else if (match.aiPrediction.toLowerCase().includes("draw")) {
                    odds = match.oddsDraw;
                  }
                  
                  addCustomPick({
                    match: `${match.homeTeam} vs ${match.awayTeam}`,
                    prediction: match.aiPrediction,
                    odds: odds,
                  });
                }}
                className="w-full rounded-[8px] py-3 text-center text-sm font-semibold active:scale-95 transition-transform duration-100"
                style={{
                  background: "#ffffff",
                  color: "#0EA5E9",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                Add to Slip
              </button>
            </div>
          </section>

          {/* AI Insights */}
          <section>
            <div className="mb-3" style={{ paddingTop: "4px" }}>
              <div className="flex items-center gap-2">
                <Image src="/assets/icons/ai-insights.svg" alt="AI Insights" width={24} height={24} style={{ objectFit: "contain" }} />
                <span className="text-base text-text-primary" style={{ fontWeight: 500 }}>AI Insights</span>
              </div>
            </div>
            <div style={{ gap: "16px", display: "flex", flexDirection: "column" }}>
              <InsightCard
                icon="/assets/icons/strong-home-form.svg"
                title="Strong Home Form"
                percentage={85}
                description="Home team has won 4 of last 5 matches with strong defensive record. Recent form shows consistency in attack and defense."
              />
              <InsightCard
                icon="/assets/icons/strong-home-form.svg"
                title="Head-to-Head Advantage"
                percentage={72}
                description="Historical data shows home team has won 3 of last 5 meetings. Home advantage has been significant in recent matchups."
              />
              <InsightCard
                icon="/assets/icons/key-player-missing.svg"
                title="Key Player Missing"
                percentage={68}
                description="Away team missing key defender which could impact defensive stability. Home team at full strength with all key players available."
              />
            </div>
          </section>

          {/* Referee Info */}
          <Section title="Referee Info" icon="/assets/icons/referee.svg">
            <div className="space-y-4">
              <div className="text-lg font-medium text-white">Michael Oliver</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "#62748E" }}>Avg Cards/Game</span>
                  <span className="text-sm font-medium" style={{ color: "#90A1B9" }}>4.2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "#62748E" }}>Penalties (season)</span>
                  <span className="text-sm font-medium" style={{ color: "#90A1B9" }}>2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "#62748E" }}>Strict Rating</span>
                  <span className="text-sm font-medium" style={{ color: "#fbbf24" }}>⭐⭐⭐⭐</span>
                </div>
              </div>
            </div>
          </Section>

          {/* Injuries & Suspensions */}
          <div style={{ marginTop: "32px" }}>
            <Section title="Injuries & Suspensions" icon="/assets/icons/key-player-missing.svg">
            {loadingStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-gray-700 rounded animate-pulse" />
                <div className="h-24 bg-gray-700 rounded animate-pulse" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm font-medium mb-3" style={{ color: "#319AE0", fontWeight: 500 }}>{match.homeTeam}</div>
                  <div className="space-y-2 text-sm">
                    {analysis?.homeTeam.injuries && analysis.homeTeam.injuries.length > 0 ? (
                      analysis.homeTeam.injuries.map((injury, idx) => (
                        <div key={idx}>
                          <div className="text-white">{injury.name}</div>
                          <div className="text-white" style={{ color: "#ef4444", fontSize: "14px", paddingLeft: "8px" }}>
                            {injury.reason}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: "#94a3b8", fontWeight: 400 }}>No major injuries</div>
                    )}
                  </div>
                </div>
                <div className="text-center border-l pl-4" style={{ borderColor: "#334155" }}>
                  <div className="text-sm font-medium mb-3" style={{ color: "#90A1B9", fontWeight: 500 }}>{match.awayTeam}</div>
                  <div className="space-y-3 text-sm">
                    {analysis?.awayTeam.injuries && analysis.awayTeam.injuries.length > 0 ? (
                      analysis.awayTeam.injuries.map((injury, idx) => (
                        <div key={idx}>
                          <div className="text-white">{injury.name}</div>
                          <div className="text-white" style={{ color: "#ef4444", fontSize: "14px", paddingLeft: "8px" }}>
                            {injury.reason}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: "#94a3b8", fontWeight: 400 }}>No major injuries</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Section>
          </div>

          {/* Recent Form */}
          <Section title="Recent Form" icon="/assets/icons/recent-form.svg">
            {loadingStats ? (
              <div className="space-y-4">
                <div className="h-16 bg-gray-700 rounded animate-pulse" />
                <div className="h-16 bg-gray-700 rounded animate-pulse" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <TeamBadge teamName={match.homeTeam} size={32} />
                    <div className="text-sm font-medium text-white" style={{ wordBreak: "break-word" }}>{match.homeTeam}</div>
                  </div>
                  <div className="flex items-center" style={{ gap: "8px" }}>
                    {analysis?.homeTeam.form ? (
                      analysis.homeTeam.form.split('').map((result, idx) => (
                        <FormIndicator key={idx} result={result as "W" | "L" | "D"} />
                      ))
                    ) : (
                      match.homeForm.map((result, idx) => (
                        <FormIndicator key={idx} result={result} />
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <TeamBadge teamName={match.awayTeam} size={32} />
                    <div className="text-sm font-medium text-white" style={{ wordBreak: "break-word" }}>{match.awayTeam}</div>
                  </div>
                  <div className="flex items-center" style={{ gap: "8px" }}>
                    {analysis?.awayTeam.form ? (
                      analysis.awayTeam.form.split('').map((result, idx) => (
                        <FormIndicator key={idx} result={result as "W" | "L" | "D"} />
                      ))
                    ) : (
                      match.awayForm.map((result, idx) => (
                        <FormIndicator key={idx} result={result} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* Head-to-Head */}
          <section className="space-y-3">
            <div className="flex items-center gap-2" style={{ paddingTop: "4px" }}>
              <Image src="/assets/icons/ai-insights.svg" alt="Head-to-Head" width={24} height={24} style={{ objectFit: "contain" }} />
              <span className="text-base text-text-primary" style={{ fontWeight: 500 }}>
                Head-to-Head <span style={{ color: "#94a3b8", fontWeight: 400 }}>(last 5 meetings)</span>
              </span>
            </div>
            <div
              className="rounded-[12px] border px-4 py-4"
              style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
            >
              {loadingStats ? (
                <div className="h-20 bg-gray-700 rounded animate-pulse" />
              ) : analysis?.headToHead ? (
                <div className="text-sm text-white" style={{ color: "#94a3b8" }}>
                  {analysis.headToHead}
                </div>
              ) : (
                <div className="space-y-2">
                  <ComparisonRow left="2" label="Wins" right="2" showDividers={false} />
                  <ComparisonRow left="2" label="Wins" right="2" showDividers={false} />
                  <ComparisonRow left="1" label="Draws" right="1" showDividers={false} />
                </div>
              )}
            </div>
          </section>

          {/* Key Stats */}
          <Section title="Key Stats" icon="/assets/icons/key-stats.svg">
            {loadingStats ? (
              <div className="space-y-2">
                <div className="h-12 bg-gray-700 rounded animate-pulse" />
                <div className="h-12 bg-gray-700 rounded animate-pulse" />
                <div className="h-12 bg-gray-700 rounded animate-pulse" />
              </div>
            ) : (
              <div className="space-y-0">
                {analysis?.homeTeam && analysis?.awayTeam ? (
                  <>
                    <ComparisonRow 
                      left={analysis.homeTeam.goalsFor != null ? analysis.homeTeam.goalsFor.toFixed(1) : 'N/A'} 
                      label="Goals Scored (Total)" 
                      right={analysis.awayTeam.goalsFor != null ? analysis.awayTeam.goalsFor.toFixed(1) : 'N/A'} 
                    />
                    <ComparisonRow 
                      left={analysis.homeTeam.position + "th"} 
                      label="League Position" 
                      right={analysis.awayTeam.position + "th"} 
                    />
                    <ComparisonRow 
                      left={analysis.homeTeam.points + " pts"} 
                      label="Points" 
                      right={analysis.awayTeam.points + " pts"} 
                    />
                  </>
                ) : (
                  <>
                    <ComparisonRow left="2.4" label="Goals Scored (Avg)" right="1.8" />
                    <ComparisonRow left="6" label="Clean Sheets" right="4" />
                    <ComparisonRow left="58%" label="Possession" right="55%" />
                  </>
                )}
              </div>
            )}
          </Section>

          {/* Top Scorers */}
          <Section title="Top Scorers (this season)" icon="/assets/icons/top-scorers.svg">
            <div className="text-xs mb-2" style={{ color: "#94a3b8", fontStyle: "italic" }}>
              AI-generated data • Verify current squad information
            </div>
            {loadingStats ? (
              <div className="space-y-2">
                <div className="h-8 bg-gray-700 rounded animate-pulse" />
                <div className="h-8 bg-gray-700 rounded animate-pulse" />
                <div className="h-8 bg-gray-700 rounded animate-pulse" />
              </div>
            ) : (
              <div className="space-y-2">
                {analysis?.homeTeam.scorers && analysis?.awayTeam.scorers ? (
                  Array.from({ length: Math.max(analysis.homeTeam.scorers.length, analysis.awayTeam.scorers.length, 3) }).map((_, idx) => {
                    const homeScorer = analysis.homeTeam.scorers[idx];
                    const awayScorer = analysis.awayTeam.scorers[idx];
                    return (
                      <div key={idx} className="flex items-center justify-center">
                        <span className="text-sm text-left flex-1 text-white" style={{ marginRight: "4px" }}>
                          {homeScorer?.name || '-'}
                        </span>
                        <span className="text-sm font-bold" style={{ color: "#319AE0" }}>
                          {homeScorer?.goals || 0}
                        </span>
                        <span style={{ width: "16px" }} />
                        <span className="text-sm font-bold text-white" style={{ marginLeft: "4px" }}>
                          {awayScorer?.goals || 0}
                        </span>
                        <span className="text-sm text-right flex-1 text-white">
                          {awayScorer?.name || '-'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-left flex-1 text-white" style={{ marginRight: "4px" }}>Mbeumo</span>
                      <span className="text-sm font-bold" style={{ color: "#319AE0" }}>4</span>
                      <span style={{ width: "16px" }} />
                      <span className="text-sm font-bold text-white" style={{ marginLeft: "4px" }}>11</span>
                      <span className="text-sm text-right flex-1 text-white">Haaland</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-left flex-1 text-white" style={{ marginRight: "4px" }}>Fernandes</span>
                      <span className="text-sm font-bold" style={{ color: "#319AE0" }}>2</span>
                      <span style={{ width: "16px" }} />
                      <span className="text-sm font-bold text-white" style={{ marginLeft: "4px" }}>1</span>
                      <span className="text-sm text-right flex-1 text-white">Reijnders</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-left flex-1 text-white" style={{ marginRight: "4px" }}>Sesko</span>
                      <span className="text-sm font-bold" style={{ color: "#319AE0" }}>2</span>
                      <span style={{ width: "16px" }} />
                      <span className="text-sm font-bold text-white" style={{ marginLeft: "4px" }}>1</span>
                      <span className="text-sm text-right flex-1 text-white">Foden</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </Section>

          {/* Fouls & Cards */}
          <Section title="Fouls & Cards" icon="/assets/icons/fouls-cards.svg">
            <div className="space-y-0">
              <ComparisonRow left="12.3" label="Fouls" right="10.8" />
              <ComparisonRow left="2.1" label="Yellow" right="1.9" />
              <ComparisonRow left="0.1" label="Red" right="0.0" />
            </div>
          </Section>

          {/* Advanced Stats */}
          <Section title="Advanced Stats" icon="/assets/icons/advanced-stats.svg">
            <div className="space-y-0">
              <ComparisonRow left="11.2" label="Shots" right="13.8" />
              <ComparisonRow left="4.3" label="On Target" right="6.1" />
              <ComparisonRow left="9.1" label="Corners" right="6.8" />
              <ComparisonRow left="1.4" label="xG" right="2.1" />
            </div>
          </Section>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
