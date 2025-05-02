"use client"
import { useState } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Download, Calendar } from "lucide-react"
import AttendanceActions from "./attendance-actions"
import AttendanceTable from "./attendance-table"
import EditRecordDialog from "./edit-record-dialog"
import GoogleCalendarSync from "./google-calendar-sync"
import { useAttendanceData } from "@/app/hooks/use-attendance-data"
import { exportToICalendar } from "@/app/utils/ical-export"
import type { AttendanceRecord } from "@/app/types/attendance"

export default function AttendanceTracker() {
  const { attendanceRecords, currentMonth, setCurrentMonth, clockIn, clockOut, updateRecord, exportToJson } =
    useAttendanceData()

  // 編集用の状態
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [recordToEdit, setRecordToEdit] = useState<AttendanceRecord | null>(null)

  // Google Calendar同期ダイアログの状態
  const [isGoogleCalendarDialogOpen, setIsGoogleCalendarDialogOpen] = useState(false)

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleExportIcal = () => {
    exportToICalendar(attendanceRecords)
  }

  const handleExportJson = () => {
    exportToJson()
  }

  // 編集ダイアログを開く
  const handleEdit = (id: string) => {
    const record = attendanceRecords.find((record) => record.id === id)
    if (record) {
      setRecordToEdit(record)
      setIsEditDialogOpen(true)
    }
  }

  // 編集内容を保存
  const handleSaveEdit = (updatedRecord: AttendanceRecord) => {
    updateRecord(updatedRecord)
    setIsEditDialogOpen(false)
    setRecordToEdit(null)
  }

  // 編集をキャンセル
  const handleCancelEdit = () => {
    setIsEditDialogOpen(false)
    setRecordToEdit(null)
  }

  // Google Calendar同期ダイアログを開く
  const handleOpenGoogleCalendarDialog = () => {
    setIsGoogleCalendarDialogOpen(true)
  }

  const formattedMonth = format(currentMonth, "yyyy年MM月", { locale: ja })

  // 現在の月のレコードをフィルタリング
  const filteredRecords = attendanceRecords.filter((record) => {
    const recordDate = new Date(record.date.replace(/\//g, "-"))
    return recordDate.getMonth() === currentMonth.getMonth() && recordDate.getFullYear() === currentMonth.getFullYear()
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>勤怠アクション</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceActions onClockIn={clockIn} onClockOut={clockOut} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>勤怠記録</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">{formattedMonth}</span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AttendanceTable records={filteredRecords} onEdit={handleEdit} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExportIcal} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              iCalでエクスポート
            </Button>
            <Button variant="outline" onClick={handleExportJson} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              JSONでエクスポート
            </Button>
            <Button variant="outline" onClick={handleOpenGoogleCalendarDialog} className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Googleカレンダーに同期
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 編集ダイアログ */}
      <EditRecordDialog
        record={recordToEdit}
        open={isEditDialogOpen}
        onClose={handleCancelEdit}
        onSave={handleSaveEdit}
      />

      {/* Google Calendar同期ダイアログ */}
      <GoogleCalendarSync
        open={isGoogleCalendarDialogOpen}
        onClose={() => setIsGoogleCalendarDialogOpen(false)}
        records={attendanceRecords}
      />
    </div>
  )
}
