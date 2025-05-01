import type { AttendanceRecord } from "../types/attendance"

// Google Apps Script WebアプリのURL
// 実際のデプロイ後のURLに置き換える必要があります
const GAS_WEB_APP_URL = process.env.NEXT_PUBLIC_GAS_WEB_APP_URL || ""

/**
 * 勤怠記録を取得する
 */
export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const response = await fetch(`${GAS_WEB_APP_URL}?action=getRecords`, {
      method: "GET",
      mode: "cors",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.records || []
  } catch (error) {
    console.error("Error fetching attendance records:", error)
    return []
  }
}

/**
 * 出勤を記録する
 */
export async function recordCheckIn(title: string): Promise<boolean> {
  try {
    const response = await fetch(`${GAS_WEB_APP_URL}`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "checkIn",
        title: title,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.success || false
  } catch (error) {
    console.error("Error recording check-in:", error)
    return false
  }
}

/**
 * 退勤を記録する
 */
export async function recordCheckOut(title: string, checkoutTime: string, eventId: string): Promise<boolean> {
  try {
    const response = await fetch(`${GAS_WEB_APP_URL}`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "checkOut",
        title: title,
        checkoutTime: checkoutTime,
        eventId: eventId,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.success || false
  } catch (error) {
    console.error("Error recording check-out:", error)
    return false
  }
}
