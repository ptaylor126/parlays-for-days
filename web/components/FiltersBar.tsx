"use client";
import React from "react";

function LeaguePill({ active, label, onClick }: { active: boolean; label: string; onClick?: () => void }) {
  return (
    <button
      className="mr-2 whitespace-nowrap rounded-[20px] px-4 py-2 text-xs font-medium transition-all duration-300"
      style={{
        background: active ? "#8BADC6" : "#1D293D",
        border: "2px solid transparent",
        color: active ? "#ffffff" : "#94a3b8",
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function TimePill({ active, label, onClick }: { active: boolean; label: string; onClick?: () => void }) {
  return (
    <button
      className="mr-2 whitespace-nowrap rounded-[20px] px-3 py-2 text-xs transition-none"
      style={{
        background: "transparent",
        border: active ? "2px solid #8BADC6" : "2px solid #1D293D",
        color: active ? "#8BADC6" : "#94a3b8",
        fontWeight: active ? "bold" : "normal",
        transform: "none",
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

type FiltersBarProps = {
  selectedLeague?: string;
  onLeagueChange?: (league: string) => void;
  selectedTime?: string;
  onTimeChange?: (time: string) => void;
};

export function FiltersBar({ selectedLeague = "All", onLeagueChange, selectedTime = "All", onTimeChange }: FiltersBarProps) {
  const leagues = ["All", "Premier League", "Champions League", "Bundesliga", "La Liga", "Serie A", "Ligue 1", "Championship", "Eredivisie", "Liga MX"];
  const times = ["All", "Today", "Tomorrow"];

  const handleLeagueClick = (league: string) => {
    onLeagueChange?.(league);
  };

  const handleTimeClick = (time: string) => {
    onTimeChange?.(time);
  };

  return (
    <div className="space-y-3">
      {/* League filter hidden - only showing Premier League matches */}
      {/* <div className="overflow-x-auto scroll-smooth hide-scrollbar" style={{ scrollBehavior: "smooth" }}>
        <div className="flex items-center whitespace-nowrap" style={{ paddingRight: "80px" }}>
          {leagues.map((l) => (
            <LeaguePill key={l} active={selectedLeague === l} label={l} onClick={() => handleLeagueClick(l)} />
          ))}
        </div>
      </div> */}
      <div className="overflow-x-auto scroll-smooth hide-scrollbar">
        <div className="flex items-center pr-4 whitespace-nowrap">
          {times.map((t) => (
            <TimePill key={t} active={selectedTime === t} label={t} onClick={() => handleTimeClick(t)} />
          ))}
        </div>
      </div>
    </div>
  );
}


