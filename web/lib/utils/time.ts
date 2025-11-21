/**
 * Format a UTC date string to a user-friendly time format
 * @param utcTime - ISO 8601 date string (UTC)
 * @returns Formatted time string like "TODAY 15:00" or "Tomorrow 18:30"
 */
export function formatMatchTime(utcTime: string): string {
  const date = new Date(utcTime);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const matchDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Get local time
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  // Determine if it's today, tomorrow, or later
  if (matchDate.getTime() === today.getTime()) {
    return `TODAY ${timeStr}`;
  } else if (matchDate.getTime() === tomorrow.getTime()) {
    return `Tomorrow ${timeStr}`;
  } else {
    // Format as "Mon 15:00" or "Jan 15 • 15:00" for dates further out
    const daysDiff = Math.floor((matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      return `${dayName} ${timeStr}`;
    } else {
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${monthDay} • ${timeStr}`;
    }
  }
}

/**
 * Convert American odds number to string format
 * @param odds - American odds number
 * @returns Formatted string (e.g., "+140", "-150")
 */
export function formatAmericanOdds(odds: number): string {
  if (odds === 0) return '+100';
  return odds >= 0 ? `+${odds}` : `${odds}`;
}

