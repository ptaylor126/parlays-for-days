"use client";
import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";

export default function ProfilePage() {
  const [oddsFormat, setOddsFormat] = useState<"American" | "Decimal">("American");
  const [notifications, setNotifications] = useState<boolean>(true);

  return (
    <div className="min-h-screen">
      <div className="mx-auto min-h-screen w-full max-w-[480px] pb-24">
        {/* Header */}
        <header className="h-14 flex items-center px-4">
          <h1 className="text-xl font-bold text-text-primary">Profile</h1>
        </header>

        <main className="px-4 pb-6 space-y-6">
          {/* Settings */}
          <section>
            <h2 className="mb-3 text-sm font-medium text-[--text-secondary]">Settings</h2>
            <div
              className="rounded-[12px] border"
              style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
            >
              <div className="flex items-center justify-between px-4 py-4">
                <div>
                  <div className="text-base font-semibold text-white">Odds Format</div>
                  <div className="text-sm text-[--text-secondary]">American / Decimal</div>
                </div>
                <button
                  type="button"
                  className="rounded-[20px] px-3 py-2 text-sm font-medium text-white"
                  style={{
                    background: "linear-gradient(135deg, #0EA5E9 0%, #3b82f6 100%)",
                    boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
                  }}
                  onClick={() => setOddsFormat((v) => (v === "American" ? "Decimal" : "American"))}
                >
                  {oddsFormat}
                </button>
              </div>
              <div className="h-px w-full" style={{ background: "#334155" }} />
              <div className="flex items-center justify-between px-4 py-4">
                <div>
                  <div className="text-base font-semibold text-white">Notifications</div>
                  <div className="text-sm text-[--text-secondary]">On / Off</div>
                </div>
                <button
                  type="button"
                  className="rounded-[20px] px-3 py-2 text-sm font-medium text-white"
                  style={{
                    background: notifications ? "#22c55e" : "#475569",
                  }}
                  onClick={() => setNotifications((v) => !v)}
                >
                  {notifications ? "On" : "Off"}
                </button>
              </div>
            </div>
          </section>

          {/* Help & Support */}
          <section>
            <h2 className="mb-3 text-sm font-medium text-[--text-secondary]">Help &amp; Support</h2>
            <div
              className="rounded-[12px] border divide-y"
              style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
            >
              <Link href="#" className="block px-4 py-4 text-white">FAQ</Link>
              <Link href="#" className="block px-4 py-4 text-white">Contact Support</Link>
              <div className="px-4 py-4 text-white">About Parlays for Days</div>
            </div>
          </section>

          {/* Responsible Gambling */}
          <section>
            <h2 className="mb-3 text-sm font-medium text-[--text-secondary]">Responsible Gambling</h2>
            <div
              className="rounded-[12px] border divide-y"
              style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
            >
              <a
                href="https://www.gamblersanonymous.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-4 text-white hover:opacity-80 transition-opacity"
              >
                <div className="font-semibold">Gamblers Anonymous</div>
                <div className="text-sm text-[--text-secondary] mt-1">www.gamblersanonymous.org</div>
              </a>
              <div className="px-4 py-4">
                <div className="font-semibold text-white mb-1">Gamblers Anonymous Helpline</div>
                <a
                  href="tel:+1-213-386-8789"
                  className="text-[#0EA5E9] text-sm hover:opacity-80 transition-opacity"
                >
                  (213) 386-8789
                </a>
              </div>
              <a
                href="https://www.ncpgambling.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-4 text-white hover:opacity-80 transition-opacity"
              >
                <div className="font-semibold">National Council on Problem Gambling</div>
                <div className="text-sm text-[--text-secondary] mt-1">www.ncpgambling.org</div>
              </a>
              <div className="px-4 py-4">
                <div className="font-semibold text-white mb-1">NCPG Helpline</div>
                <a
                  href="tel:+1-800-522-4700"
                  className="text-[#0EA5E9] text-sm hover:opacity-80 transition-opacity"
                >
                  1-800-522-4700
                </a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-2 text-center">
            <div className="text-xs text-[--text-tertiary]">Parlays for Days v0.1.0</div>
            <div className="mt-1 text-xs text-[--text-tertiary]">© 2025 P4Ds</div>
          </footer>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}


