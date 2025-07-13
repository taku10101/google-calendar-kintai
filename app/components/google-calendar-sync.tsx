"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, Calendar, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { AttendanceRecord } from "@/app/types/attendance"

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
const SCOPES = "https://www.googleapis.com/auth/calendar.events"

interface GoogleCalendarSyncProps {
  open: boolean
  onClose: () => void
  records: AttendanceRecord[]
}

export default function GoogleCalendarSync({ open, onClose, records }: GoogleCalendarSyncProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGapiLoaded, setIsGapiLoaded] = useState(false)
  const [isGsiLoaded, setIsGsiLoaded] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // 完了した記録（出勤と退勤の両方が記録されているもの）をフィルタリング
  const completedRecords = records.filter((record) => record.clockInTime && record.clockOutTime)

  // Google APIのスクリプトを読み込む
  useEffect(() => {
    if (!open) return

    // すでにスクリプトが読み込まれている場合は何もしない
    if (document.getElementById("gapi-script") && document.getElementById("gsi-script")) {
      setIsGapiLoaded(true)
      setIsGsiLoaded(true)
      return
    }

    // GAPIスクリプトを読み込む
    const gapiScript = document.createElement("script")
    gapiScript.src = "https://apis.google.com/js/api.js"
    gapiScript.id = "gapi-script"
    gapiScript.async = true
    gapiScript.defer = true
    gapiScript.onload = () => {
      setIsGapiLoaded(true)
      window.gapi.load("client", initializeGapiClient)
    }
    document.body.appendChild(gapiScript)

    // GSIスクリプトを読み込む
    const gsiScript = document.createElement("script")
    gsiScript.src = "https://accounts.google.com/gsi/client"
    gsiScript.id = "gsi-script"
    gsiScript.async = true
    gsiScript.defer = true
    gsiScript.onload = () => {
      setIsGsiLoaded(true)
    }
    document.body.appendChild(gsiScript)

    return () => {
      // クリーンアップ（実際には削除しない）
    }
  }, [open])

  // GAPIクライアントを初期化
  const initializeGapiClient = async () => {
    try {
      await window.gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      })
    } catch (error) {
      console.error("Error initializing GAPI client:", error)
      setErrorMessage("Google APIの初期化に失敗しました。")
    }
  }

  // Google認証を行う
  const handleAuthClick = async () => {
    if (!isGapiLoaded || !isGsiLoaded) {
      setErrorMessage("Google APIの読み込みが完了していません。")
      return
    }

    setIsLoading(true)
    try {
      // Google Identity Servicesのクライアントを初期化
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.error) {
            throw new Error(response.error)
          }
          setIsAuthenticated(true)
          setIsLoading(false)
        },
      })

      // 認証リクエストを送信
      tokenClient.requestAccessToken({ prompt: "consent" })
    } catch (error) {
      console.error("Authentication error:", error)
      setErrorMessage("認証に失敗しました。")
      setIsLoading(false)
    }
  }

  // レコードの選択状態を切り替える
  const toggleRecordSelection = (id: string) => {
    setSelectedRecords((prev) => (prev.includes(id) ? prev.filter((recordId) => recordId !== id) : [...prev, id]))
  }

  // すべてのレコードを選択/解除する
  const toggleAllRecords = () => {
    if (selectedRecords.length === completedRecords.length) {
      setSelectedRecords([])
    } else {
      setSelectedRecords(completedRecords.map((record) => record.id))
    }
  }

  // 選択したレコードをGoogle Calendarに同期する
  const syncToGoogleCalendar = async () => {
    if (!isAuthenticated || selectedRecords.length === 0) return

    setSyncStatus("syncing")
    setIsLoading(true)

    try {
      // 選択されたレコードをフィルタリング
      const recordsToSync = completedRecords.filter((record) => selectedRecords.includes(record.id))

      // 各レコードをGoogle Calendarに追加
      for (const record of recordsToSync) {
        // 日付と時間を解析
        const [year, month, day] = record.date.split("/").map(Number)
        const [inHour, inMinute, inSecond] = record.clockInTime.split(":").map(Number)
        const [outHour, outMinute, outSecond] = record.clockOutTime!.split(":").map(Number)

        // 開始時間と終了時間を作成
        const startTime = new Date(year, month - 1, day, inHour, inMinute, inSecond)
        let endTime = new Date(year, month - 1, day, outHour, outMinute, outSecond)

        // 日付をまたぐ場合（退勤時間が出勤時間より早い場合）
        if (endTime <= startTime) {
          endTime = new Date(year, month - 1, day + 1, outHour, outMinute, outSecond)
        }

        // タイトルを設定
        const title = record.title ? record.title : "勤務"

        // 説明を設定
        const description = `勤務時間: ${record.workingHours.toFixed(2)}時間\nID: ${record.id}`

        // イベントを作成
        const event = {
          summary: title,
          description: description,
          start: {
            dateTime: startTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }

        // Google Calendarにイベントを追加
        await window.gapi.client.calendar.events.insert({
          calendarId: "primary",
          resource: event,
        })
      }

      setSyncStatus("success")
    } catch (error) {
      console.error("Error syncing to Google Calendar:", error)
      setErrorMessage("Google Calendarへの同期に失敗しました。")
      setSyncStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  // ダイアログを閉じる際にステータスをリセット
  const handleClose = () => {
    setSyncStatus("idle")
    setErrorMessage("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Googleカレンダーに同期</DialogTitle>
          <DialogDescription>
            勤怠記録をGoogleカレンダーに同期します。同期したい記録を選択してください。
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <Button
              onClick={handleAuthClick}
              disabled={isLoading || !isGapiLoaded || !isGsiLoaded}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
              Googleアカウントで認証
            </Button>
            {errorMessage && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="py-4">
            {syncStatus === "success" ? (
              <Alert className="mb-4">
                <Check className="h-4 w-4" />
                <AlertTitle>同期完了</AlertTitle>
                <AlertDescription>選択した勤怠記録がGoogleカレンダーに正常に同期されました。</AlertDescription>
              </Alert>
            ) : syncStatus === "error" ? (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="select-all"
                  checked={selectedRecords.length === completedRecords.length && completedRecords.length > 0}
                  onCheckedChange={toggleAllRecords}
                />
                <Label htmlFor="select-all">すべて選択</Label>
              </div>

              <div className="max-h-[300px] overflow-y-auto border rounded-md p-2">
                {completedRecords.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">完了した勤怠記録がありません</p>
                ) : (
                  completedRecords.map((record) => (
                    <div key={record.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                      <Checkbox
                        id={record.id}
                        checked={selectedRecords.includes(record.id)}
                        onCheckedChange={() => toggleRecordSelection(record.id)}
                      />
                      <Label htmlFor={record.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <span>{record.date}</span>
                          <span className="text-muted-foreground">
                            {record.clockInTime} - {record.clockOutTime}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {record.title || "タイトルなし"} ({record.workingHours.toFixed(2)}時間)
                        </div>
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          {isAuthenticated && (
            <Button
              onClick={syncToGoogleCalendar}
              disabled={isLoading || selectedRecords.length === 0 || syncStatus === "success"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  同期中...
                </>
              ) : (
                "同期する"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
