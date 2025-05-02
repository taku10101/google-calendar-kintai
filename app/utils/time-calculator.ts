// 時間文字列を分に変換
function timeStringToMinutes(timeString: string): number {
  const [hours, minutes, seconds] = timeString.split(":").map(Number)
  return hours * 60 + minutes + seconds / 60
}

// 勤務時間を計算（時間単位）
export function calculateWorkingHours(clockInTime: string, clockOutTime: string): number {
  const startMinutes = timeStringToMinutes(clockInTime)
  const endMinutes = timeStringToMinutes(clockOutTime)

  const workingMinutes = endMinutes - startMinutes

  // 時間に変換（小数点以下2桁まで）
  return Math.max(0, workingMinutes / 60)
}
