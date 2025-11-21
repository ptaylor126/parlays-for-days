"use client";
import React from "react";

type OddsFormat = "American" | "Decimal";

type OddsToggleRowProps = {
  format: OddsFormat;
  onFormatChange: (format: OddsFormat) => void;
};

export function OddsToggleRow({ format, onFormatChange }: OddsToggleRowProps) {
  const isAmerican = format === "American";
  
  const handleToggle = () => {
    onFormatChange(isAmerican ? "Decimal" : "American");
  };

  return (
    <div className="flex justify-end">
      <div className="flex items-center gap-2 text-[12px] font-medium">
        <span style={{ color: isAmerican ? "#ffffff" : "#94a3b8" }}>American</span>
        <button
          type="button"
          aria-label="Toggle odds format"
          onClick={handleToggle}
          className="relative h-6 w-11 rounded-full transition-colors duration-200"
          style={{ 
            background: isAmerican ? "#1e293b" : "#90A1B9",
            padding: "2px",
          }}
        >
          <span
            className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition-all duration-200 shadow-sm"
            style={{ 
              left: isAmerican ? "2px" : "calc(100% - 22px)",
            }}
          />
        </button>
        <span style={{ color: !isAmerican ? "#ffffff" : "#94a3b8" }}>Decimal</span>
      </div>
    </div>
  );
}


