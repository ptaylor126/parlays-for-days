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
 * Convert Decimal odds to American odds
 * @param decimal - Decimal odds number (e.g., 1.67, 3.20)
 * @returns American odds string (e.g., "-150", "+220")
 */
export function decimalToAmerican(decimal: number): string {
  if (decimal >= 2) {
    // Positive American odds: (decimal - 1) * 100
    return `+${Math.round((decimal - 1) * 100)}`;
  } else {
    // Negative American odds: -100 / (decimal - 1)
    return `${Math.round(-100 / (decimal - 1))}`;
  }
}

/**
 * Format odds based on format type
 * Handles both American and Decimal input formats
 * @param odds - Odds string (American: "-150", "+220" or Decimal: "1.67", "3.20")
 * @param format - "American" or "Decimal"
 * @returns Formatted odds string
 */
export function formatOdds(odds: string, format: "American" | "Decimal"): string {
  // Check if input is decimal format (contains decimal point and no + or - at start)
  const isDecimalInput = odds.includes('.') && !odds.startsWith('+') && !odds.startsWith('-');
  
  if (isDecimalInput) {
    // Input is decimal, convert if needed
    const decimal = parseFloat(odds);
    if (format === "Decimal") {
      return formatDecimal(decimal);
    } else {
      return decimalToAmerican(decimal);
    }
  } else {
    // Input is American format
    if (format === "Decimal") {
      const decimal = americanToDecimal(odds);
      return formatDecimal(decimal);
    }
    return odds;
  }
}

