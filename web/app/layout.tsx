import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BetslipProvider } from "@/contexts/BetslipContext";
import { MatchProvider } from "@/contexts/MatchContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Parlays for Days",
  description: "AI-powered sports betting analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-text-primary`}
      >
        <BetslipProvider>
          <MatchProvider>
            {children}
          </MatchProvider>
        </BetslipProvider>
      </body>
    </html>
  );
}
