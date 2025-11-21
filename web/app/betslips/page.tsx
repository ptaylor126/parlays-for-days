"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { useBetslip } from "@/contexts/BetslipContext";
import { Toast } from "@/components/Toast";

function calculateWinnings(betAmount: number, oddsString: string): number {
  // Remove 'x' and parse odds (e.g., "4.85x" -> 4.85)
  const odds = parseFloat(oddsString.replace("x", ""));
  return betAmount * odds;
}

function SegmentedTabs({ value, onChange }: { value: "active" | "saved"; onChange: (v: "active" | "saved") => void }) {
  return (
    <div className="mt-3 mb-4 flex items-center justify-between gap-6 px-2">
      <button
        className="flex-1 h-12 rounded-[20px] text-[16px] font-medium transition-all duration-200"
        style={{
          background: value === "active" ? "#8BADC6" : "#1D293D",
          color: value === "active" ? "#ffffff" : "#94a3b8",
          border: value === "active" ? "1px solid #8BADC6" : "1px solid transparent",
        }}
        onClick={() => onChange("active")}
      >
        Active
      </button>
      <button
        className="flex-1 h-12 rounded-[20px] text-[16px] font-medium transition-all duration-200"
        style={{
          background: value === "saved" ? "#8BADC6" : "#1D293D",
          color: value === "saved" ? "#ffffff" : "#94a3b8",
          border: value === "saved" ? "1px solid #8BADC6" : "1px solid transparent",
        }}
        onClick={() => onChange("saved")}
      >
        Saved
      </button>
    </div>
  );
}

function ActiveBetslipEmpty() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="text-[48px] mb-4">🎯</div>
      <div className="text-[20px] font-bold text-white mb-2">Active Betslip</div>
      <div className="text-[14px] text-[#94a3b8] mb-4 max-w-[280px]">
        No bets added yet.
      </div>
      <div className="text-[14px] text-[#94a3b8] mb-6 max-w-[280px]">
        Browse matches and tap "Add to Betslip" to build your picks.
      </div>
      <div className="text-[12px] text-[#64748b] max-w-[280px] leading-relaxed">
        Note: This app is for organizing bets - you'll need to place them with your bookmaker.
      </div>
    </div>
  );
}

function BetAmountToggle({ amount, selected, onClick }: { amount: number; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-[20px] px-4 py-2 text-xs font-medium transition-all duration-200 active:scale-95"
      style={{
        background: selected ? "#8BADC6" : "#1D293D",
        border: "2px solid transparent",
        color: selected ? "#ffffff" : "#94a3b8",
      }}
    >
      ${amount}
    </button>
  );
}

function ActiveBetslipContent({ bets, combinedOdds, onSave, onClear, onRemove }: { 
  bets: Array<{ id: string; label: string; odds: string }>;
  combinedOdds: string;
  onSave: () => void;
  onClear: () => void;
  onRemove: (betId: string) => void;
}) {
  const [selectedAmount, setSelectedAmount] = useState<number>(1);
  const potentialWinnings = calculateWinnings(selectedAmount, combinedOdds);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[20px]">🔥</span>
        <h2 className="text-[20px] font-bold text-white">Active Betslip</h2>
      </div>
      
      <div className="text-[16px] text-[#94a3b8] mb-4">
        {bets.length} {bets.length === 1 ? "bet" : "bets"} selected
      </div>

      <div className="rounded-[12px] border p-4" style={{ background: "#1e293b", borderColor: "#334155" }}>
        <div className="space-y-3">
          {bets.map((bet) => (
            <div key={bet.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => onRemove(bet.id)}
                  className="text-[#ef4444] text-xs font-medium active:scale-95 transition-transform duration-100"
                  style={{ minWidth: "50px" }}
                >
                  ×
                </button>
                <div className="text-[15px] text-white flex-1">
                  • {bet.label}
                </div>
              </div>
              <div className="text-[15px] font-medium" style={{ color: "#62748E" }}>
                {bet.odds}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t" style={{ borderColor: "#334155" }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[16px] text-[#94a3b8]">Combined Odds:</span>
            <span className="text-[24px] font-bold" style={{ color: "#62748E" }}>{combinedOdds}</span>
          </div>

          {/* Potential Winnings Section */}
          <div className="mt-4 space-y-3">
            <div className="text-[14px] text-[#94a3b8] mb-2">Potential Winnings:</div>
            <div className="flex items-center gap-2 mb-3">
              <BetAmountToggle amount={1} selected={selectedAmount === 1} onClick={() => setSelectedAmount(1)} />
              <BetAmountToggle amount={5} selected={selectedAmount === 5} onClick={() => setSelectedAmount(5)} />
              <BetAmountToggle amount={10} selected={selectedAmount === 10} onClick={() => setSelectedAmount(10)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#94a3b8]">Bet ${selectedAmount}:</span>
              <span className="text-[20px] font-bold text-[#10b981]">
                ${potentialWinnings.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="flex-1 rounded-[12px] py-3 text-center text-sm font-semibold text-white active:scale-95 transition-transform duration-100"
          style={{
            background: "linear-gradient(135deg, #0EA5E9 0%, #3b82f6 100%)",
            height: "48px",
          }}
        >
          Save This Betslip
        </button>
        <button
          onClick={onClear}
          className="px-6 rounded-[12px] py-3 text-center text-sm font-semibold text-white active:scale-95 transition-transform duration-100"
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            height: "48px",
          }}
        >
          Clear All
        </button>
      </div>

      <div className="text-[12px] text-[#64748b] text-center mt-4">
        Export to your bookmaker to place bets
      </div>
    </div>
  );
}

type SavedBetslipType = {
  id: string;
  name: string;
  bets: Array<{ label: string; odds: string }>;
  combinedOdds: string;
  savedAt: Date;
};

function SavedBetslipCard({ betslip, onShare, onDelete }: {
  betslip: SavedBetslipType;
  onShare: (betslip: SavedBetslipType) => void;
  onDelete: (id: string) => void;
}) {
  const formatDate = (date: Date) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${month} ${day}, ${year} • ${displayHours}:${displayMinutes} ${ampm}`;
  };

  return (
    <div className="rounded-[12px] border p-4" style={{ background: "#1e293b", borderColor: "#334155" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-[18px] font-bold text-white mb-1">{betslip.name}</div>
          <div className="text-[14px] text-[#94a3b8]">{formatDate(betslip.savedAt)}</div>
        </div>
        <div className="text-[24px] font-bold ml-4" style={{ color: "#62748E" }}>{betslip.combinedOdds}</div>
      </div>

      <div className="space-y-2 mb-4">
        {betslip.bets.map((bet, idx) => (
          <div key={idx} className="text-[14px] text-[#94a3b8]">
            • {bet.label} ({bet.odds})
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: "#334155" }}>
        <button
          onClick={() => onShare(betslip)}
          className="flex-1 rounded-[8px] px-4 py-2 text-sm font-medium text-white active:scale-95 transition-transform duration-100"
          style={{
            background: "#1e293b",
            border: "1px solid #3b82f6",
            color: "#3b82f6",
          }}
        >
          Share
        </button>
        <button
          onClick={() => onDelete(betslip.id)}
          className="rounded-[8px] px-4 py-2 text-sm font-medium text-white active:scale-95 transition-transform duration-100"
          style={{
            background: "#1e293b",
            border: "1px solid #ef4444",
            color: "#ef4444",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function SavedBetslipsEmpty() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="text-[48px] mb-4">📋</div>
      <div className="text-[18px] font-bold text-white mb-2">No saved betslips</div>
      <div className="text-[14px] text-[#94a3b8] mb-6 max-w-[280px]">
        Save betslips from the Active tab to organize your picks.
      </div>
      <Link
        href="/"
        className="inline-block w-full rounded-[12px] text-center text-[14px] font-bold text-white"
        style={{
          height: 48,
          lineHeight: "48px",
          background: "linear-gradient(135deg, #0EA5E9 0%, #3b82f6 100%)",
          boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
        }}
      >
        Browse Matches
      </Link>
    </div>
  );
}

function DeleteConfirmModal({ isOpen, onConfirm, onCancel }: { isOpen: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="rounded-[16px] border p-6 mx-4 max-w-[320px] w-full"
        style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[18px] font-semibold text-white mb-2">Delete Betslip?</div>
        <div className="text-[14px] text-[#94a3b8] mb-6">
          Are you sure you want to delete this betslip? This action cannot be undone.
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-[12px] py-3 text-center text-sm font-semibold text-white active:scale-95 transition-transform duration-100"
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-[12px] py-3 text-center text-sm font-semibold text-white active:scale-95 transition-transform duration-100"
            style={{
              background: "#ef4444",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BetslipsPage() {
  const [tab, setTab] = useState<"active" | "saved">("active");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [betSlipToDelete, setBetSlipToDelete] = useState<string | null>(null);
  const router = useRouter();
  const { activeBets, savedBetslips, saveBetslip, clearActive, removeBet, deleteBetslip, calculateCombinedOdds } = useBetslip();

  const handleSave = () => {
    if (activeBets.length === 0) return;
    saveBetslip();
    setToastMessage("Betslip saved ✓");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleShare = async (betslip: SavedBetslipType) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = betslip.savedAt;
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    const shareText = `My Betslip - ${month} ${day}, ${year}
${betslip.name} (${betslip.combinedOdds})

${betslip.bets.map((bet) => `• ${bet.label} (${bet.odds})`).join("\n")}

Built with Parlays for Days`;

    try {
      await navigator.clipboard.writeText(shareText);
      setToastMessage("Copied to clipboard!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setToastMessage("Failed to copy");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleDeleteClick = (id: string) => {
    setBetSlipToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (betSlipToDelete) {
      deleteBetslip(betSlipToDelete);
      setShowDeleteModal(false);
      setBetSlipToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setBetSlipToDelete(null);
  };

  const combinedOdds = calculateCombinedOdds(activeBets);

  return (
    <div className="min-h-screen">
      <div className="mx-auto min-h-screen w-full max-w-[480px] pb-24">
        {/* Header */}
        <header className="h-14 flex items-center px-4 relative">
          <button
            className="absolute left-4 text-sm text-[--text-secondary] active:scale-95"
            onClick={() => router.back()}
          >
            ← Back
          </button>
          <h1 className="flex-1 text-center text-[24px] font-bold text-white">My Betslips</h1>
        </header>

        <main className="px-4 pb-6">
          <SegmentedTabs value={tab} onChange={setTab} />

          {tab === "active" ? (
            activeBets.length === 0 ? (
              <ActiveBetslipEmpty />
            ) : (
              <ActiveBetslipContent
                bets={activeBets}
                combinedOdds={combinedOdds}
                onSave={handleSave}
                onClear={clearActive}
                onRemove={removeBet}
              />
            )
          ) : (
            savedBetslips.length === 0 ? (
              <SavedBetslipsEmpty />
            ) : (
              <div className="space-y-4">
                {savedBetslips.map((betslip) => (
                  <SavedBetslipCard
                    key={betslip.id}
                    betslip={betslip}
                    onShare={handleShare}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )
          )}
        </main>
      </div>
      <BottomNav />
      {showToast && (
        <Toast
          message={toastMessage}
          duration={2000}
          onClose={() => setShowToast(false)}
        />
      )}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
