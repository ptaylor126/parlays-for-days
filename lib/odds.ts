/**
 * Convert American odds to Decimal odds
 * @param american - American odds string (e.g., "-150", "+220")
 * @returns Decimal odds as number (e.g., 1.67, 3.20)
 */
export function americanToDecimal(american: string): number {
  const num = parseInt(american);
  if (num < 0) {
    // Negative odds: (100 / abs(odds)) + 1
    return (100 / Math.abs(num)) + 1;
  } else {
    // Positive odds: (odds / 100) + 1
    return (num / 100) + 1;
  }
}

/**
 * Format decimal odds for display
 * @param decimal - Decimal odds number
 * @returns Formatted string with 2 decimal places (e.g., "1.67", "3.20")
 */
export function formatDecimal(decimal: number): string {
  return decimal.toFixed(2);
}

/**
 * Format odds based on format type
 * @param american - American odds string (e.g., "-150", "+220")
 * @param format - "American" or "Decimal"
 * @returns Formatted odds string
 */
export function formatOdds(american: string, format: "American" | "Decimal"): string {
  if (format === "Decimal") {
    const decimal = americanToDecimal(american);
    return formatDecimal(decimal);
  }
  return american;
}

