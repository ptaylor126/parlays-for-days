"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { MatchCard } from "@/components/MatchCard";
import { MatchCardSkeleton } from "@/components/MatchCardSkeleton";
import { AIPickCard } from "@/components/AIPickCard";
import { FiltersBar } from "@/components/FiltersBar";
import { OddsToggleRow } from "@/components/OddsToggleRow";
import { getUpcomingSoccerMatches, Match as ApiMatch } from "@/lib/api/odds-api";
import { formatMatchTime, formatAmericanOdds } from "@/lib/utils/time";
import { useMatches } from "@/contexts/MatchContext";

type Match = {
  id: string;
  league: string;
  time: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  oddsHome: string;
  oddsAway: string;
  oddsDraw?: string;
};

export default function Home() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [oddsFormat, setOddsFormat] = useState<"American" | "Decimal">("American");
  const [selectedLeague, setSelectedLeague] = useState<string>("All");
  const [selectedTime, setSelectedTime] = useState<string>("Today");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setMatches: setContextMatches } = useMatches();
  const [apiMatches, setApiMatches] = useState<ApiMatch[]>([]);

  // Fetch matches from API
  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apiMatches = await getUpcomingSoccerMatches();
      
      // Store in local state for access when navigating
      setApiMatches(apiMatches);
      
      // Store in context for access from other pages (before transformation)
      setContextMatches(apiMatches);
      
      // Transform API matches to component format
      const transformedMatches: Match[] = apiMatches.map((apiMatch: ApiMatch) => ({
        id: apiMatch.id,
        league: apiMatch.league,
        time: formatMatchTime(apiMatch.startTime),
        homeTeam: { name: apiMatch.homeTeam },
        awayTeam: { name: apiMatch.awayTeam },
        oddsHome: formatAmericanOdds(apiMatch.odds.home),
        oddsAway: formatAmericanOdds(apiMatch.odds.away),
        oddsDraw: formatAmericanOdds(apiMatch.odds.draw),
      }));
      
      setMatches(transformedMatches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matches');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  }, [setContextMatches]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Filter matches based on time (league filter removed - only showing Premier League)
  const filteredMatches = useMemo(() => {
    let filtered = matches;

    // Filter by time
    if (selectedTime !== "All") {
      filtered = filtered.filter(match => {
        const timeStr = match.time.toUpperCase();
        if (selectedTime === "Today") {
          return timeStr.includes("TODAY");
        } else if (selectedTime === "Tomorrow") {
          return timeStr.includes("TOMORROW");
        }
        return true;
      });
    }

    return filtered;
  }, [matches, selectedTime]);

  const selectedCount = selectedIds.size;
  const allSelected = selectedIds.size === filteredMatches.length && filteredMatches.length > 0;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredMatches.length;

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all filtered matches
      setSelectedIds(new Set(filteredMatches.map(m => m.id)));
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto min-h-screen w-full max-w-[480px] pb-24">
        <Header />
        <main className="px-4 pb-6">
          <section className="pt-4 space-y-3">
            <AIPickCard oddsFormat={oddsFormat} />
            <FiltersBar 
              selectedLeague={selectedLeague} 
              onLeagueChange={setSelectedLeague}
              selectedTime={selectedTime}
              onTimeChange={setSelectedTime}
            />
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                className="rounded-full px-4 py-2 text-sm font-medium active:scale-98 transition-all duration-150"
                style={{
                  backgroundColor: allSelected ? "#8BADC6" : "#1D293D",
                  color: allSelected ? "#ffffff" : "#94a3b8",
                  fontSize: "13px",
                  fontWeight: 500,
                  height: "36px",
                  border: "none",
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "scale(0.98)";
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.opacity = "1";
                }}
                onClick={handleSelectAll}
              >
                {allSelected ? "Deselect All" : "Select All"}
              </button>
              <OddsToggleRow format={oddsFormat} onFormatChange={setOddsFormat} />
            </div>
            <div className="space-y-3 transition-opacity duration-300">
              {loading ? (
                // Loading skeleton
                <>
                  {[...Array(4)].map((_, i) => (
                    <MatchCardSkeleton key={i} />
                  ))}
                </>
              ) : error ? (
                // Error state
                <div className="rounded-[16px] px-6 py-8 border text-center" style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}>
                  <div className="text-text-primary mb-4" style={{ fontSize: "16px", fontWeight: 500 }}>
                    {error}
                  </div>
                  <button
                    type="button"
                    className="rounded-[12px] px-5 py-3 text-sm font-semibold text-white"
                    style={{
                      background: "linear-gradient(135deg, #0EA5E9 0%, #3b82f6 100%)",
                      boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
                    }}
                    onClick={fetchMatches}
                  >
                    Retry
                  </button>
                </div>
              ) : filteredMatches.length > 0 ? (
                filteredMatches.map((m) => (
                  <MatchCard
                    key={m.id}
                    id={m.id}
                    league={m.league}
                    time={m.time}
                    homeTeam={m.homeTeam}
                    awayTeam={m.awayTeam}
                    oddsHome={m.oddsHome}
                    oddsAway={m.oddsAway}
                    oddsDraw={m.oddsDraw}
                    selected={selectedIds.has(m.id)}
                    onToggle={() => handleToggle(m.id)}
                    oddsFormat={oddsFormat}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  No matches found for this filter
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
      {selectedCount >= 2 && (
        <div
          className="fixed left-0 right-0 bottom-24 z-20"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto w-[calc(100%-32px)] max-w-[480px] rounded-[16px] p-4"
            style={{ 
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              boxShadow: "0 -4px 16px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 flex flex-col items-center text-center" style={{ fontSize: "16px", fontWeight: 500, color: "#ffffff", lineHeight: 1.3 }}>
                <div>{selectedCount} {selectedCount === 1 ? "match" : "matches"}</div>
                <div>selected</div>
              </div>
              <button
                className="rounded-[12px] px-5 py-3 text-sm font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #0EA5E9 0%, #3b82f6 100%)",
                  boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
                }}
                onClick={() => {
                  const ids = Array.from(selectedIds);
                  
                  if (ids.length < 2) {
                    alert('Please select at least 2 matches');
                    return;
                  }
                  
                  // Get full match objects from API matches
                  const selectedMatches = apiMatches.filter(m => ids.includes(m.id));
                  
                  if (selectedMatches.length === 0) {
                    console.error('No matches found for selected IDs');
                    alert('Error: Could not find selected matches. Please try again.');
                    return;
                  }
                  
                  // Store in localStorage
                  localStorage.setItem('selectedMatches', JSON.stringify(selectedMatches));
                  console.log('✅ Stored', selectedMatches.length, 'matches in localStorage');
                  
                  // Navigate to parlay analysis
                  router.push('/parlay-analysis');
                }}
              >
                Analyze Parlay →
              </button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}
