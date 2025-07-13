import type { AttendanceRecord } from "@/app/types/attendance"

export function exportToICalendar(records: AttendanceRecord[]): void {
  // iCalendarフォーマットの開始
  let icalContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//勤怠管理アプリ//JP",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ].join("\r\n")

  // 各勤怠記録をイベントとして追加
  records.forEach((record) => {
    if (!record.clockInTime || !record.clockOutTime) return

    // 日付と時間を結合してUTC形式に変換
    const startDate = convertToICalDateTime(record.date, record.clockInTime)
    
    // 日付をまたぐ場合の判定
    const [inHour, inMinute] = record.clockInTime.split(":").map(Number)
    const [outHour, outMinute] = record.clockOutTime.split(":").map(Number)
    const clockInMinutes = inHour * 60 + inMinute
    const clockOutMinutes = outHour * 60 + outMinute
    
    // 退勤時間が出勤時間より早い場合は翌日とみなす
    const isNextDay = clockOutMinutes < clockInMinutes
    const endDate = isNextDay 
      ? convertToICalDateTimeNextDay(record.date, record.clockOutTime)
      : convertToICalDateTime(record.date, record.clockOutTime)

    // タイトルを設定（タイトルがない場合はデフォルトのタイトルを使用）
    const summary = record.title ? `${record.title} - ${record.date}` : `勤務 - ${record.date}`

    // イベントの説明
    const description = `勤務時間: ${record.workingHours.toFixed(2)}時間`

    // イベントを追加
    icalContent += [
      "\r\nBEGIN:VEVENT",
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `UID:${record.id}@attendance-tracker`,
      "END:VEVENT",
    ].join("\r\n")
  })

  // iCalendarフォーマットの終了
  icalContent += "\r\nEND:VCALENDAR"

  // ファイルとしてダウンロード
  downloadFile(icalContent, "勤怠記録.ics", "text/calendar")
}

// 日付と時間を結合してiCalendar形式のUTC日時に変換
function convertToICalDateTime(dateStr: string, timeStr: string): string {
  // 日付形式を変換 (YYYY/MM/DD -> YYYYMMDD)
  const [year, month, day] = dateStr.split("/")

  // 時間形式を変換 (HH:MM:SS -> HHMMSS)
  const [hour, minute, second] = timeStr.split(":")

  // iCalendar形式の日時を返す (YYYYMMDDTHHMMSSZなど)
  // ここではローカル時間として扱う（実際のアプリではタイムゾーン変換が必要かもしれません）
  return `${year}${month}${day}T${hour}${minute}${second}`
}

// 翌日の日付と時間を結合してiCalendar形式のUTC日時に変換
function convertToICalDateTimeNextDay(dateStr: string, timeStr: string): string {
  // 日付を翌日に変更
  const [year, month, day] = dateStr.split("/").map(Number)
  const nextDay = new Date(year, month - 1, day + 1)
  
  const nextYear = nextDay.getFullYear()
  const nextMonth = String(nextDay.getMonth() + 1).padStart(2, "0")
  const nextDayStr = String(nextDay.getDate()).padStart(2, "0")

  // 時間形式を変換 (HH:MM:SS -> HHMMSS)
  const [hour, minute, second] = timeStr.split(":")

  return `${nextYear}${nextMonth}${nextDayStr}T${hour}${minute}${second}`
}

// ファイルをダウンロードする関数
function downloadFile(content: string, fileName: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()

  // クリーンアップ
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}
