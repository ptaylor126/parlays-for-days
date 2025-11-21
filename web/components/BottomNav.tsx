"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBetslip } from "@/contexts/BetslipContext";

type Tab = {
  href: string;
  label: string;
  icon?: React.ReactNode;
};

const TABS: Tab[] = [
  { href: "/", label: "Home" },
  { href: "/betslips", label: "Betslips" },
  { href: "/profile", label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { activeBets } = useBetslip();
  const betCount = activeBets.length;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-end justify-center pb-4"
      style={{
        paddingBottom: `calc(16px + env(safe-area-inset-bottom))`,
        pointerEvents: "none",
      }}
    >
      <div
        className="flex items-center justify-between rounded-full px-8"
        style={{
          height: 64,
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(51, 65, 85, 0.5)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
          pointerEvents: "auto",
          minWidth: "280px",
          maxWidth: "400px",
        }}
      >
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 items-center justify-center"
              style={{ minWidth: "80px" }}
            >
              <div className="flex flex-col items-center justify-center">
                {tab.label === "Home" && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#ffffff" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 10.5 12 3l9 7.5"/>
                    <path d="M5 10v10h14V10"/>
                  </svg>
                )}
                {tab.label === "Betslips" && (
                  <div className="relative">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#ffffff" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="6" y="3" width="12" height="18" rx="2"/>
                      <path d="M9 7h6M9 11h6M9 15h6"/>
                    </svg>
                    {betCount > 0 && (
                      <span
                        className="absolute flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{
                          backgroundColor: "#ef4444",
                          minWidth: "20px",
                          top: "-6px",
                          right: "-8px",
                        }}
                      >
                        {betCount > 9 ? "9+" : betCount}
                      </span>
                    )}
                  </div>
                )}
                {tab.label === "Profile" && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#ffffff" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="4"/>
                    <path d="M5.5 21a8.5 8.5 0 0 1 13 0"/>
                  </svg>
                )}
                <span
                  className="mt-1 text-[12px] font-normal"
                  style={{ color: active ? "#ffffff" : "#64748b" }}
                >
                  {tab.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


