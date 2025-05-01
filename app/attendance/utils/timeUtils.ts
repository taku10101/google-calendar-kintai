/**
 * 現在時刻をHH:MM形式でフォーマットする
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

/**
 * 日付をYYYY/MM/DD形式でフォーマットする
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}/${month}/${day}`
}

/**
 * HH:MM形式の時間文字列をDateオブジェクトに変換する
 */
export function parseTimeString(timeString: string): Date | null {
  const [hours, minutes] = timeString.split(":").map(Number)

  if (isNaN(hours) || isNaN(minutes)) {
    return null
  }

  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}
