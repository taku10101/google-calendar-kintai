// Google Apps Script側のコード

// カレンダーID（URLから取得）
const CALENDAR_ID = "YOUR_CALENDAR_ID" // 実際のカレンダーIDに置き換える

// 一時データ保存用のプロパティストア
const PROPERTY_STORE = PropertiesService.getScriptProperties()

/**
 * Webアプリとして公開した際のエントリーポイント
 */
function doGet(e) {
  const action = e.parameter.action

  if (action === "getRecords") {
    return getAttendanceRecords()
  }

  return ContentService.createTextOutput(
    JSON.stringify({
      success: false,
      message: "Invalid action",
    }),
  ).setMimeType(ContentService.MimeType.JSON)
}

/**
 * POSTリクエストの処理
 */
function doPost(e) {
  const data = JSON.parse(e.postData.contents)
  const action = data.action

  if (action === "checkIn") {
    return recordCheckIn(data.title)
  } else if (action === "checkOut") {
    return recordCheckOut(data.title, data.checkoutTime, data.eventId)
  }

  return ContentService.createTextOutput(
    JSON.stringify({
      success: false,
      message: "Invalid action",
    }),
  ).setMimeType(ContentService.MimeType.JSON)
}

/**
 * 勤怠記録を取得する（カレンダーから直近の予定を取得）
 */
function getAttendanceRecords() {
  try {
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID)
    if (!calendar) {
      throw new Error("カレンダーが見つかりません")
    }

    // 過去30日間の予定を取得
    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const events = calendar.getEvents(thirtyDaysAgo, now)
    const records = events.map((event) => {
      const title = event.getTitle()
      const startTime = event.getStartTime()
      const endTime = event.getEndTime()
      const isOngoing = event.getEndTime() > now && !event.getDescription().includes("退勤時間:")

      return {
        id: event.getId(),
        eventId: event.getId(),
        date: formatDate(startTime),
        title: title,
        checkinTime: formatTime(startTime),
        checkoutTime: isOngoing ? null : formatTime(endTime),
      }
    })

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        records: records,
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

/**
 * 出勤を記録する（カレンダーに予定を追加）
 */
function recordCheckIn(title) {
  try {
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID)
    if (!calendar) {
      throw new Error("カレンダーが見つかりません")
    }

    const now = new Date()
    const endTime = new Date(now.getTime())
    endTime.setHours(now.getHours() + 8) // 仮の終了時間（8時間後）

    // カレンダーに予定を追加
    const event = calendar.createEvent(title, now, endTime, {
      description: "出勤時間: " + formatTime(now) + "\n退勤予定: 未定",
    })

    const eventId = event.getId()

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        record: {
          id: eventId,
          eventId: eventId,
          date: formatDate(now),
          title: title,
          checkinTime: formatTime(now),
          checkoutTime: null,
        },
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

/**
 * 退勤を記録する（カレンダーの予定を更新）
 */
function recordCheckOut(title, checkoutTimeStr, eventId) {
  try {
    const calendar = CalendarApp.getCalendarById(CALENDAR_ID)
    if (!calendar) {
      throw new Error("カレンダーが見つかりません")
    }

    // イベントIDから予定を取得
    let event
    try {
      event = calendar.getEventById(eventId)
    } catch (e) {
      // イベントIDが無効な場合、タイトルで検索
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const events = calendar.getEvents(oneDayAgo, now, { search: title })

      // 最新の未完了イベントを探す
      for (let i = events.length - 1; i >= 0; i--) {
        if (!events[i].getDescription().includes("退勤時間:")) {
          event = events[i]
          break
        }
      }

      if (!event) {
        throw new Error("該当する出勤記録が見つかりません")
      }
    }

    // 退勤時間を解析
    const [hours, minutes] = checkoutTimeStr.split(":").map(Number)
    const checkoutTime = new Date()
    checkoutTime.setHours(hours, minutes, 0, 0)

    // 予定の終了時間を更新
    event.setEndTime(checkoutTime)

    // 説明文を更新
    const startTime = event.getStartTime()
    const description = "出勤時間: " + formatTime(startTime) + "\n退勤時間: " + checkoutTimeStr
    event.setDescription(description)

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

/**
 * 日付をYYYY/MM/DD形式でフォーマットする
 */
function formatDate(date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}/${month}/${day}`
}

/**
 * 時間をHH:MM形式でフォーマットする
 */
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}
