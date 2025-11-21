"use client";
import React from "react";
import Image from "next/image";

type AIPickCardProps = {
  oddsFormat?: "American" | "Decimal";
};

export function AIPickCard({ oddsFormat = "American" }: AIPickCardProps) {
  const teamLogoByName: Record<string, string> = {
    "Manchester City": "https://media.api-sports.io/football/teams/50.png",
    "Man United": "https://media.api-sports.io/football/teams/33.png",
  };

  return (
    <div
      className="rounded-[12px] p-4 text-white shadow-[--shadow-medium]"
      style={{
        background: "linear-gradient(135deg, #0EA5E9 0%, #1e3a8a 100%)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-medium opacity-90" style={{ fontWeight: 500 }}>AI PICK OF THE DAY</div>
      </div>
      {/* Match Line: [badge] Team vs [badge] Team - in a pill */}
      <div 
        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[14px] font-semibold"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full" style={{ background: "transparent" }}>
          <Image src={teamLogoByName["Manchester City"]} alt="Man City" width={16} height={16} style={{ objectFit: "contain", mixBlendMode: "normal" }} />
        </div>
        <span>Man City</span>
        <span className="opacity-90 text-[12px]">vs</span>
        <div className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full" style={{ background: "transparent" }}>
          <Image src={teamLogoByName["Man United"]} alt="Man Utd" width={16} height={16} style={{ objectFit: "contain", mixBlendMode: "normal" }} />
        </div>
        <span>Man Utd</span>
      </div>

      {/* Prediction Line: Dynamic emoji + prediction - in a pill */}
      <div 
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[14px] font-semibold"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(4px)",
        }}
      >
        <span className="text-sm">⚽</span>
        <span>Over 2.5</span>
      </div>

      <div className="mt-1 text-[12px] opacity-90">4.2x odds • 72% confidence</div>
      
      {/* Add to Slip Button */}
      <button
        className="mt-4 rounded-[6px] px-4 py-0.5 text-white active:scale-95 transition-transform duration-100"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
          fontSize: "11px",
          fontWeight: 400,
          height: "26px",
          minWidth: "44px",
        }}
      >
        Add to Slip
      </button>
    </div>
  );
}

export default AIPickCard;
