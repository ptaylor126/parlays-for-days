"use client";
import React from "react";
import { useBetslip } from "@/contexts/BetslipContext";
import { Toast } from "@/components/Toast";

type UpsetAlertCardProps = {
  type: "high" | "moderate";
  title: string;
  odds: string;
  description: string;
};

export function UpsetAlertCard({ type, title, odds, description }: UpsetAlertCardProps) {
  const { addBet } = useBetslip();
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("Added to Active Betslip ✓");
  const [toastVariant, setToastVariant] = React.useState<"success" | "error">("success");
  const borderColor = type === "high" ? "#ef4444" : "#f59e0b";
  const icon = type === "high" ? "🔴" : "🟡";

  const handleAddToBetslip = () => {
    const wasAdded = addBet({
      id: `upset-${title}-${Date.now()}`,
      label: title,
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
        className="rounded-[12px] border-l"
        style={{
          backgroundColor: "#1e293b",
          borderLeftWidth: "4px",
          borderLeftColor: borderColor,
          padding: "16px"
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-base">{icon}</span>
            <span className="text-base font-bold text-white">{title}</span>
          </div>
          <span className="text-xl font-bold text-white">{odds}</span>
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

