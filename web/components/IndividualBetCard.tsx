"use client";
import React from "react";
import { useBetslip } from "@/contexts/BetslipContext";
import { Toast } from "@/components/Toast";

type IndividualBetCardProps = {
  betName: string;
  odds: string;
  description: string;
};

export function IndividualBetCard({ betName, odds, description }: IndividualBetCardProps) {
  const { addBet } = useBetslip();
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("Added to Active Betslip ✓");
  const [toastVariant, setToastVariant] = React.useState<"success" | "error">("success");

  const handleAddToBetslip = () => {
    const wasAdded = addBet({
      id: `individual-${betName}-${Date.now()}`,
      label: betName,
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

  return (
    <>
      <div
        className="rounded-[12px] border"
        style={{
          backgroundColor: "#1e293b",
          borderColor: "#334155",
          padding: "16px"
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-base font-bold text-white flex-1">{betName}</span>
          <span className="text-[20px] font-bold" style={{ color: "#10b981" }}>{odds}</span>
        </div>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "#94a3b8" }}>
          {description}
        </p>
        <button
          onClick={handleAddToBetslip}
          className="w-full rounded-[8px] py-2 text-center text-sm font-medium text-white active:scale-95 transition-transform duration-100"
          style={{
            background: "linear-gradient(135deg, #0EA5E9 0%, #3b82f6 100%)",
            height: "36px",
          }}
        >
          Add to Betslip
        </button>
      </div>
      {showToast && (
        <Toast
          message={toastMessage}
          duration={2000}
          variant={toastVariant}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}

