"use client";
import React from "react";
import { useBetslip } from "@/contexts/BetslipContext";
import { Toast } from "@/components/Toast";

type BadgeVariant = "green" | "amber" | "blue";

type ParlayCardProps = {
  badgeText: string;
  badgeVariant: BadgeVariant;
  odds: string; // e.g., 4.85x
  confidence: number; // percentage
  legs: { label: string; odds: string }[];
  why: string[];
  combinedOdds?: string;
  onAdd?: () => void;
};

const badgeBgByVariant: Record<BadgeVariant, string> = {
  green: "#10b981",
  amber: "#f59e0b",
  blue: "#3b82f6",
};

export function ParlayCard({ badgeText, badgeVariant, odds, confidence, legs, why, combinedOdds, onAdd }: ParlayCardProps) {
  const { addBets } = useBetslip();
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("Added to Active Betslip ✓");
  const [toastVariant, setToastVariant] = React.useState<"success" | "error">("success");

  const handleAddToBetslip = () => {
    // Prepare all bets to add
    const betsToAdd = legs.map((leg, idx) => ({
      id: `parlay-${badgeText}-${idx}-${Date.now()}`,
      label: leg.label,
      odds: leg.odds,
    }));

    // Add all bets at once to avoid state update timing issues
    const addedCount = addBets(betsToAdd);
    const duplicateCount = betsToAdd.length - addedCount;

    // Set appropriate toast message and variant
    if (duplicateCount > 0 && addedCount === 0) {
      setToastMessage("Bet already in betslip");
      setToastVariant("error");
    } else if (duplicateCount > 0) {
      setToastMessage(`${addedCount} added, ${duplicateCount} duplicate${duplicateCount > 1 ? "s" : ""}`);
      setToastVariant("error");
    } else {
      setToastMessage("Added to Active Betslip ✓");
      setToastVariant("success");
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    
    // Call optional onAdd callback if provided
    onAdd?.();
  };

  return (
    <div
      className="rounded-[16px] border"
      style={{ 
        backgroundColor: "#1e293b", 
        borderColor: "#334155",
        padding: "20px"
      }}
    >
      {/* Header: Badge + Odds */}
      <div className="flex flex-col mb-3 relative">
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs uppercase text-white"
            style={{ 
              backgroundColor: badgeBgByVariant[badgeVariant],
              fontWeight: 500
            }}
          >
            {badgeText}
          </span>
          <div className="text-[28px] font-bold text-white relative" style={{ fontWeight: 700 }}>
            {odds}
            {/* Confidence Badge - Positioned below odds, aligned right */}
            <span
              className="absolute"
              style={{
                top: "32px",
                right: "0",
                backgroundColor: "rgba(30, 64, 175, 0.8)",
                border: "none",
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#60a5fa",
                width: "auto",
              }}
            >
              ~{confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Legs */}
      <div className="space-y-2 mb-4">
        {legs.map((leg, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-[15px] text-white flex-1">{leg.label}</span>
            <span className="text-[15px]" style={{ color: "#94a3b8" }}>{leg.odds}</span>
          </div>
        ))}
      </div>

      {/* Why This Works */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-white mb-2">Why This Works</div>
        <ul className="space-y-1" style={{ paddingLeft: "0", listStyle: "none", textAlign: "left" }}>
          {why.map((reason, idx) => (
            <li 
              key={idx} 
              className="text-sm" 
              style={{ 
                color: "#94a3b8",
                paddingLeft: "1em",
                textIndent: "-1em",
                marginLeft: "1em",
                listStylePosition: "outside",
                marginBottom: idx < why.length - 1 ? "8px" : "0",
                paddingBottom: idx < why.length - 1 ? "8px" : "0"
              }}
            >
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Add to Betslip Button */}
      <button
        type="button"
        className="w-full rounded-[12px] py-3 text-center text-sm font-medium text-white active:scale-95 transition-transform duration-100"
        style={{
          background: "linear-gradient(135deg, #0EA5E9 0%, #1e3a8a 100%)",
          height: "48px"
        }}
        onClick={handleAddToBetslip}
      >
        Add to Betslip
      </button>
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
