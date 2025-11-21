import React from "react";
import Image from "next/image";

export function Header() {
  return (
    <header className="h-14 flex items-center px-4 text-text-primary">
      <div className="flex items-center gap-2">
        <Image src="/assets/logos/parlays-for-days.png" alt="Parlays for Days" width={24} height={20} />
        <div className="text-xl font-bold tracking-tight">Parlays for Days</div>
      </div>
    </header>
  );
}


