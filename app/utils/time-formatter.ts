export function formatTime(timeString: string | null): string {
  if (!timeString) return "-"
  return timeString
}

export function formatDuration(hours: number): string {
  if (hours <= 0) return "0.00時間"
  return `${hours.toFixed(2)}時間`
}
