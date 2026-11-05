/** Seconds as minutes, or hours and minutes past an hour: "4m", "1h05m". */
export function formatTimeSpent(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h${String(minutes).padStart(2, '0')}m`;
}
