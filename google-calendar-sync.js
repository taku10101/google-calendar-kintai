/**
 * Google Apps Script (GAS) for syncing attendance records to Google Calendar
 *
 * このスクリプトをGoogle Apps Scriptとして保存し、トリガーを設定して毎日24時に実行するようにします。
 *
 * 設定手順:
 * 1. Google Driveで新しいGoogle Apps Scriptを作成
 * 2. このコードをコピー＆ペースト
 * 3. トリガーを設定（毎日24時に実行）
 * 4. カレンダーIDを設定（自分のカレンダーIDに変更）
 * 5. JSONファイルをGoogle Driveにアップロード（attendance_records.jsonという名前で）
 */

// カレンダーIDを設定（自分のカレンダーIDに変更してください）
const CALENDAR_ID = "primary" // 'primary'はデフォルトのカレンダー、または特定のカレンダーIDを指定

// JSONファイルのIDを設定（Google DriveにアップロードしたJSONファイルのIDに変更してください）
// ファイルのURLからIDを取得できます: https://drive.google.com/file/d/[ここがファイルID]/view
const JSON_FILE_ID = "YOUR_JSON_FILE_ID_HERE"

/**
 * メイン関数 - 勤怠データをカレンダーに同期
 */
function syncAttendanceToCalendar() {
  try {
    // 今日の日付を取得
    const today = new Date()
    const formattedDate = Utilities.formatDate(today, "Asia/Tokyo", "yyyy/MM/dd")

    // JSONファイルから勤怠データを取得
    const attendanceRecords = getAttendanceRecords()

    // 今日の勤怠記録をフィルタリング
    const todayRecords = attendanceRecords.filter((record) => record.date === formattedDate)

    if (todayRecords.length === 0) {
      Logger.log("今日の勤怠記録はありません: " + formattedDate)
      return
    }

    // カレンダーに登録
    addToCalendar(todayRecords)

    Logger.log("カレンダー同期が完了しました: " + todayRecords.length + "件の記録")
  } catch (error) {
    Logger.log("エラーが発生しました: " + error.toString())
  }
}

/**
 * Google DriveからJSONファイルを読み込み、勤怠データを取得
 */
function getAttendanceRecords() {
  try {
    // DriveからJSONファイルを取得
    const file = DriveApp.getFileById(JSON_FILE_ID)
    const content = file.getBlob().getDataAsString()

    // JSONをパース
    return JSON.parse(content)
  } catch (error) {
    Logger.log("JSONファイルの読み込みに失敗しました: " + error.toString())
    return []
  }
}

/**
 * 勤怠記録をGoogle Calendarに追加
 */
function addToCalendar(records) {
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID)

  if (!calendar) {
    Logger.log("カレンダーが見つかりません: " + CALENDAR_ID)
    return
  }

  // 各記録をカレンダーに追加
  records.forEach((record) => {
    if (!record.clockInTime || !record.clockOutTime) {
      Logger.log("出勤または退勤時間が記録されていません: " + record.id)
      return
    }

    // 日付と時間を解析
    const [year, month, day] = record.date.split("/").map(Number)
    const [inHour, inMinute, inSecond] = record.clockInTime.split(":").map(Number)
    const [outHour, outMinute, outSecond] = record.clockOutTime.split(":").map(Number)

    // 開始時間と終了時間を作成
    const startTime = new Date(year, month - 1, day, inHour, inMinute, inSecond)
    const endTime = new Date(year, month - 1, day, outHour, outMinute, outSecond)

    // タイトルを設定
    const title = record.title ? record.title : "勤務"

    // 説明を設定
    const description = `勤務時間: ${record.workingHours.toFixed(2)}時間\nID: ${record.id}`

    // カレンダーにイベントを作成
    try {
      // 同じIDのイベントが既に存在するか確認（重複登録防止）
      const existingEvents = calendar.getEventsForDay(startTime)
      const eventExists = existingEvents.some((event) => event.getDescription().includes(`ID: ${record.id}`))

      if (!eventExists) {
        calendar.createEvent(title, startTime, endTime, {
          description: description,
        })
        Logger.log("イベントを作成しました: " + title + " (" + record.date + ")")
      } else {
        Logger.log("イベントは既に存在します: " + title + " (" + record.date + ")")
      }
    } catch (error) {
      Logger.log("イベント作成に失敗しました: " + error.toString())
    }
  })
}

/**
 * テスト用関数 - 手動実行用
 */
function testSync() {
  syncAttendanceToCalendar()
}
