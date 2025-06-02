import type { AttendanceRecord } from "@/app/types/attendance"
// ical.jsを使う前提
// npm install ical.js が必要

import ICAL from 'ical.js'

// icsファイルのテキストをAttendanceRecord[]に変換
export async function importFromICalendar(icsText: string): Promise<AttendanceRecord[]> {
  const jcalData = ICAL.parse(icsText)
  const vcalendar = new ICAL.Component(jcalData)
  const vevents = vcalendar.getAllSubcomponents('vevent')

  const records: AttendanceRecord[] = vevents.map((vevent, idx) => {
    const event = new ICAL.Event(vevent)
    // 日付（YYYY/MM/DD）
    const start = event.startDate.toJSDate()
    const date = `${start.getFullYear()}/${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getDate()).padStart(2, '0')}`
    // 開始・終了時刻（HH:MM:SS）
    const clockInTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}:${String(start.getSeconds()).padStart(2, '0')}`
    let clockOutTime: string | null = null
    let workingHours = 0
    if (event.endDate) {
      const end = event.endDate.toJSDate()
      clockOutTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}:${String(end.getSeconds()).padStart(2, '0')}`
      workingHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }
    return {
      id: event.uid || `ical-${idx}`,
      date,
      title: event.summary || '',
      clockInTime,
      clockOutTime,
      workingHours,
    }
  })
  return records
} 